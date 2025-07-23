/**
 * Voting Routes - API endpoints for feature voting and roadmap functionality
 */
import express from 'express';
import votingController from '../controllers/mockVotingController.js';

const router = express.Router();

// ===== FEATURE ROUTES =====

/**
 * GET /api/voting/features
 * Get all features with vote counts
 * Query params: status, category, priority, limit
 */
router.get('/features', votingController.getFeatures);

/**
 * POST /api/voting/features
 * Create a new feature request
 * Body: { title, description, category, priority, created_by }
 */
router.post('/features', votingController.createFeature);

/**
 * PUT /api/voting/features/:featureId/status
 * Update feature status (admin only)
 * Body: { status, target_release?, estimated_effort? }
 */
router.put('/features/:featureId/status', votingController.updateFeatureStatus);

// ===== VOTING ROUTES =====

/**
 * POST /api/voting/features/:featureId/vote
 * Vote for a feature
 * Body: { userId }
 */
router.post('/features/:featureId/vote', votingController.voteForFeature);

/**
 * DELETE /api/voting/features/:featureId/vote
 * Remove vote from a feature
 * Body: { userId }
 */
router.delete('/features/:featureId/vote', votingController.removeVote);

/**
 * GET /api/voting/votes/user
 * Get user's votes
 * Query params: userId
 */
router.get('/votes/user', votingController.getUserVotes);

// ===== ROADMAP ROUTES =====

/**
 * GET /api/voting/roadmap
 * Get roadmap data with features grouped by status
 */
router.get('/roadmap', votingController.getRoadmap);

/**
 * GET /api/voting/release-notes
 * Get release notes
 * Query params: published, version, limit
 */
router.get('/release-notes', votingController.getReleaseNotes);

// ===== DEMO DATA ROUTES (for testing) =====

/**
 * POST /api/voting/demo/seed
 * Seed demo data for testing (development only)
 */
router.post('/demo/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo endpoints not available in production' });
  }

  try {
    // Create demo features
    const demoFeatures = [
      {
        title: 'Dark Mode Theme',
        description: 'Add a dark mode theme option for better user experience in low-light environments',
        category: 'ui-ux',
        priority: 'medium',
        status: 'proposed',
        created_by: 'demo_user'
      },
      {
        title: 'Advanced Search Filters',
        description: 'Implement advanced filtering options for product search with multiple criteria',
        category: 'features',
        priority: 'high',
        status: 'approved',
        created_by: 'demo_user'
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize grid loading times and implement virtual scrolling for large datasets',
        category: 'performance',
        priority: 'high',
        status: 'in_progress',
        created_by: 'demo_user'
      },
      {
        title: 'Mobile Responsive Design',
        description: 'Improve mobile responsiveness across all grid components and pages',
        category: 'ui-ux',
        priority: 'medium',
        status: 'completed',
        created_by: 'demo_user'
      },
      {
        title: 'Two-Factor Authentication',
        description: 'Add 2FA security feature for enhanced account protection',
        category: 'security',
        priority: 'high',
        status: 'proposed',
        created_by: 'demo_user'
      },
      {
        title: 'API Rate Limiting',
        description: 'Implement intelligent rate limiting to prevent API abuse',
        category: 'security',
        priority: 'medium',
        status: 'completed',
        created_by: 'demo_user'
      }
    ];

    // Create features and add some demo votes
    const createdFeatures = [];
    for (const feature of demoFeatures) {
      const created = await votingController.createFeature({ body: feature }, { 
        json: (data) => createdFeatures.push(data) 
      });
    }

    res.json({ 
      success: true, 
      message: 'Demo data seeded successfully',
      features: createdFeatures.length
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

/**
 * GET /api/voting/demo/status
 * Get demo data status
 */
router.get('/demo/status', async (req, res) => {
  try {
    const features = await votingController.getFeatures({ query: {} }, {
      json: (data) => data
    });

    res.json({
      success: true,
      demo_mode: process.env.NODE_ENV !== 'production',
      features_count: features?.length || 0,
      endpoints: {
        features: '/api/voting/features',
        roadmap: '/api/voting/roadmap',
        vote: '/api/voting/features/:id/vote',
        user_votes: '/api/voting/votes/user'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      demo_mode: process.env.NODE_ENV !== 'production',
      error: error.message
    });
  }
});

export default router;
