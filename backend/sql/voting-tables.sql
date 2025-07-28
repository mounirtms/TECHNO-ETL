-- =====================================================
-- TECHNO-ETL Voting System Database Schema
-- Professional Voting & Feature Request Management
-- =====================================================

USE [MDM_Database];
GO

-- =====================================================
-- 1. VOTING CATEGORIES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='voting_categories' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[voting_categories] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NOT NULL,
        [description] NVARCHAR(500),
        [icon] NVARCHAR(50),
        [color] NVARCHAR(20),
        [sort_order] INT DEFAULT 0,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        [created_by] NVARCHAR(100),
        [updated_by] NVARCHAR(100)
    );
    
    -- Insert default categories
    INSERT INTO [dbo].[voting_categories] ([name], [description], [icon], [color], [sort_order]) VALUES
    ('Feature Request', 'New feature suggestions and enhancements', 'Lightbulb', '#2196F3', 1),
    ('Bug Report', 'Bug reports and issue tracking', 'BugReport', '#F44336', 2),
    ('Performance', 'Performance improvements and optimizations', 'Speed', '#FF9800', 3),
    ('UI/UX', 'User interface and experience improvements', 'Palette', '#9C27B0', 4),
    ('Integration', 'Third-party integrations and APIs', 'Link', '#4CAF50', 5),
    ('Security', 'Security enhancements and fixes', 'Security', '#795548', 6);
    
    PRINT 'Created voting_categories table with default data';
END
GO

-- =====================================================
-- 2. VOTING FEATURES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='voting_features' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[voting_features] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX),
        [category_id] INT NOT NULL,
        [priority] NVARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
        [status] NVARCHAR(20) DEFAULT 'Proposed', -- Proposed, In Review, Approved, In Development, Testing, Completed, Rejected
        [complexity] NVARCHAR(20) DEFAULT 'Medium', -- Simple, Medium, Complex, Very Complex
        [estimated_hours] INT,
        [vote_count] INT DEFAULT 0,
        [implementation_notes] NVARCHAR(MAX),
        [business_value] NVARCHAR(MAX),
        [technical_requirements] NVARCHAR(MAX),
        [target_version] NVARCHAR(50),
        [assigned_to] NVARCHAR(100),
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        [created_by] NVARCHAR(100),
        [updated_by] NVARCHAR(100),
        
        CONSTRAINT FK_voting_features_category 
            FOREIGN KEY ([category_id]) REFERENCES [dbo].[voting_categories]([id])
    );
    
    -- Create indexes for performance
    CREATE INDEX IX_voting_features_category ON [dbo].[voting_features]([category_id]);
    CREATE INDEX IX_voting_features_status ON [dbo].[voting_features]([status]);
    CREATE INDEX IX_voting_features_priority ON [dbo].[voting_features]([priority]);
    CREATE INDEX IX_voting_features_votes ON [dbo].[voting_features]([vote_count] DESC);
    
    PRINT 'Created voting_features table with indexes';
END
GO

-- =====================================================
-- 3. USER VOTES TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_votes' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[user_votes] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [feature_id] INT NOT NULL,
        [user_id] NVARCHAR(100) NOT NULL,
        [user_email] NVARCHAR(200),
        [user_name] NVARCHAR(200),
        [vote_type] NVARCHAR(20) DEFAULT 'upvote', -- upvote, downvote
        [comment] NVARCHAR(1000),
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_user_votes_feature 
            FOREIGN KEY ([feature_id]) REFERENCES [dbo].[voting_features]([id]) ON DELETE CASCADE,
        CONSTRAINT UQ_user_votes_unique 
            UNIQUE ([feature_id], [user_id])
    );
    
    -- Create indexes
    CREATE INDEX IX_user_votes_feature ON [dbo].[user_votes]([feature_id]);
    CREATE INDEX IX_user_votes_user ON [dbo].[user_votes]([user_id]);
    
    PRINT 'Created user_votes table with constraints and indexes';
END
GO

-- =====================================================
-- 4. FEATURE COMMENTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='feature_comments' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[feature_comments] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [feature_id] INT NOT NULL,
        [user_id] NVARCHAR(100) NOT NULL,
        [user_name] NVARCHAR(200),
        [user_email] NVARCHAR(200),
        [comment] NVARCHAR(MAX) NOT NULL,
        [parent_comment_id] INT NULL, -- For threaded comments
        [is_admin_response] BIT DEFAULT 0,
        [is_approved] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_feature_comments_feature 
            FOREIGN KEY ([feature_id]) REFERENCES [dbo].[voting_features]([id]) ON DELETE CASCADE,
        CONSTRAINT FK_feature_comments_parent 
            FOREIGN KEY ([parent_comment_id]) REFERENCES [dbo].[feature_comments]([id])
    );
    
    -- Create indexes
    CREATE INDEX IX_feature_comments_feature ON [dbo].[feature_comments]([feature_id]);
    CREATE INDEX IX_feature_comments_user ON [dbo].[feature_comments]([user_id]);
    CREATE INDEX IX_feature_comments_parent ON [dbo].[feature_comments]([parent_comment_id]);
    
    PRINT 'Created feature_comments table with threaded comment support';
END
GO

-- =====================================================
-- 5. VOTING SETTINGS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='voting_settings' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[voting_settings] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [setting_key] NVARCHAR(100) NOT NULL UNIQUE,
        [setting_value] NVARCHAR(MAX),
        [setting_type] NVARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
        [description] NVARCHAR(500),
        [category] NVARCHAR(100) DEFAULT 'general',
        [is_public] BIT DEFAULT 0,
        [created_at] DATETIME2 DEFAULT GETDATE(),
        [updated_at] DATETIME2 DEFAULT GETDATE()
    );
    
    -- Insert default settings
    INSERT INTO [dbo].[voting_settings] ([setting_key], [setting_value], [setting_type], [description], [category]) VALUES
    ('voting_enabled', 'true', 'boolean', 'Enable/disable voting system', 'general'),
    ('max_votes_per_user', '50', 'number', 'Maximum votes per user', 'limits'),
    ('allow_anonymous_voting', 'false', 'boolean', 'Allow anonymous users to vote', 'security'),
    ('require_comment_approval', 'false', 'boolean', 'Require admin approval for comments', 'moderation'),
    ('notification_email', 'admin@techno-etl.com', 'string', 'Email for voting notifications', 'notifications'),
    ('auto_close_completed', 'true', 'boolean', 'Auto-close completed features', 'automation');
    
    PRINT 'Created voting_settings table with default configuration';
END
GO

-- =====================================================
-- 6. TRIGGERS FOR VOTE COUNT UPDATES
-- =====================================================

-- Trigger to update vote count when votes are added/removed
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_update_vote_count')
    DROP TRIGGER tr_update_vote_count;
GO

CREATE TRIGGER tr_update_vote_count
ON [dbo].[user_votes]
AFTER INSERT, DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update vote counts for affected features
    UPDATE vf
    SET vote_count = (
        SELECT COUNT(*) 
        FROM [dbo].[user_votes] uv 
        WHERE uv.feature_id = vf.id AND uv.vote_type = 'upvote'
    ) - (
        SELECT COUNT(*) 
        FROM [dbo].[user_votes] uv 
        WHERE uv.feature_id = vf.id AND uv.vote_type = 'downvote'
    ),
    updated_at = GETDATE()
    FROM [dbo].[voting_features] vf
    WHERE vf.id IN (
        SELECT DISTINCT feature_id FROM inserted
        UNION
        SELECT DISTINCT feature_id FROM deleted
    );
END
GO

-- =====================================================
-- 7. STORED PROCEDURES
-- =====================================================

-- Get voting statistics
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetVotingStats')
    DROP PROCEDURE sp_GetVotingStats;
GO

CREATE PROCEDURE sp_GetVotingStats
AS
BEGIN
    SELECT 
        'Total Features' as metric,
        COUNT(*) as value
    FROM [dbo].[voting_features]
    WHERE is_active = 1
    
    UNION ALL
    
    SELECT 
        'Total Votes' as metric,
        COUNT(*) as value
    FROM [dbo].[user_votes]
    
    UNION ALL
    
    SELECT 
        'Active Users' as metric,
        COUNT(DISTINCT user_id) as value
    FROM [dbo].[user_votes]
    
    UNION ALL
    
    SELECT 
        'Completed Features' as metric,
        COUNT(*) as value
    FROM [dbo].[voting_features]
    WHERE status = 'Completed' AND is_active = 1;
END
GO

PRINT 'Voting system database schema created successfully!';
PRINT 'Tables created: voting_categories, voting_features, user_votes, feature_comments, voting_settings';
PRINT 'Triggers and stored procedures created for automated vote counting and statistics';
