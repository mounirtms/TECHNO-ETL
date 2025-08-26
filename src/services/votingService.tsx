/**
 * Voting Service - API client for feature voting and roadmap functionality
 */
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = '/api/voting';

// Type definitions
interface Feature {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  vote_count: number;
  created_at: string;
  created_by: string;
  target_release?: string;
interface Vote {
  id: number;
  feature_id: number;
  user_id: string;
  created_at: string;
interface FeatureFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
interface FeatureData {
  title: string;
  description: string;
  category: string;
  priority: string;
interface RoadmapData {
  planned: Feature[];
  in_progress: Feature[];
  completed: Feature[];
  rejected: Feature[];
interface ReleaseNote {
  id: number;
  version: string;
  release_date: string;
  notes: string;
  published: boolean;
interface AdditionalStatusData {
  target_release?: string;
  notes?: string;
/**
 * Service class for handling voting-related API calls
 */
class VotingService {
  /**
   * Get all features with their vote counts
   * @param filters - Optional filters (status, category, etc.)
   * @returns Array of features
   */
  async getFeatures(filters: FeatureFilters = {}): Promise<Feature[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/features`, {
        params: filters
      });
      return response.data;
    } catch(error: any) {
      console.error('Error fetching features:', error);
      throw new Error('Failed to fetch features');
  /**
   * Create a new feature request
   * @param featureData - Feature data (title, description, category, etc.)
   * @returns Created feature
   */
  async createFeature(featureData: FeatureData): Promise<Feature> {
    try {
      const response = await axios.post(`${API_BASE_URL}/features`, featureData);
      return response.data;
    } catch(error: any) {
      console.error('Error creating feature:', error);
      throw new Error('Failed to create feature');
  /**
   * Vote for a feature
   * @param featureId - Feature ID
   * @param userId - User ID
   * @returns Vote result
   */
  async voteForFeature(featureId: number, userId: string): Promise<Vote> {
    try {
      const response = await axios.post(`${API_BASE_URL}/features/${featureId}/vote`, {
        userId
      });
      return response.data;
    } catch(error: any) {
      console.error('Error voting for feature:', error);
      throw new Error('Failed to vote for feature');
  /**
   * Remove vote from a feature
   * @param featureId - Feature ID
   * @param userId - User ID
   * @returns Remove vote result
   */
  async removeVote(featureId: number, userId: string): Promise<{ success: boolean }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/features/${featureId}/vote`, {
        data: { userId }
      });
      return response.data;
    } catch(error: any) {
      console.error('Error removing vote:', error);
      throw new Error('Failed to remove vote');
  /**
   * Get user's votes
   * @param userId - User ID
   * @returns Array of user's votes
   */
  async getUserVotes(userId: string): Promise<Vote[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/votes/user`, {
        params: { userId }
      });
      return response.data;
    } catch(error: any) {
      console.error('Error fetching user votes:', error);
      throw new Error('Failed to fetch user votes');
  /**
   * Get roadmap data
   * @returns Roadmap data with features grouped by status
   */
  async getRoadmap(): Promise<RoadmapData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/roadmap`);
      return response.data;
    } catch(error: any) {
      console.error('Error fetching roadmap:', error);
      throw new Error('Failed to fetch roadmap');
  /**
   * Update feature status (admin only)
   * @param featureId - Feature ID
   * @param status - New status
   * @param additionalData - Additional data (target_release, etc.)
   * @returns Updated feature
   */
  async updateFeatureStatus(featureId: number, status: string, additionalData: AdditionalStatusData = {}): Promise<Feature> {
    try {
      const response = await axios.put(`${API_BASE_URL}/features/${featureId}/status`, {
        status,
        ...additionalData
      });
      return response.data;
    } catch(error: any) {
      console.error('Error updating feature status:', error);
      throw new Error('Failed to update feature status');
  /**
   * Get release notes
   * @param filters - Optional filters (published, version, etc.)
   * @returns Array of release notes
   */
  async getReleaseNotes(filters: { published?: boolean; version?: string } = {}): Promise<ReleaseNote[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/release-notes`, {
        params: filters
      });
      return response.data;
    } catch(error: any) {
      console.error('Error fetching release notes:', error);
      throw new Error('Failed to fetch release notes');
// Export singleton instance
export default new VotingService();