-- =====================================================
-- TECHNO-ETL Voting System Sample Data
-- Professional sample data for testing and demonstration
-- =====================================================

USE [MDM_Database];
GO

-- =====================================================
-- SAMPLE VOTING FEATURES
-- =====================================================

-- Clear existing sample data (optional)
-- DELETE FROM [dbo].[feature_comments];
-- DELETE FROM [dbo].[user_votes];
-- DELETE FROM [dbo].[voting_features];

-- Insert sample features
INSERT INTO [dbo].[voting_features] (
    [title], [description], [category_id], [priority], [status], [complexity], 
    [estimated_hours], [business_value], [technical_requirements], [created_by]
) VALUES

-- Feature Requests
('Advanced Data Export Options', 
'Add support for Excel, PDF, and CSV export with custom formatting options and scheduling capabilities.',
1, 'High', 'In Review', 'Medium', 40,
'Improve user productivity by 30% and reduce manual report generation time.',
'Implement export service with multiple format support, background processing, and email delivery.',
'admin'),

('Real-time Dashboard Updates', 
'Implement WebSocket connections for real-time dashboard updates without page refresh.',
1, 'High', 'Approved', 'Complex', 80,
'Enhanced user experience with live data updates, reducing need for manual refreshes.',
'WebSocket implementation, real-time data streaming, optimized database queries.',
'admin'),

('Mobile Responsive Design', 
'Optimize the application for mobile devices with touch-friendly interface and responsive layouts.',
4, 'Medium', 'In Development', 'Complex', 120,
'Expand user base to mobile users, improve accessibility and user satisfaction.',
'CSS Grid/Flexbox implementation, touch gesture support, mobile-first design approach.',
'admin'),

('Advanced Search & Filtering', 
'Implement global search with advanced filtering, sorting, and saved search preferences.',
1, 'Medium', 'Proposed', 'Medium', 60,
'Improve data discovery and user efficiency by 40%.',
'Elasticsearch integration, advanced query builder, user preference storage.',
'user_manager'),

-- Bug Reports
('Fix Memory Leak in Data Grid', 
'Resolve memory leak issue when loading large datasets in the data grid component.',
2, 'Critical', 'In Development', 'Medium', 24,
'Prevent application crashes and improve stability for large data operations.',
'Memory profiling, component lifecycle optimization, virtual scrolling improvements.',
'developer'),

('Resolve Login Session Timeout', 
'Fix issue where user sessions expire unexpectedly during active use.',
2, 'High', 'Testing', 'Simple', 16,
'Improve user experience and reduce login interruptions.',
'Session management review, token refresh implementation, activity tracking.',
'developer'),

-- Performance Improvements
('Database Query Optimization', 
'Optimize slow-running queries and implement better indexing strategies.',
3, 'High', 'Approved', 'Medium', 32,
'Reduce page load times by 50% and improve overall application performance.',
'Query analysis, index optimization, database performance tuning.',
'dba'),

('Implement Caching Layer', 
'Add Redis caching for frequently accessed data and API responses.',
3, 'Medium', 'Proposed', 'Medium', 48,
'Reduce database load and improve response times by 60%.',
'Redis implementation, cache invalidation strategies, performance monitoring.',
'architect'),

-- UI/UX Improvements
('Dark Mode Theme', 
'Implement dark mode theme option with user preference storage.',
4, 'Low', 'Proposed', 'Simple', 24,
'Improve user experience and reduce eye strain for extended usage.',
'CSS custom properties, theme switching logic, user preference persistence.',
'designer'),

('Enhanced Data Visualization', 
'Add interactive charts with drill-down capabilities and custom chart builder.',
4, 'Medium', 'In Review', 'Complex', 72,
'Improve data insights and business intelligence capabilities.',
'Chart.js/D3.js integration, interactive features, custom chart configurations.',
'analyst'),

-- Integration Features
('Magento 2.4 Compatibility', 
'Update Magento integration to support latest version 2.4 with new APIs.',
5, 'Critical', 'In Development', 'Complex', 96,
'Maintain compatibility with latest Magento versions and access new features.',
'API updates, authentication changes, testing with Magento 2.4.',
'integration_lead'),

('SAP Integration Module', 
'Develop integration module for SAP ERP systems with real-time data sync.',
5, 'High', 'Proposed', 'Very Complex', 200,
'Expand market reach to SAP customers and provide comprehensive ERP integration.',
'SAP API integration, data mapping, real-time synchronization, error handling.',
'enterprise_architect'),

-- Security Enhancements
('Two-Factor Authentication', 
'Implement 2FA with support for authenticator apps and SMS verification.',
6, 'High', 'Approved', 'Medium', 40,
'Enhance security and meet compliance requirements for enterprise customers.',
'TOTP implementation, SMS gateway integration, backup codes, user enrollment.',
'security_lead'),

('API Rate Limiting', 
'Implement rate limiting for API endpoints to prevent abuse and ensure fair usage.',
6, 'Medium', 'In Review', 'Simple', 20,
'Protect system resources and ensure stable performance for all users.',
'Rate limiting middleware, Redis-based counters, configurable limits.',
'security_lead'),

('Data Encryption at Rest', 
'Implement encryption for sensitive data stored in the database.',
6, 'High', 'Proposed', 'Complex', 80,
'Meet compliance requirements and protect sensitive customer data.',
'Database encryption, key management, performance impact assessment.',
'security_lead');

-- =====================================================
-- SAMPLE USER VOTES
-- =====================================================

-- Sample votes from different users
INSERT INTO [dbo].[user_votes] ([feature_id], [user_id], [user_email], [user_name], [vote_type], [comment]) VALUES
(1, 'user1', 'john.doe@company.com', 'John Doe', 'upvote', 'This would save me hours of manual work!'),
(1, 'user2', 'jane.smith@company.com', 'Jane Smith', 'upvote', 'Essential feature for our reporting needs.'),
(1, 'user3', 'mike.wilson@company.com', 'Mike Wilson', 'upvote', NULL),
(2, 'user1', 'john.doe@company.com', 'John Doe', 'upvote', 'Real-time updates would be amazing!'),
(2, 'user4', 'sarah.jones@company.com', 'Sarah Jones', 'upvote', 'This is exactly what we need for monitoring.'),
(3, 'user2', 'jane.smith@company.com', 'Jane Smith', 'upvote', 'Mobile access is crucial for field teams.'),
(3, 'user5', 'david.brown@company.com', 'David Brown', 'upvote', NULL),
(4, 'user3', 'mike.wilson@company.com', 'Mike Wilson', 'upvote', 'Search functionality needs improvement.'),
(5, 'user1', 'john.doe@company.com', 'John Doe', 'upvote', 'This bug affects our daily operations.'),
(5, 'user2', 'jane.smith@company.com', 'Jane Smith', 'upvote', 'High priority fix needed.'),
(6, 'user4', 'sarah.jones@company.com', 'Sarah Jones', 'upvote', 'Session timeouts are very frustrating.'),
(7, 'user5', 'david.brown@company.com', 'David Brown', 'upvote', 'Performance improvements are always welcome.'),
(8, 'user1', 'john.doe@company.com', 'John Doe', 'upvote', 'Caching would definitely help with speed.'),
(9, 'user2', 'jane.smith@company.com', 'Jane Smith', 'upvote', 'Dark mode would be great for night work.'),
(10, 'user3', 'mike.wilson@company.com', 'Mike Wilson', 'upvote', 'Better charts would help with presentations.'),
(11, 'user4', 'sarah.jones@company.com', 'Sarah Jones', 'upvote', 'Magento compatibility is critical.'),
(12, 'user5', 'david.brown@company.com', 'David Brown', 'upvote', 'SAP integration would be game-changing.'),
(13, 'user1', 'john.doe@company.com', 'John Doe', 'upvote', 'Security is paramount for our organization.'),
(14, 'user2', 'jane.smith@company.com', 'Jane Smith', 'upvote', 'Rate limiting is a good security practice.'),
(15, 'user3', 'mike.wilson@company.com', 'Mike Wilson', 'upvote', 'Data encryption is essential for compliance.');

-- =====================================================
-- SAMPLE FEATURE COMMENTS
-- =====================================================

INSERT INTO [dbo].[feature_comments] ([feature_id], [user_id], [user_name], [user_email], [comment], [is_admin_response]) VALUES
(1, 'admin', 'System Admin', 'admin@techno-etl.com', 'Thank you for the feedback! We are currently evaluating the technical requirements for this feature.', 1),
(1, 'user1', 'John Doe', 'john.doe@company.com', 'Would it be possible to include automated email delivery of reports?', 0),
(2, 'admin', 'System Admin', 'admin@techno-etl.com', 'This feature has been approved and will be included in the next major release.', 1),
(3, 'user2', 'Jane Smith', 'jane.smith@company.com', 'Please ensure the mobile version includes all the desktop features.', 0),
(5, 'developer', 'Dev Team', 'dev@techno-etl.com', 'We have identified the root cause and are working on a fix. Expected completion: next week.', 1),
(11, 'integration_lead', 'Integration Lead', 'integration@techno-etl.com', 'We are currently testing with Magento 2.4 beta. Initial results look promising.', 1),
(13, 'security_lead', 'Security Team', 'security@techno-etl.com', 'We recommend implementing this feature as it aligns with our security roadmap.', 1);

PRINT 'Sample voting data inserted successfully!';
PRINT 'Features: 15 sample features across all categories';
PRINT 'Votes: Sample votes from 5 different users';
PRINT 'Comments: Sample comments including admin responses';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show feature summary by category
SELECT 
    vc.name as category,
    COUNT(vf.id) as feature_count,
    SUM(vf.vote_count) as total_votes
FROM [dbo].[voting_categories] vc
LEFT JOIN [dbo].[voting_features] vf ON vc.id = vf.category_id
GROUP BY vc.name, vc.sort_order
ORDER BY vc.sort_order;

-- Show top voted features
SELECT TOP 10
    vf.title,
    vc.name as category,
    vf.priority,
    vf.status,
    vf.vote_count
FROM [dbo].[voting_features] vf
JOIN [dbo].[voting_categories] vc ON vf.category_id = vc.id
ORDER BY vf.vote_count DESC, vf.created_at DESC;
