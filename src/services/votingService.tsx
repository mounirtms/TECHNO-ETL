/**
 * Voting Service - API client for feature voting and roadmap functionality
 */
import axios from 'axios';

const API_BASE_URL = '/api/voting';

/**
 * Service class for handling voting-related API calls
 */
class VotingService {
  /**
   * Get all features with their vote counts
   * @param {Object} filters - Optional filters (status, category, etc.)
   * @returns {Promise<Array>} Array of features
   */
  async getFeatures(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/features`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching features:', error);
      throw new Error('Failed to fetch features');
    }
  }

  /**
   * Create a new feature request
   * @param {Object} featureData - Feature data (title, description, category, etc.)
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(featureData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/features`, featureData);
      return response.data;
    } catch (error) {
      console.error('Error creating feature:', error);
      throw new Error('Failed to create feature');
    }
  }

  /**
   * Vote for a feature
   * @param {number} featureId - Feature ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Vote result
   */
  async voteForFeature(featureId, userId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/features/${featureId}/vote`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error voting for feature:', error);
      throw new Error('Failed to vote for feature');
    }
  }

  /**
   * Remove vote from a feature
   * @param {number} featureId - Feature ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Remove vote result
   */
  async removeVote(featureId, userId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/features/${featureId}/vote`, {
        data: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing vote:', error);
      throw new Error('Failed to remove vote');
    }
  }

  /**
   * Get user's votes
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of user's votes
   */
  async getUserVotes(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/votes/user`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user votes:', error);
      throw new Error('Failed to fetch user votes');
    }
  }

  /**
   * Get roadmap data
   * @returns {Promise<Object>} Roadmap data with features grouped by status
   */
  async getRoadmap() {
    try {
      const response = await axios.get(`${API_BASE_URL}/roadmap`);
      return response.data;
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      throw new Error('Failed to fetch roadmap');
    }
  }

  /**
   * Update feature status (admin only)
   * @param {number} featureId - Feature ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data (target_release, etc.)
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeatureStatus(featureId, status, additionalData = {}) {
    try {
      const response = await axios.put(`${API_BASE_URL}/features/${featureId}/status`, {
        status,
        ...additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating feature status:', error);
      throw new Error('Failed to update feature status');
    }
  }

  /**
   * Get release notes
   * @param {Object} filters - Optional filters (published, version, etc.)
   * @returns {Promise<Array>} Array of release notes
   */
  async getReleaseNotes(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/release-notes`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching release notes:', error);
      throw new Error('Failed to fetch release notes');
    }
  }
}

// Export singleton instance
export default new VotingService();