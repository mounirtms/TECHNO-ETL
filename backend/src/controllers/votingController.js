/**
 * Voting Controller - Professional voting system endpoints
 * Handles HTTP requests for voting functionality with SQL backend
 */

import votingService from '../services/votingService.js';

class VotingController {
  /**
   * Get all voting features with pagination and filtering
   * GET /api/taskfeatures
   */
  async getFeatures(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        pageSize: parseInt(req.query.pageSize) || 25,
        category: req.query.category ? parseInt(req.query.category) : null,
        status: req.query.status,
        priority: req.query.priority,
        sortBy: req.query.sortBy || 'vote_count',
        sortOrder: req.query.sortOrder || 'DESC',
        search: req.query.search
      };

      const result = await votingService.getFeatures(options);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages
        }
      });

    } catch (error) {
      console.error('Error in getFeatures:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voting features',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get feature by ID
   * GET /api/taskfeatures/:id
   */
  async getFeatureById(req, res) {
    try {
      const { id } = req.params;
      const feature = await votingService.getFeatureById(parseInt(id));

      res.json({
        success: true,
        data: feature
      });

    } catch (error) {
      console.error('Error in getFeatureById:', error);
      const statusCode = error.message === 'Feature not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create new voting feature
   * POST /api/taskfeatures
   */
  async createFeature(req, res) {
    try {
      const userId = req.user?.id || req.body.created_by || 'anonymous';
      const feature = await votingService.createFeature(req.body, userId);

      res.status(201).json({
        success: true,
        data: feature,
        message: 'Feature created successfully'
      });

    } catch (error) {
      console.error('Error in createFeature:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create feature',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vote for a feature
   * POST /api/taskfeatures/:id/vote
   */
  async voteForFeature(req, res) {
    try {
      const { id } = req.params;
      const { vote_type = 'upvote' } = req.body;
      const userId = req.user?.id || req.body.user_id || 'anonymous';
      const userEmail = req.user?.email || req.body.user_email;
      const userName = req.user?.name || req.body.user_name || 'Anonymous User';

      const vote = await votingService.voteForFeature(
        parseInt(id),
        userId,
        userEmail,
        userName,
        vote_type
      );

      res.json({
        success: true,
        data: vote,
        message: 'Vote recorded successfully'
      });

    } catch (error) {
      console.error('Error in voteForFeature:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get voting categories
   * GET /api/taskcategories
   */
  async getCategories(req, res) {
    try {
      const categories = await votingService.getCategories();

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Error in getCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get voting statistics
   * GET /api/taskstats
   */
  async getVotingStats(req, res) {
    try {
      const stats = await votingService.getVotingStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error in getVotingStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch voting statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user votes
   * GET /api/taskuser-votes
   */
  async getUserVotes(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'anonymous';
      const featureIds = req.query.feature_ids ? 
        req.query.feature_ids.split(',').map(id => parseInt(id)) : null;

      const votes = await votingService.getUserVotes(userId, featureIds);

      res.json({
        success: true,
        data: votes
      });

    } catch (error) {
      console.error('Error in getUserVotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user votes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new VotingController();
