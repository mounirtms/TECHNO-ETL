/**
 * Voting Controller - Handles feature voting and roadmap API endpoints
 */
import sql from 'mssql';

/**
 * Get all features with vote counts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFeatures = async (req, res) => {
  try {
    const { status, category, priority, limit = 50 } = req.query;
    
    const pool = await sql.connect();
    let query = `
      SELECT 
        f.*,
        COUNT(v.id) as vote_count
      FROM features f
      LEFT JOIN votes v ON f.id = v.feature_id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (status) {
      query += ' AND f.status = @status';
      request.input('status', sql.NVarChar(50), status);
    }
    
    if (category) {
      query += ' AND f.category = @category';
      request.input('category', sql.NVarChar(100), category);
    }
    
    if (priority) {
      query += ' AND f.priority = @priority';
      request.input('priority', sql.NVarChar(20), priority);
    }
    
    query += `
      GROUP BY f.id, f.title, f.description, f.status, f.category, f.priority, 
               f.target_release, f.estimated_effort, f.created_by, f.created_date, f.updated_date
      ORDER BY vote_count DESC, f.created_date DESC
    `;
    
    if (limit) {
      query += ' OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY';
      request.input('limit', sql.Int, parseInt(limit));
    }
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
};

/**
 * Create a new feature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createFeature = async (req, res) => {
  try {
    const { title, description, category = 'general', priority = 'medium', created_by } = req.body;
    
    if (!title || !description || !created_by) {
      return res.status(400).json({ error: 'Title, description, and created_by are required' });
    }
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('category', sql.NVarChar(100), category)
      .input('priority', sql.NVarChar(20), priority)
      .input('createdBy', sql.NVarChar(100), created_by)
      .input('createdDate', sql.DateTime2, new Date())
      .query(`
        INSERT INTO features (title, description, category, priority, created_by, created_date, updated_date)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @category, @priority, @createdBy, @createdDate, @createdDate)
      `);
    
    const newFeature = { ...result.recordset[0], vote_count: 0 };
    res.status(201).json(newFeature);
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
};

/**
 * Vote for a feature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const voteForFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const pool = await sql.connect();
    
    // Check if user already voted
    const existingVote = await pool.request()
      .input('featureId', sql.Int, featureId)
      .input('userId', sql.NVarChar(100), userId)
      .query('SELECT id FROM votes WHERE feature_id = @featureId AND user_id = @userId');
    
    if (existingVote.recordset.length > 0) {
      return res.status(400).json({ error: 'User has already voted for this feature' });
    }
    
    // Add vote
    await pool.request()
      .input('featureId', sql.Int, featureId)
      .input('userId', sql.NVarChar(100), userId)
      .input('createdDate', sql.DateTime2, new Date())
      .query('INSERT INTO votes (feature_id, user_id, created_date) VALUES (@featureId, @userId, @createdDate)');
    
    res.json({ success: true, message: 'Vote added successfully' });
  } catch (error) {
    console.error('Error voting for feature:', error);
    res.status(500).json({ error: 'Failed to vote for feature' });
  }
};

/**
 * Remove vote from a feature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const removeVote = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('featureId', sql.Int, featureId)
      .input('userId', sql.NVarChar(100), userId)
      .query('DELETE FROM votes WHERE feature_id = @featureId AND user_id = @userId');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    
    res.json({ success: true, message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
};

/**
 * Get user's votes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserVotes = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('userId', sql.NVarChar(100), userId)
      .query(`
        SELECT v.*, f.title as feature_title
        FROM votes v
        JOIN features f ON v.feature_id = f.id
        WHERE v.user_id = @userId
        ORDER BY v.created_date DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching user votes:', error);
    res.status(500).json({ error: 'Failed to fetch user votes' });
  }
};

/**
 * Get roadmap data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getRoadmap = async (req, res) => {
  try {
    const pool = await sql.connect();
    
    // Get features grouped by status
    const featuresResult = await pool.request().query(`
      SELECT 
        f.*,
        COUNT(v.id) as vote_count
      FROM features f
      LEFT JOIN votes v ON f.id = v.feature_id
      GROUP BY f.id, f.title, f.description, f.status, f.category, f.priority, 
               f.target_release, f.estimated_effort, f.created_by, f.created_date, f.updated_date
      ORDER BY f.status, vote_count DESC
    `);
    
    // Group features by status
    const byStatus = {};
    const byCategory = {};
    const recentActivity = [];
    
    featuresResult.recordset.forEach(feature => {
      // Group by status
      if (!byStatus[feature.status]) {
        byStatus[feature.status] = [];
      }
      byStatus[feature.status].push(feature);
      
      // Group by category
      if (!byCategory[feature.category]) {
        byCategory[feature.category] = [];
      }
      byCategory[feature.category].push(feature);
      
      // Add to recent activity if updated recently (last 30 days)
      const daysSinceUpdate = (new Date() - new Date(feature.updated_date)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate <= 30) {
        recentActivity.push(feature);
      }
    });
    
    // Sort recent activity by update date
    recentActivity.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    
    const roadmapData = {
      byStatus,
      byCategory,
      recentActivity: recentActivity.slice(0, 10), // Last 10 updates
      totalFeatures: featuresResult.recordset.length,
      summary: {
        proposed: byStatus.proposed?.length || 0,
        approved: byStatus.approved?.length || 0,
        in_progress: byStatus.in_progress?.length || 0,
        completed: byStatus.completed?.length || 0,
        rejected: byStatus.rejected?.length || 0,
        on_hold: byStatus.on_hold?.length || 0
      }
    };
    
    res.json(roadmapData);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
};

/**
 * Update feature status (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateFeatureStatus = async (req, res) => {
  try {
    const { featureId } = req.params;
    const { status, target_release, estimated_effort } = req.body;

    const pool = await sql.connect();
    const result = await pool.request()
      .input('featureId', sql.Int, featureId)
      .input('status', sql.NVarChar(50), status)
      .input('targetRelease', sql.NVarChar(50), target_release || null)
      .input('estimatedEffort', sql.NVarChar(20), estimated_effort || null)
      .input('updatedDate', sql.DateTime2, new Date())
      .query(`
        UPDATE features 
        SET status = @status, 
            target_release = @targetRelease,
            estimated_effort = @estimatedEffort,
            updated_date = @updatedDate
        WHERE id = @featureId;
        
        SELECT * FROM features WHERE id = @featureId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json({
      success: true,
      feature: result.recordset[0]
    });
  } catch (error) {
    console.error('Error updating feature status:', error);
    res.status(500).json({ error: 'Failed to update feature status' });
  }
};

/**
 * Get release notes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getReleaseNotes = async (req, res) => {
  try {
    const { published, version, limit = 10 } = req.query;
    
    const pool = await sql.connect();
    let query = `
      SELECT 
        id,
        version,
        title,
        description,
        release_date,
        release_type,
        features,
        bug_fixes,
        breaking_changes,
        created_by,
        created_date,
        published
      FROM release_notes
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (published !== undefined) {
      query += ' AND published = @published';
      request.input('published', sql.Bit, published === 'true');
    }
    
    if (version) {
      query += ' AND version = @version';
      request.input('version', sql.NVarChar(50), version);
    }
    
    query += ' ORDER BY release_date DESC';
    
    if (limit) {
      query += ' OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY';
      request.input('limit', sql.Int, parseInt(limit));
    }
    
    const result = await request.query(query);
    
    // Parse JSON fields
    const releaseNotes = result.recordset.map(note => ({
      ...note,
      features: note.features ? JSON.parse(note.features) : [],
      bug_fixes: note.bug_fixes ? JSON.parse(note.bug_fixes) : [],
      breaking_changes: note.breaking_changes ? JSON.parse(note.breaking_changes) : []
    }));
    
    res.json(releaseNotes);
  } catch (error) {
    console.error('Error fetching release notes:', error);
    res.status(500).json({ error: 'Failed to fetch release notes' });
  }
};

// Export all functions as default object
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