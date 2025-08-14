import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Code as CodeIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ConfigurationSetup = () => {
  const [tabValue, setTabValue] = useState(0);
  const [copiedText, setCopiedText] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const environmentConfigs = {
    development: {
      backend: `# Development Environment - Backend
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=TECHNO_ETL_DEV
DB_USER=dev_user
DB_PASSWORD=dev_password123
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your_development_jwt_secret_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=techno-etl-dev
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@techno-etl-dev.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Magento Configuration
MAGENTO_BASE_URL=https://dev-magento.techno-dz.com
MAGENTO_API_TOKEN=your_development_magento_token
MAGENTO_API_VERSION=V1
MAGENTO_TIMEOUT=30000

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000`,
      frontend: `# Development Environment - Frontend
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
REACT_APP_WS_URL=ws://localhost:3001

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=techno-etl-dev.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=techno-etl-dev
REACT_APP_FIREBASE_STORAGE_BUCKET=techno-etl-dev.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Application Configuration
REACT_APP_APP_NAME=TECHNO-ETL Development
REACT_APP_VERSION=2.1.0
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_MOCK_DATA=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# External Services
REACT_APP_MAGENTO_BASE_URL=https://dev-magento.techno-dz.com
REACT_APP_DOCS_URL=http://localhost:3000

# UI Configuration
REACT_APP_DEFAULT_THEME=light
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_ENABLE_RTL=true`
    },
    production: {
      backend: `# Production Environment - Backend
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_HOST=prod-sql-server.techno-dz.com
DB_PORT=1433
DB_NAME=TECHNO_ETL_PROD
DB_USER=prod_user
DB_PASSWORD=\${DB_PASSWORD_SECRET}
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
DB_CONNECTION_TIMEOUT=30000
DB_REQUEST_TIMEOUT=30000
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=prod-redis.techno-dz.com
REDIS_PORT=6379
REDIS_PASSWORD=\${REDIS_PASSWORD_SECRET}
REDIS_DB=0
REDIS_TLS=true

# Authentication
JWT_SECRET=\${JWT_SECRET_PRODUCTION}
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=techno-etl-prod
FIREBASE_PRIVATE_KEY_ID=\${FIREBASE_PRIVATE_KEY_ID}
FIREBASE_PRIVATE_KEY=\${FIREBASE_PRIVATE_KEY}
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@techno-etl-prod.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=\${FIREBASE_CLIENT_ID}

# Magento Configuration
MAGENTO_BASE_URL=https://magento.techno-dz.com
MAGENTO_API_TOKEN=\${MAGENTO_API_TOKEN_PROD}
MAGENTO_API_VERSION=V1
MAGENTO_TIMEOUT=30000

# Logging
LOG_LEVEL=warn
LOG_FILE=logs/app.log
LOG_MAX_SIZE=50m
LOG_MAX_FILES=10

# Security
CORS_ORIGIN=https://app.techno-dz.com
CORS_CREDENTIALS=true
HELMET_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000`,
      frontend: `# Production Environment - Frontend
REACT_APP_API_BASE_URL=https://api.techno-dz.com/v1
REACT_APP_WS_URL=wss://api.techno-dz.com

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=\${FIREBASE_API_KEY_PROD}
REACT_APP_FIREBASE_AUTH_DOMAIN=techno-etl-prod.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=techno-etl-prod
REACT_APP_FIREBASE_STORAGE_BUCKET=techno-etl-prod.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=\${FIREBASE_MESSAGING_SENDER_ID}
REACT_APP_FIREBASE_APP_ID=\${FIREBASE_APP_ID}

# Application Configuration
REACT_APP_APP_NAME=TECHNO-ETL
REACT_APP_VERSION=2.1.0
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# External Services
REACT_APP_MAGENTO_BASE_URL=https://magento.techno-dz.com
REACT_APP_DOCS_URL=https://docs.techno-dz.com

# UI Configuration
REACT_APP_DEFAULT_THEME=light
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_ENABLE_RTL=true

# Performance
GENERATE_SOURCEMAP=false
REACT_APP_ENABLE_SERVICE_WORKER=true`
    }
  };

  const databaseSetup = `-- TECHNO-ETL Database Setup Script
-- SQL Server 2019+ Compatible

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'TECHNO_ETL')
BEGIN
    CREATE DATABASE TECHNO_ETL;
END
GO

USE TECHNO_ETL;
GO

-- Create Products Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
BEGIN
    CREATE TABLE Products (
        ProductID int IDENTITY(1,1) PRIMARY KEY,
        SKU nvarchar(50) UNIQUE NOT NULL,
        Name nvarchar(255) NOT NULL,
        Description ntext,
        ShortDescription nvarchar(500),
        CategoryID int,
        BrandID int,
        Status nvarchar(20) DEFAULT 'active' CHECK (Status IN ('active', 'inactive', 'pending')),
        Price decimal(10,2),
        CostPrice decimal(10,2),
        Weight decimal(8,2),
        Dimensions nvarchar(100),
        CreatedDate datetime2 DEFAULT GETDATE(),
        ModifiedDate datetime2 DEFAULT GETDATE(),
        CreatedBy nvarchar(100),
        ModifiedBy nvarchar(100),
        Changed bit DEFAULT 0,
        Version int DEFAULT 1,
        
        -- Indexes
        INDEX IX_Products_SKU (SKU),
        INDEX IX_Products_Status (Status),
        INDEX IX_Products_Changed (Changed, ModifiedDate),
        INDEX IX_Products_Category (CategoryID),
        INDEX IX_Products_Brand (BrandID)
    );
END
GO

-- Create Inventory Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Inventory' AND xtype='U')
BEGIN
    CREATE TABLE Inventory (
        InventoryID nvarchar(100) PRIMARY KEY,
        ProductID int NOT NULL,
        SKU nvarchar(50) NOT NULL,
        SourceCode nvarchar(20) NOT NULL,
        SourceName nvarchar(100),
        Quantity int DEFAULT 0 CHECK (Quantity >= 0),
        ReservedQuantity int DEFAULT 0 CHECK (ReservedQuantity >= 0),
        AvailableQuantity AS (Quantity - ReservedQuantity) PERSISTED,
        MinimumQuantity int DEFAULT 0,
        MaximumQuantity int DEFAULT 999999,
        ReorderPoint int DEFAULT 10,
        LastUpdated datetime2 DEFAULT GETDATE(),
        LastSyncDate datetime2,
        Changed bit DEFAULT 0,
        IsActive bit DEFAULT 1,
        
        -- Foreign Key
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
        
        -- Indexes
        INDEX IX_Inventory_ProductSKU (ProductID, SKU),
        INDEX IX_Inventory_SourceCode (SourceCode, Changed),
        INDEX IX_Inventory_Changed (Changed, LastUpdated),
        INDEX IX_Inventory_LowStock (SourceCode, AvailableQuantity, MinimumQuantity)
    );
END
GO

-- Create Prices Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Prices' AND xtype='U')
BEGIN
    CREATE TABLE Prices (
        PriceID int IDENTITY(1,1) PRIMARY KEY,
        ProductID int NOT NULL,
        SKU nvarchar(50) NOT NULL,
        CustomerGroup nvarchar(50) DEFAULT 'general',
        Price decimal(10,2) NOT NULL CHECK (Price >= 0),
        SpecialPrice decimal(10,2) CHECK (SpecialPrice >= 0),
        SpecialPriceFrom datetime2,
        SpecialPriceTo datetime2,
        Currency nvarchar(3) DEFAULT 'USD',
        EffectiveDate datetime2 DEFAULT GETDATE(),
        ExpiryDate datetime2,
        CreatedDate datetime2 DEFAULT GETDATE(),
        ModifiedDate datetime2 DEFAULT GETDATE(),
        IsActive bit DEFAULT 1,
        
        -- Foreign Key
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
        
        -- Indexes
        INDEX IX_Prices_ProductGroup (ProductID, CustomerGroup),
        INDEX IX_Prices_SKU (SKU),
        INDEX IX_Prices_Effective (EffectiveDate, ExpiryDate),
        INDEX IX_Prices_Special (SpecialPriceFrom, SpecialPriceTo)
    );
END
GO

-- Create Categories Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
BEGIN
    CREATE TABLE Categories (
        CategoryID int IDENTITY(1,1) PRIMARY KEY,
        Name nvarchar(255) NOT NULL,
        Description ntext,
        ParentCategoryID int,
        Level int DEFAULT 1,
        Path nvarchar(500),
        IsActive bit DEFAULT 1,
        SortOrder int DEFAULT 0,
        CreatedDate datetime2 DEFAULT GETDATE(),
        ModifiedDate datetime2 DEFAULT GETDATE(),
        
        -- Self-referencing foreign key
        FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID),
        
        -- Indexes
        INDEX IX_Categories_Parent (ParentCategoryID),
        INDEX IX_Categories_Level (Level),
        INDEX IX_Categories_Active (IsActive, SortOrder)
    );
END
GO

-- Create Brands Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Brands' AND xtype='U')
BEGIN
    CREATE TABLE Brands (
        BrandID int IDENTITY(1,1) PRIMARY KEY,
        Name nvarchar(255) NOT NULL UNIQUE,
        Description ntext,
        LogoURL nvarchar(500),
        Website nvarchar(255),
        IsActive bit DEFAULT 1,
        CreatedDate datetime2 DEFAULT GETDATE(),
        ModifiedDate datetime2 DEFAULT GETDATE(),
        
        -- Indexes
        INDEX IX_Brands_Name (Name),
        INDEX IX_Brands_Active (IsActive)
    );
END
GO

-- Create Sync Logs Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SyncLogs' AND xtype='U')
BEGIN
    CREATE TABLE SyncLogs (
        LogID int IDENTITY(1,1) PRIMARY KEY,
        SyncID nvarchar(100) NOT NULL,
        SyncType nvarchar(50) NOT NULL,
        Status nvarchar(20) NOT NULL CHECK (Status IN ('started', 'in_progress', 'completed', 'failed', 'cancelled')),
        StartTime datetime2 NOT NULL,
        EndTime datetime2,
        Duration AS (DATEDIFF(MILLISECOND, StartTime, EndTime)),
        RecordsProcessed int DEFAULT 0,
        RecordsSuccessful int DEFAULT 0,
        RecordsFailed int DEFAULT 0,
        ErrorMessage ntext,
        Details ntext,
        CreatedBy nvarchar(100),
        
        -- Indexes
        INDEX IX_SyncLogs_SyncID (SyncID),
        INDEX IX_SyncLogs_Type (SyncType, Status),
        INDEX IX_SyncLogs_StartTime (StartTime DESC)
    );
END
GO

-- Create Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
    CREATE TABLE Users (
        UserID int IDENTITY(1,1) PRIMARY KEY,
        FirebaseUID nvarchar(128) UNIQUE NOT NULL,
        Email nvarchar(255) UNIQUE NOT NULL,
        DisplayName nvarchar(255),
        Role nvarchar(50) DEFAULT 'viewer' CHECK (Role IN ('admin', 'manager', 'operator', 'viewer')),
        IsActive bit DEFAULT 1,
        LastLoginDate datetime2,
        CreatedDate datetime2 DEFAULT GETDATE(),
        ModifiedDate datetime2 DEFAULT GETDATE(),
        
        -- Indexes
        INDEX IX_Users_FirebaseUID (FirebaseUID),
        INDEX IX_Users_Email (Email),
        INDEX IX_Users_Role (Role, IsActive)
    );
END
GO

-- Create Audit Trail Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditTrail' AND xtype='U')
BEGIN
    CREATE TABLE AuditTrail (
        AuditID int IDENTITY(1,1) PRIMARY KEY,
        TableName nvarchar(100) NOT NULL,
        RecordID nvarchar(100) NOT NULL,
        Action nvarchar(20) NOT NULL CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE')),
        OldValues ntext,
        NewValues ntext,
        ChangedBy nvarchar(100),
        ChangedDate datetime2 DEFAULT GETDATE(),
        IPAddress nvarchar(45),
        UserAgent nvarchar(500),
        
        -- Indexes
        INDEX IX_AuditTrail_Table (TableName, RecordID),
        INDEX IX_AuditTrail_Date (ChangedDate DESC),
        INDEX IX_AuditTrail_User (ChangedBy)
    );
END
GO

-- Create Stored Procedures
-- Procedure to mark products as changed
CREATE OR ALTER PROCEDURE sp_MarkProductChanged
    @ProductID int,
    @ModifiedBy nvarchar(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Products 
    SET Changed = 1, 
        ModifiedDate = GETDATE(),
        ModifiedBy = @ModifiedBy,
        Version = Version + 1
    WHERE ProductID = @ProductID;
    
    -- Also mark related inventory as changed
    UPDATE Inventory 
    SET Changed = 1, 
        LastUpdated = GETDATE()
    WHERE ProductID = @ProductID;
END
GO

-- Procedure to get sync statistics
CREATE OR ALTER PROCEDURE sp_GetSyncStatistics
    @Days int = 7
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SyncType,
        COUNT(*) as TotalSyncs,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) as SuccessfulSyncs,
        SUM(CASE WHEN Status = 'failed' THEN 1 ELSE 0 END) as FailedSyncs,
        AVG(CAST(Duration as float)) as AvgDurationMs,
        SUM(RecordsProcessed) as TotalRecordsProcessed,
        SUM(RecordsSuccessful) as TotalRecordsSuccessful,
        SUM(RecordsFailed) as TotalRecordsFailed
    FROM SyncLogs 
    WHERE StartTime >= DATEADD(day, -@Days, GETDATE())
    GROUP BY SyncType
    ORDER BY TotalSyncs DESC;
END
GO

-- Create Triggers for Audit Trail
CREATE OR ALTER TRIGGER tr_Products_Audit
ON Products
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Handle INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditTrail (TableName, RecordID, Action, NewValues, ChangedBy)
        SELECT 'Products', CAST(ProductID as nvarchar), 'INSERT', 
               (SELECT * FROM inserted i WHERE i.ProductID = inserted.ProductID FOR JSON AUTO),
               ModifiedBy
        FROM inserted;
    END
    
    -- Handle UPDATE
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditTrail (TableName, RecordID, Action, OldValues, NewValues, ChangedBy)
        SELECT 'Products', CAST(i.ProductID as nvarchar), 'UPDATE',
               (SELECT * FROM deleted d WHERE d.ProductID = i.ProductID FOR JSON AUTO),
               (SELECT * FROM inserted ins WHERE ins.ProductID = i.ProductID FOR JSON AUTO),
               i.ModifiedBy
        FROM inserted i;
    END
    
    -- Handle DELETE
    IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditTrail (TableName, RecordID, Action, OldValues)
        SELECT 'Products', CAST(ProductID as nvarchar), 'DELETE',
               (SELECT * FROM deleted d WHERE d.ProductID = deleted.ProductID FOR JSON AUTO)
        FROM deleted;
    END
END
GO

-- Insert default data
-- Default Categories
IF NOT EXISTS (SELECT * FROM Categories WHERE Name = 'Root')
BEGIN
    INSERT INTO Categories (Name, Description, Level, Path) VALUES 
    ('Root', 'Root Category', 1, '/'),
    ('Electronics', 'Electronic Products', 2, '/Electronics/'),
    ('Clothing', 'Clothing and Apparel', 2, '/Clothing/'),
    ('Home & Garden', 'Home and Garden Products', 2, '/Home-Garden/');
END
GO

-- Default Brands
IF NOT EXISTS (SELECT * FROM Brands WHERE Name = 'Generic')
BEGIN
    INSERT INTO Brands (Name, Description) VALUES 
    ('Generic', 'Generic Brand'),
    ('TECHNO', 'TECHNO Brand Products'),
    ('Premium', 'Premium Quality Products');
END
GO

-- Create Views for reporting
CREATE OR ALTER VIEW vw_ProductInventory AS
SELECT 
    p.ProductID,
    p.SKU,
    p.Name as ProductName,
    p.Status as ProductStatus,
    p.Price,
    c.Name as CategoryName,
    b.Name as BrandName,
    i.SourceCode,
    i.SourceName,
    i.Quantity,
    i.ReservedQuantity,
    i.AvailableQuantity,
    i.MinimumQuantity,
    CASE 
        WHEN i.AvailableQuantity <= i.MinimumQuantity THEN 'Low Stock'
        WHEN i.AvailableQuantity = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END as StockStatus,
    i.LastUpdated as InventoryLastUpdated,
    p.ModifiedDate as ProductLastModified
FROM Products p
LEFT JOIN Inventory i ON p.ProductID = i.ProductID
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
LEFT JOIN Brands b ON p.BrandID = b.BrandID
WHERE p.Status = 'active' AND (i.IsActive = 1 OR i.IsActive IS NULL);
GO

PRINT 'TECHNO-ETL Database setup completed successfully!';`;

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const CodeBlock = ({ code, language, label }) => (
    <Paper sx={{ position: 'relative', mb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        backgroundColor: 'grey.100',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Chip label={language} size="small" color="primary" />
        <Tooltip title={copiedText === label ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton 
            size="small" 
            onClick={() => copyToClipboard(code, label)}
            color={copiedText === label ? 'success' : 'default'}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', maxHeight: 400 }}>
        <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
          {code}
        </pre>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              ⚙️ Configuration & Setup
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Complete configuration guide for all environments and components
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Environment Setup" color="primary" />
              <Chip label="Database Configuration" color="success" />
              <Chip label="Security Settings" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Quick Setup Alert */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🚀 Quick Setup Guide</Typography>
            Follow the tabs below to configure your TECHNO-ETL environment. Each section includes 
            copy-paste ready configuration files and step-by-step instructions for development, 
            staging, and production environments.
          </Alert>
        </motion.div>

        {/* Configuration Tabs */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ mb: 6 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Environment Variables" icon={<SettingsIcon />} />
              <Tab label="Database Setup" icon={<DatabaseIcon />} />
              <Tab label="Security Configuration" icon={<SecurityIcon />} />
              <Tab label="Production Deployment" icon={<CloudIcon />} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Environment Configuration</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Configure environment variables for different deployment environments. 
                Copy the appropriate configuration for your environment.
              </Typography>

              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CodeIcon color="primary" />
                    <Typography variant="h6">Development Environment</Typography>
                    <Chip label="Local Development" color="primary" size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Backend Configuration (.env)
                  </Typography>
                  <CodeBlock 
                    code={environmentConfigs.development.backend}
                    language="Environment"
                    label="dev-backend"
                  />
                  
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                    Frontend Configuration (.env.development)
                  </Typography>
                  <CodeBlock 
                    code={environmentConfigs.development.frontend}
                    language="Environment"
                    label="dev-frontend"
                  />
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CloudIcon color="success" />
                    <Typography variant="h6">Production Environment</Typography>
                    <Chip label="Production Ready" color="success" size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Security Notice:</Typography>
                    Replace all placeholder values (${VARIABLE_NAME}) with actual secure values. 
                    Never commit production secrets to version control.
                  </Alert>
                  
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Backend Configuration (.env.production)
                  </Typography>
                  <CodeBlock 
                    code={environmentConfigs.production.backend}
                    language="Environment"
                    label="prod-backend"
                  />
                  
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                    Frontend Configuration (.env.production)
                  </Typography>
                  <CodeBlock 
                    code={environmentConfigs.production.frontend}
                    language="Environment"
                    label="prod-frontend"
                  />
                </AccordionDetails>
              </Accordion>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Database Setup</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Complete SQL Server database setup script with tables, indexes, stored procedures, 
                and initial data. Execute this script to set up your TECHNO-ETL database.
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Prerequisites:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="SQL Server 2019+ or Azure SQL Database" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Database administrator privileges" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="SQL Server Management Studio or Azure Data Studio" />
                  </ListItem>
                </List>
              </Alert>

              <CodeBlock 
                code={databaseSetup}
                language="SQL"
                label="database-setup"
              />

              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>After Setup:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Verify all tables are created successfully" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Test database connection from application" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Configure backup and maintenance plans" />
                  </ListItem>
                </List>
              </Alert>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Security Configuration</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Essential security configurations for production deployment including SSL, 
                authentication, and access control settings.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error.main">
                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Security Checklist
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Change all default passwords" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Generate strong JWT secrets" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Configure SSL certificates" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Set up firewall rules" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Enable database encryption" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WarningIcon color="warning" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Configure rate limiting" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="success.main">
                        <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Security Features
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="JWT token authentication" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Role-based access control" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="API rate limiting" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Input validation & sanitization" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="Audit trail logging" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary="HTTPS enforcement" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Production Deployment</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Step-by-step production deployment guide with Docker, load balancing, 
                and monitoring configuration.
              </Typography>

              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600}>Production Requirements:</Typography>
                Ensure you have completed all security configurations and tested the application 
                in a staging environment before deploying to production.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🚀 Production Deployment Steps
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="1. Server Preparation"
                            secondary="Set up production servers with required software and security configurations"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="2. Database Deployment"
                            secondary="Deploy database schema and configure backup strategies"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="3. Application Deployment"
                            secondary="Deploy backend and frontend applications with proper configurations"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="4. Load Balancer Setup"
                            secondary="Configure Nginx or cloud load balancer for high availability"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="5. Monitoring & Logging"
                            secondary="Set up monitoring, alerting, and centralized logging"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CheckIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="6. Testing & Validation"
                            secondary="Perform comprehensive testing and validation of all systems"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ConfigurationSetup;
