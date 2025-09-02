// noinspection Annotator

/**
 * Voting Service - Professional SQL-based voting system
 * Handles all voting operations with MDM database integration
 */

import sql from 'mssql';
import { getDbConnection } from '../config/database.js';
import logger from '../utils/logger.js';

class VotingService {
  constructor() {
    this.tableName = 'voting_features';
    this.categoriesTable = 'voting_categories';
    this.votesTable = 'user_votes';
    this.commentsTable = 'feature_comments';
    this.settingsTable = 'voting_settings';
  }

  /**
   * Get all voting features with pagination and filtering
   */
  async getFeatures(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 25,
        category = null,
        status = null,
        priority = null,
        sortBy = 'vote_count',
        sortOrder = 'DESC',
        search = null
      } = options;

      const pool = await getDbConnection();
      const offset = (page - 1) * pageSize;

      let whereClause = 'WHERE vf.is_active = 1';
      const params = [];

      if (category) {
        whereClause += ' AND vf.category_id = @category';
        params.push({ name: 'category', type: sql.Int, value: category });
      }

      if (status) {
        whereClause += ' AND vf.status = @status';
        params.push({ name: 'status', type: sql.NVarChar, value: status });
      }

      if (priority) {
        whereClause += ' AND vf.priority = @priority';
        params.push({ name: 'priority', type: sql.NVarChar, value: priority });
      }

      if (search) {
        whereClause += ' AND (vf.title LIKE @search OR vf.description LIKE @search)';
        params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
      }

      const query = `
        SELECT 
          vf.*,
          vc.name as category_name,
          vc.icon as category_icon,
          vc.color as category_color,
          (SELECT COUNT(*) FROM ${this.commentsTable} WHERE feature_id = vf.id) as comment_count
        FROM ${this.tableName} vf
        JOIN ${this.categoriesTable} vc ON vf.category_id = vc.id
        ${whereClause}
        ORDER BY ${this.getSortColumn(sortBy)} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.tableName} vf
        JOIN ${this.categoriesTable} vc ON vf.category_id = vc.id
        ${whereClause}
      `;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      request.input('offset', sql.Int, offset);
      request.input('pageSize', sql.Int, pageSize);

      const [result, countResult] = await Promise.all([
        request.query(query),
        request.query(countQuery)
      ]);

      return {
        data: result.recordset,
        total: countResult.recordset[0].total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
      };

    } catch (error) {
      logger.error('Error fetching voting features:', error);
      throw new Error('Failed to fetch voting features');
    }
  }

  /**
   * Get feature by ID with detailed information
   */
  async getFeatureById(id) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        SELECT 
          vf.*,
          vc.name as category_name,
          vc.icon as category_icon,
          vc.color as category_color
        FROM ${this.tableName} vf
        JOIN ${this.categoriesTable} vc ON vf.category_id = vc.id
        WHERE vf.id = @id AND vf.is_active = 1
      `;

      request.input('id', sql.Int, id);
      const result = await request.query(query);

      if (result.recordset.length === 0) {
        throw new Error('Feature not found');
      }

      return result.recordset[0];
    } catch (error) {
      logger.error('Error fetching feature by ID:', error);
      throw error;
    }
  }

  /**
   * Create new voting feature
   */
  async createFeature(featureData, userId) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        INSERT INTO ${this.tableName} (
          title, description, category_id, priority, status, complexity,
          estimated_hours, business_value, technical_requirements, created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @category_id, @priority, @status, @complexity,
          @estimated_hours, @business_value, @technical_requirements, @created_by
        )
      `;

      request.input('title', sql.NVarChar, featureData.title);
      request.input('description', sql.NVarChar, featureData.description);
      request.input('category_id', sql.Int, featureData.category_id);
      request.input('priority', sql.NVarChar, featureData.priority || 'Medium');
      request.input('status', sql.NVarChar, featureData.status || 'Proposed');
      request.input('complexity', sql.NVarChar, featureData.complexity || 'Medium');
      request.input('estimated_hours', sql.Int, featureData.estimated_hours);
      request.input('business_value', sql.NVarChar, featureData.business_value);
      request.input('technical_requirements', sql.NVarChar, featureData.technical_requirements);
      request.input('created_by', sql.NVarChar, userId);

      const result = await request.query(query);
      return result.recordset[0];

    } catch (error) {
      logger.error('Error creating feature:', error);
      throw new Error('Failed to create feature');
    }
  }

  /**
   * Update voting feature
   */
  async updateFeature(id, featureData, userId) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const updateFields = [];
      const params = [{ name: 'id', type: sql.Int, value: id }];

      // Build dynamic update query
      Object.keys(featureData).forEach(key => {
        if (featureData[key] !== undefined) {
          updateFields.push(`${key} = @${key}`);
          params.push({
            name: key,
            type: this.getSqlType(key),
            value: featureData[key]
          });
        }
      });

      updateFields.push('updated_by = @updated_by');
      updateFields.push('updated_at = GETDATE()');
      params.push({ name: 'updated_by', type: sql.NVarChar, value: userId });

      const query = `
        UPDATE ${this.tableName}
        SET ${updateFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
      `;

      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      return result.recordset[0];

    } catch (error) {
      logger.error('Error updating feature:', error);
      throw new Error('Failed to update feature');
    }
  }

  /**
   * Vote for a feature
   */
  async voteForFeature(featureId, userId, userEmail, userName, voteType = 'upvote') {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      // Use MERGE to handle upsert operation
      const query = `
        MERGE ${this.votesTable} AS target
        USING (SELECT @feature_id as feature_id, @user_id as user_id) AS source
        ON target.feature_id = source.feature_id AND target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET vote_type = @vote_type, updated_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (feature_id, user_id, user_email, user_name, vote_type)
          VALUES (@feature_id, @user_id, @user_email, @user_name, @vote_type)
        OUTPUT $action, INSERTED.*;
      `;

      request.input('feature_id', sql.Int, featureId);
      request.input('user_id', sql.NVarChar, userId);
      request.input('user_email', sql.NVarChar, userEmail);
      request.input('user_name', sql.NVarChar, userName);
      request.input('vote_type', sql.NVarChar, voteType);

      const result = await request.query(query);
      return result.recordset[0];

    } catch (error) {
      logger.error('Error voting for feature:', error);
      throw new Error('Failed to vote for feature');
    }
  }

  /**
   * Remove vote from feature
   */
  async removeVote(featureId, userId) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        DELETE FROM ${this.votesTable}
        WHERE feature_id = @feature_id AND user_id = @user_id
      `;

      request.input('feature_id', sql.Int, featureId);
      request.input('user_id', sql.NVarChar, userId);

      await request.query(query);
      return { success: true };

    } catch (error) {
      logger.error('Error removing vote:', error);
      throw new Error('Failed to remove vote');
    }
  }

  /**
   * Get user votes for features
   */
  async getUserVotes(userId, featureIds = null) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      let whereClause = 'WHERE user_id = @user_id';
      request.input('user_id', sql.NVarChar, userId);

      if (featureIds && featureIds.length > 0) {
        whereClause += ` AND feature_id IN (${featureIds.map((_, i) => `@fid${i}`).join(',')})`;
        featureIds.forEach((id, index) => {
          request.input(`fid${index}`, sql.Int, id);
        });
      }

      const query = `
        SELECT feature_id, vote_type, created_at
        FROM ${this.votesTable}
        ${whereClause}
      `;

      const result = await request.query(query);
      return result.recordset;

    } catch (error) {
      logger.error('Error fetching user votes:', error);
      throw new Error('Failed to fetch user votes');
    }
  }

  /**
   * Get voting categories
   */
  async getCategories() {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        SELECT *
        FROM ${this.categoriesTable}
        WHERE is_active = 1
        ORDER BY sort_order, name
      `;

      const result = await request.query(query);
      return result.recordset;

    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get voting statistics
   */
  async getVotingStats() {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const result = await request.execute('sp_GetVotingStats');
      return result.recordset;

    } catch (error) {
      logger.error('Error fetching voting stats:', error);
      throw new Error('Failed to fetch voting statistics');
    }
  }

  /**
   * Helper method to get SQL column for sorting
   */
  getSortColumn(sortBy) {
    const sortColumns = {
      'vote_count': 'vf.vote_count',
      'created_at': 'vf.created_at',
      'updated_at': 'vf.updated_at',
      'title': 'vf.title',
      'priority': 'vf.priority',
      'status': 'vf.status'
    };
    return sortColumns[sortBy] || 'vf.vote_count';
  }

  /**
   * Helper method to get SQL type for parameters
   */
  getSqlType(fieldName) {
    const typeMap = {
      'category_id': sql.Int,
      'estimated_hours': sql.Int,
      'vote_count': sql.Int,
      'is_active': sql.Bit
    };
    return typeMap[fieldName] || sql.NVarChar;
  }
}

  /**
   * Add comment to feature
   */
  async addComment(featureId, userId, userName, userEmail, comment, isAdminResponse = false) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        INSERT INTO ${this.commentsTable} (
          feature_id, user_id, user_name, user_email, comment, is_admin_response
        )
        OUTPUT INSERTED.*
        VALUES (@feature_id, @user_id, @user_name, @user_email, @comment, @is_admin_response)
      `;

      request.input('feature_id', sql.Int, featureId);
      request.input('user_id', sql.NVarChar, userId);
      request.input('user_name', sql.NVarChar, userName);
      request.input('user_email', sql.NVarChar, userEmail);
      request.input('comment', sql.NVarChar, comment);
      request.input('is_admin_response', sql.Bit, isAdminResponse);

      const result = await request.query(query);
      return result.recordset[0];

    } catch (error) {
      logger.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Get comments for feature
   */
  async getFeatureComments(featureId) {
    try {
      const pool = await getDbConnection();
      const request = pool.request();

      const query = `
        SELECT *
        FROM ${this.commentsTable}
        WHERE feature_id = @feature_id AND is_approved = 1
        ORDER BY created_at ASC
      `;

      request.input('feature_id', sql.Int, featureId);
      const result = await request.query(query);
      return result.recordset;

    } catch (error) {
      logger.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }
}

export default new VotingService();
