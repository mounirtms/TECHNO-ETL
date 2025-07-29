/**
 * Bug Bounty Service
 * Manages bug reports, rewards, and tester interactions
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import { database } from '../config/firebase.js';
import { ref, push, set, get, update, query, orderByChild, limitToLast } from 'firebase/database';

// Bug Categories with Reward Multipliers
export const BUG_CATEGORIES = {
  CRITICAL: {
    name: 'Critical',
    description: 'System crashes, data loss, security vulnerabilities',
    baseReward: 500,
    multiplier: 3.0,
    color: '#f44336',
    priority: 1
  },
  HIGH: {
    name: 'High',
    description: 'Major functionality broken, performance issues',
    baseReward: 200,
    multiplier: 2.0,
    color: '#ff9800',
    priority: 2
  },
  MEDIUM: {
    name: 'Medium',
    description: 'Minor functionality issues, UI problems',
    baseReward: 100,
    multiplier: 1.5,
    color: '#2196f3',
    priority: 3
  },
  LOW: {
    name: 'Low',
    description: 'Cosmetic issues, minor improvements',
    baseReward: 50,
    multiplier: 1.0,
    color: '#4caf50',
    priority: 4
  },
  ENHANCEMENT: {
    name: 'Enhancement',
    description: 'Feature requests, usability improvements',
    baseReward: 25,
    multiplier: 0.8,
    color: '#9c27b0',
    priority: 5
  }
};

// Bug Status Types
export const BUG_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CONFIRMED: 'confirmed',
  DUPLICATE: 'duplicate',
  INVALID: 'invalid',
  FIXED: 'fixed',
  REWARDED: 'rewarded'
};

// Quality Scores
export const QUALITY_SCORES = {
  EXCELLENT: { score: 5, multiplier: 1.5, description: 'Excellent report with clear steps' },
  GOOD: { score: 4, multiplier: 1.2, description: 'Good report with adequate details' },
  AVERAGE: { score: 3, multiplier: 1.0, description: 'Average report, some details missing' },
  POOR: { score: 2, multiplier: 0.8, description: 'Poor report, lacks important details' },
  VERY_POOR: { score: 1, multiplier: 0.5, description: 'Very poor report, minimal information' }
};

class BugBountyService {
  constructor() {
    this.bugsRef = ref(database, 'bugBounty/bugs');
    this.testersRef = ref(database, 'bugBounty/testers');
    this.rewardsRef = ref(database, 'bugBounty/rewards');
    this.statsRef = ref(database, 'bugBounty/stats');
  }

  /**
   * Submit a new bug report
   */
  async submitBug(bugData) {
    try {
      const timestamp = Date.now();
      const bugId = `bug_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      
      const bug = {
        id: bugId,
        title: bugData.title,
        description: bugData.description,
        category: bugData.category,
        severity: bugData.severity,
        stepsToReproduce: bugData.stepsToReproduce || [],
        expectedBehavior: bugData.expectedBehavior,
        actualBehavior: bugData.actualBehavior,
        environment: {
          browser: bugData.environment?.browser || navigator.userAgent,
          url: bugData.environment?.url || window.location.href,
          timestamp: new Date().toISOString(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          userAgent: navigator.userAgent
        },
        attachments: bugData.attachments || [],
        tester: {
          id: bugData.testerId,
          name: bugData.testerName,
          email: bugData.testerEmail,
          experience: bugData.testerExperience || 'beginner'
        },
        status: BUG_STATUS.SUBMITTED,
        submittedAt: timestamp,
        updatedAt: timestamp,
        qualityScore: null,
        reward: {
          calculated: this.calculateReward(bugData.category, bugData.severity),
          final: null,
          paid: false
        },
        votes: {
          helpful: 0,
          notHelpful: 0
        },
        comments: []
      };

      // Save to Firebase
      const bugRef = ref(database, `bugBounty/bugs/${bugId}`);
      await set(bugRef, bug);

      // Update tester stats
      await this.updateTesterStats(bugData.testerId, 'submitted');

      // Update global stats
      await this.updateGlobalStats('submitted', bugData.category);

      return { success: true, bugId, bug };
    } catch (error) {
      console.error('Error submitting bug:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate reward based on category and severity
   */
  calculateReward(category, severity) {
    const categoryData = BUG_CATEGORIES[category] || BUG_CATEGORIES.LOW;
    const baseReward = categoryData.baseReward;
    const multiplier = categoryData.multiplier;
    
    // Additional severity multiplier
    const severityMultiplier = {
      'critical': 2.0,
      'high': 1.5,
      'medium': 1.0,
      'low': 0.8
    }[severity] || 1.0;

    return Math.round(baseReward * multiplier * severityMultiplier);
  }

  /**
   * Get all bugs with filtering options
   */
  async getBugs(filters = {}) {
    try {
      const bugsSnapshot = await get(this.bugsRef);
      if (!bugsSnapshot.exists()) {
        return { success: true, bugs: [] };
      }

      let bugs = Object.values(bugsSnapshot.val());

      // Apply filters
      if (filters.category) {
        bugs = bugs.filter(bug => bug.category === filters.category);
      }
      if (filters.status) {
        bugs = bugs.filter(bug => bug.status === filters.status);
      }
      if (filters.testerId) {
        bugs = bugs.filter(bug => bug.tester.id === filters.testerId);
      }

      // Sort by submission date (newest first)
      bugs.sort((a, b) => b.submittedAt - a.submittedAt);

      return { success: true, bugs };
    } catch (error) {
      console.error('Error getting bugs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update bug status and quality score
   */
  async updateBugStatus(bugId, status, qualityScore = null, adminNotes = '') {
    try {
      const bugRef = ref(database, `bugBounty/bugs/${bugId}`);
      const bugSnapshot = await get(bugRef);
      
      if (!bugSnapshot.exists()) {
        return { success: false, error: 'Bug not found' };
      }

      const bug = bugSnapshot.val();
      const updates = {
        status,
        updatedAt: Date.now(),
        adminNotes
      };

      // Calculate final reward if confirming bug
      if (status === BUG_STATUS.CONFIRMED && qualityScore) {
        const qualityData = Object.values(QUALITY_SCORES).find(q => q.score === qualityScore);
        const qualityMultiplier = qualityData?.multiplier || 1.0;
        updates.qualityScore = qualityScore;
        updates['reward/final'] = Math.round(bug.reward.calculated * qualityMultiplier);
      }

      await update(bugRef, updates);

      // Update tester stats
      await this.updateTesterStats(bug.tester.id, status);

      // Update global stats
      await this.updateGlobalStats(status, bug.category);

      return { success: true };
    } catch (error) {
      console.error('Error updating bug status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update tester statistics
   */
  async updateTesterStats(testerId, action) {
    try {
      const testerRef = ref(database, `bugBounty/testers/${testerId}`);
      const testerSnapshot = await get(testerRef);
      
      let stats = testerSnapshot.exists() ? testerSnapshot.val() : {
        id: testerId,
        totalSubmitted: 0,
        totalConfirmed: 0,
        totalRewarded: 0,
        totalEarnings: 0,
        rank: 'Bronze',
        joinedAt: Date.now()
      };

      // Update based on action
      switch (action) {
        case 'submitted':
          stats.totalSubmitted++;
          break;
        case BUG_STATUS.CONFIRMED:
          stats.totalConfirmed++;
          break;
        case BUG_STATUS.REWARDED:
          stats.totalRewarded++;
          break;
      }

      // Calculate rank based on confirmed bugs
      if (stats.totalConfirmed >= 50) stats.rank = 'Platinum';
      else if (stats.totalConfirmed >= 20) stats.rank = 'Gold';
      else if (stats.totalConfirmed >= 10) stats.rank = 'Silver';
      else stats.rank = 'Bronze';

      await set(testerRef, stats);
      return { success: true };
    } catch (error) {
      console.error('Error updating tester stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update global statistics
   */
  async updateGlobalStats(action, category) {
    try {
      const statsSnapshot = await get(this.statsRef);
      let stats = statsSnapshot.exists() ? statsSnapshot.val() : {
        totalBugs: 0,
        totalRewards: 0,
        byCategory: {},
        byStatus: {}
      };

      // Update totals
      if (action === 'submitted') {
        stats.totalBugs++;
      }

      // Update by category
      if (!stats.byCategory[category]) {
        stats.byCategory[category] = 0;
      }
      stats.byCategory[category]++;

      // Update by status
      if (!stats.byStatus[action]) {
        stats.byStatus[action] = 0;
      }
      stats.byStatus[action]++;

      await set(this.statsRef, stats);
      return { success: true };
    } catch (error) {
      console.error('Error updating global stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get leaderboard of top testers
   */
  async getLeaderboard(limit = 10) {
    try {
      const testersSnapshot = await get(this.testersRef);
      if (!testersSnapshot.exists()) {
        return { success: true, leaderboard: [] };
      }

      const testers = Object.values(testersSnapshot.val());
      
      // Sort by total confirmed bugs
      testers.sort((a, b) => b.totalConfirmed - a.totalConfirmed);
      
      return { 
        success: true, 
        leaderboard: testers.slice(0, limit) 
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get bug bounty statistics
   */
  async getStats() {
    try {
      const statsSnapshot = await get(this.statsRef);
      const stats = statsSnapshot.exists() ? statsSnapshot.val() : {
        totalBugs: 0,
        totalRewards: 0,
        byCategory: {},
        byStatus: {}
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new BugBountyService();
