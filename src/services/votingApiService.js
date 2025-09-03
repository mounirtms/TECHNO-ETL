/**
 * Task API Service - Professional task management system frontend service
 * Handles all task-related API calls with SQL backend
 */

import axios from 'axios';

const API_BASE_URL = '/api';

class TaskApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/task`;

    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Voting API Error:', error);

        return Promise.reject(error);
      },
    );
  }

  /**
   * Get all voting features with pagination and filtering
   */
  async getFeatures(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        pageSize: options.pageSize || 25,
        category: options.category,
        status: options.status,
        priority: options.priority,
        sortBy: options.sortBy || 'vote_count',
        sortOrder: options.sortOrder || 'DESC',
        search: options.search,
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await this.api.get('/features', { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch voting features');
    }
  }

  /**
   * Get feature by ID
   */
  async getFeatureById(id) {
    try {
      const response = await this.api.get(`/features/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch feature details');
    }
  }

  /**
   * Create new voting feature
   */
  async createFeature(featureData) {
    try {
      const response = await this.api.post('/features', featureData);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to create feature');
    }
  }

  /**
   * Update voting feature
   */
  async updateFeature(id, featureData) {
    try {
      const response = await this.api.put(`/features/${id}`, featureData);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to update feature');
    }
  }

  /**
   * Vote for a feature
   */
  async voteForFeature(featureId, voteType = 'upvote', userInfo = {}) {
    try {
      const voteData = {
        vote_type: voteType,
        user_id: userInfo.userId || 'anonymous',
        user_email: userInfo.userEmail,
        user_name: userInfo.userName || 'Anonymous User',
      };

      const response = await this.api.post(`/features/${featureId}/vote`, voteData);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to record vote');
    }
  }

  /**
   * Remove vote from feature
   */
  async removeVote(featureId, userInfo = {}) {
    try {
      const response = await this.api.delete(`/features/${featureId}/vote`, {
        data: {
          user_id: userInfo.userId || 'anonymous',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to remove vote');
    }
  }

  /**
   * Get user votes
   */
  async getUserVotes(userId, featureIds = null) {
    try {
      const params = { user_id: userId };

      if (featureIds && featureIds.length > 0) {
        params.feature_ids = featureIds.join(',');
      }

      const response = await this.api.get('/user-votes', { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch user votes');
    }
  }

  /**
   * Get voting categories
   */
  async getCategories() {
    try {
      const response = await this.api.get('/categories');

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch categories');
    }
  }

  /**
   * Get voting statistics
   */
  async getVotingStats() {
    try {
      const response = await this.api.get('/stats');

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch voting statistics');
    }
  }

  /**
   * Add comment to feature
   */
  async addComment(featureId, comment, userInfo = {}) {
    try {
      const commentData = {
        comment,
        user_id: userInfo.userId || 'anonymous',
        user_email: userInfo.userEmail,
        user_name: userInfo.userName || 'Anonymous User',
      };

      const response = await this.api.post(`/features/${featureId}/comments`, commentData);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to add comment');
    }
  }

  /**
   * Get comments for feature
   */
  async getFeatureComments(featureId) {
    try {
      const response = await this.api.get(`/features/${featureId}/comments`);

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch comments');
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || defaultMessage;
      const status = error.response.status;

      return new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      return new Error(error.message || defaultMessage);
    }
  }

  /**
   * Get current user info from localStorage or context
   */
  getCurrentUserInfo() {
    try {
      const userInfo = localStorage.getItem('userInfo');

      if (userInfo) {
        return JSON.parse(userInfo);
      }

      // Fallback to basic info
      return {
        userId: 'anonymous',
        userName: 'Anonymous User',
        userEmail: null,
      };
    } catch (error) {
      console.warn('Failed to get user info:', error);

      return {
        userId: 'anonymous',
        userName: 'Anonymous User',
        userEmail: null,
      };
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchVote(votes) {
    try {
      const promises = votes.map(vote =>
        this.voteForFeature(vote.featureId, vote.voteType, vote.userInfo),
      );

      const results = await Promise.allSettled(promises);

      return results;
    } catch (error) {
      throw this.handleError(error, 'Failed to process batch votes');
    }
  }

  /**
   * Search features with advanced filtering
   */
  async searchFeatures(searchTerm, filters = {}) {
    try {
      const searchOptions = {
        search: searchTerm,
        ...filters,
        pageSize: 50, // Larger page size for search results
      };

      return await this.getFeatures(searchOptions);
    } catch (error) {
      throw this.handleError(error, 'Failed to search features');
    }
  }
}

export default new TaskApiService();
