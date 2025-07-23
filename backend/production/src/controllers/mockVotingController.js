/**
 * Mock Voting Controller - Testing implementation without database
 */

// Mock data store
let mockFeatures = [
  {
    id: 1,
    title: 'Dark Mode Theme',
    description: 'Add a dark mode theme option for better user experience in low-light environments',
    category: 'ui-ux',
    priority: 'medium',
    status: 'proposed',
    created_by: 'demo_user',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    vote_count: 15
  },
  {
    id: 2,
    title: 'Advanced Search Filters',
    description: 'Implement advanced filtering options for product search with multiple criteria',
    category: 'features',
    priority: 'high',
    status: 'approved',
    created_by: 'demo_user',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    vote_count: 23
  },
  {
    id: 3,
    title: 'Performance Optimization',
    description: 'Optimize grid loading times and implement virtual scrolling for large datasets',
    category: 'performance',
    priority: 'high',
    status: 'in_progress',
    created_by: 'demo_user',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    vote_count: 31
  },
  {
    id: 4,
    title: 'Mobile Responsive Design',
    description: 'Improve mobile responsiveness across all grid components and pages',
    category: 'ui-ux',
    priority: 'medium',
    status: 'completed',
    created_by: 'demo_user',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    vote_count: 18
  },
  {
    id: 5,
    title: 'Two-Factor Authentication',
    description: 'Add 2FA security feature for enhanced account protection',
    category: 'security',
    priority: 'high',
    status: 'proposed',
    created_by: 'demo_user',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    vote_count: 27
  }
];

let mockVotes = [
  { id: 1, feature_id: 1, user_id: 'user1', created_date: new Date().toISOString() },
  { id: 2, feature_id: 2, user_id: 'user1', created_date: new Date().toISOString() },
  { id: 3, feature_id: 3, user_id: 'user2', created_date: new Date().toISOString() }
];

/**
 * Get all features with vote counts
 */
export const getFeatures = async (req, res) => {
  try {
    const { status, category, priority, limit = 50 } = req.query;
    
    let filteredFeatures = [...mockFeatures];
    
    if (status) {
      filteredFeatures = filteredFeatures.filter(f => f.status === status);
    }
    
    if (category) {
      filteredFeatures = filteredFeatures.filter(f => f.category === category);
    }
    
    if (priority) {
      filteredFeatures = filteredFeatures.filter(f => f.priority === priority);
    }
    
    // Sort by vote count descending
    filteredFeatures.sort((a, b) => b.vote_count - a.vote_count);
    
    // Apply limit
    if (limit) {
      filteredFeatures = filteredFeatures.slice(0, parseInt(limit));
    }
    
    res.json(filteredFeatures);
  } catch (error) {
    console.error('Error getting features:', error);
    res.status(500).json({ error: 'Failed to get features' });
  }
};

/**
 * Create a new feature request
 */
export const createFeature = async (req, res) => {
  try {
    const { title, description, category, priority, created_by } = req.body;
    
    const newFeature = {
      id: mockFeatures.length + 1,
      title,
      description,
      category,
      priority,
      status: 'proposed',
      created_by,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      vote_count: 0
    };
    
    mockFeatures.push(newFeature);
    
    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
};

/**
 * Vote for a feature
 */
export const voteForFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { userId } = req.body;
    
    // Check if user already voted
    const existingVote = mockVotes.find(v => 
      v.feature_id === parseInt(featureId) && v.user_id === userId
    );
    
    if (existingVote) {
      return res.status(400).json({ error: 'User already voted for this feature' });
    }
    
    // Add vote
    const newVote = {
      id: mockVotes.length + 1,
      feature_id: parseInt(featureId),
      user_id: userId,
      created_date: new Date().toISOString()
    };
    
    mockVotes.push(newVote);
    
    // Update vote count
    const feature = mockFeatures.find(f => f.id === parseInt(featureId));
    if (feature) {
      feature.vote_count += 1;
    }
    
    res.json({ success: true, message: 'Vote added successfully' });
  } catch (error) {
    console.error('Error voting for feature:', error);
    res.status(500).json({ error: 'Failed to vote for feature' });
  }
};

/**
 * Remove vote from a feature
 */
export const removeVote = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { userId } = req.body;
    
    const voteIndex = mockVotes.findIndex(v => 
      v.feature_id === parseInt(featureId) && v.user_id === userId
    );
    
    if (voteIndex === -1) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    
    // Remove vote
    mockVotes.splice(voteIndex, 1);
    
    // Update vote count
    const feature = mockFeatures.find(f => f.id === parseInt(featureId));
    if (feature) {
      feature.vote_count = Math.max(0, feature.vote_count - 1);
    }
    
    res.json({ success: true, message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
};

/**
 * Get user's votes
 */
export const getUserVotes = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const userVotes = mockVotes.filter(v => v.user_id === userId);
    
    res.json(userVotes);
  } catch (error) {
    console.error('Error getting user votes:', error);
    res.status(500).json({ error: 'Failed to get user votes' });
  }
};

/**
 * Get roadmap data
 */
export const getRoadmap = async (req, res) => {
  try {
    const byStatus = {
      proposed: mockFeatures.filter(f => f.status === 'proposed'),
      approved: mockFeatures.filter(f => f.status === 'approved'),
      in_progress: mockFeatures.filter(f => f.status === 'in_progress'),
      completed: mockFeatures.filter(f => f.status === 'completed')
    };
    
    const byCategory = {};
    mockFeatures.forEach(feature => {
      if (!byCategory[feature.category]) {
        byCategory[feature.category] = [];
      }
      byCategory[feature.category].push(feature);
    });
    
    const roadmapData = {
      byStatus,
      byCategory,
      recentActivity: mockFeatures.slice(0, 5),
      totalFeatures: mockFeatures.length,
      summary: {
        proposed: byStatus.proposed.length,
        approved: byStatus.approved.length,
        in_progress: byStatus.in_progress.length,
        completed: byStatus.completed.length,
        rejected: 0,
        on_hold: 0
      }
    };
    
    res.json(roadmapData);
  } catch (error) {
    console.error('Error getting roadmap:', error);
    res.status(500).json({ error: 'Failed to get roadmap' });
  }
};

/**
 * Update feature status
 */
export const updateFeatureStatus = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { status, target_release, estimated_effort } = req.body;
    
    const feature = mockFeatures.find(f => f.id === parseInt(featureId));
    
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    feature.status = status;
    if (target_release) feature.target_release = target_release;
    if (estimated_effort) feature.estimated_effort = estimated_effort;
    feature.updated_date = new Date().toISOString();
    
    res.json(feature);
  } catch (error) {
    console.error('Error updating feature status:', error);
    res.status(500).json({ error: 'Failed to update feature status' });
  }
};

/**
 * Get release notes
 */
export const getReleaseNotes = async (req, res) => {
  try {
    const releaseNotes = [
      {
        id: 1,
        version: '1.2.0',
        title: 'Grid Performance Improvements',
        content: 'Implemented virtual scrolling and optimized data loading for better performance.',
        published: true,
        published_date: new Date().toISOString()
      },
      {
        id: 2,
        version: '1.1.0',
        title: 'Mobile Responsiveness',
        content: 'Enhanced mobile experience across all grid components.',
        published: true,
        published_date: new Date().toISOString()
      }
    ];
    
    res.json(releaseNotes);
  } catch (error) {
    console.error('Error getting release notes:', error);
    res.status(500).json({ error: 'Failed to get release notes' });
  }
};

const votingController = {
  getFeatures,
  createFeature,
  voteForFeature,
  removeVote,
  getUserVotes,
  getRoadmap,
  updateFeatureStatus,
  getReleaseNotes
};

export default votingController;
