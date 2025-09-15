import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as DeployIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Settings as ConfigIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Speed as OptimizedIcon,
  Schedule as CronIcon,
  Monitor as MonitorIcon,
  Build as BuildIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';

const OptimizedDeploymentGuide = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const optimizedSteps = [
    {
      label: 'Prerequisites & Environment',
      icon: <ConfigIcon />,
      content: {
        description: 'Set up the optimized production environment with all required dependencies',
        requirements: [
          'Node.js 18+ (Required for ES modules)',
          'PM2 5.3+ for process management',
          'SQL Server 2019+ with proper configuration',
          'Redis 6+ (Optional but recommended)',
          'Git for version control',
          'SSL certificates for HTTPS',
        ],
        code: `# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js version (must be >= 18.0.0)
node --version

# Install PM2 globally
npm install -g pm2

# Install Redis (optional but recommended)
sudo apt update
sudo apt install redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG`,
        tips: [
          'Node.js 18+ is required for ES module support',
          'PM2 provides professional process management',
          'Redis significantly improves performance but is optional',
        ],
      },
    },
    {
      label: 'Optimized Backend Build',
      icon: <BuildIcon />,
      content: {
        description: 'Build the optimized production backend with unified build system',
        requirements: [
          'Clone TECHNO-ETL repository',
          'Install development dependencies',
          'Run optimized production build',
          'Verify build output',
          'Test production configuration',
        ],
        code: `# Clone repository
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl/backend

# Install dependencies
npm install

# Run OPTIMIZED production build
npm run build:production

# Navigate to production build
cd dist

# Verify build structure
ls -la
# Should show:
# - server.js (main server)
# - package.json (production dependencies only)
# - ecosystem.config.cjs (PM2 configuration)
# - .env (production environment)
# - deploy.bat / deploy.sh (deployment scripts)
# - src/ (source code)
# - logs/ (log directory)

# Test configuration
cat .env | grep NODE_ENV
# Should show: NODE_ENV=production`,
        tips: [
          'Single unified build system replaces all previous methods',
          'Build automatically creates production environment',
          'All dependencies are optimized for production',
        ],
      },
    },
    {
      label: 'Database Configuration',
      icon: <DatabaseIcon />,
      content: {
        description: 'Configure SQL Server databases with optimized connection pooling',
        requirements: [
          'Create TECHNO_ETL database',
          'Configure MDM and CEGID connections',
          'Set up connection pooling',
          'Create required tables and indexes',
          'Configure backup strategy',
        ],
        code: `-- Create main database
CREATE DATABASE TECHNO_ETL;
GO

USE TECHNO_ETL;
GO

-- Create optimized tables with proper indexing
CREATE TABLE Products (
    ProductID int IDENTITY(1,1) PRIMARY KEY,
    SKU nvarchar(50) UNIQUE NOT NULL,
    Name nvarchar(255) NOT NULL,
    Description ntext,
    CategoryID int,
    BrandID int,
    Status nvarchar(20) DEFAULT 'active',
    CreatedDate datetime2 DEFAULT GETDATE(),
    ModifiedDate datetime2 DEFAULT GETDATE(),
    Changed bit DEFAULT 0
);

CREATE TABLE Inventory (
    InventoryID nvarchar(100) PRIMARY KEY,
    ProductID int FOREIGN KEY REFERENCES Products(ProductID),
    SourceCode nvarchar(20) NOT NULL,
    Quantity int DEFAULT 0,
    ReservedQuantity int DEFAULT 0,
    AvailableQuantity AS (Quantity - ReservedQuantity),
    LastUpdated datetime2 DEFAULT GETDATE(),
    Changed bit DEFAULT 0
);

-- Create performance indexes
CREATE INDEX IX_Products_SKU ON Products(SKU);
CREATE INDEX IX_Products_Changed ON Products(Changed, ModifiedDate);
CREATE INDEX IX_Inventory_SourceCode ON Inventory(SourceCode, Changed);
CREATE INDEX IX_Inventory_LastUpdated ON Inventory(LastUpdated);

-- Configure database for optimal performance
ALTER DATABASE TECHNO_ETL SET RECOVERY FULL;
ALTER DATABASE TECHNO_ETL SET AUTO_UPDATE_STATISTICS ON;
ALTER DATABASE TECHNO_ETL SET AUTO_CREATE_STATISTICS ON;`,
        tips: [
          'Connection pooling is automatically configured in production build',
          'Indexes are crucial for ETL performance',
          'Regular maintenance plans should be set up',
        ],
      },
    },
    {
      label: 'Single Command Deployment',
      icon: <RocketIcon />,
      content: {
        description: 'Deploy the entire system with a single command using optimized scripts',
        requirements: [
          'Production build completed',
          'Database configured',
          'Environment variables set',
          'PM2 installed globally',
          'Proper permissions configured',
        ],
        code: `# Navigate to production build directory
cd backend/dist

# SINGLE COMMAND DEPLOYMENT (Windows)
./deploy.bat

# OR for Linux/Mac
chmod +x deploy.sh
./deploy.sh

# The deployment script automatically:
# 1. Installs production dependencies
# 2. Starts API cluster with PM2
# 3. Starts cron job system
# 4. Configures logging
# 5. Sets up monitoring

# Verify deployment
npm run status
# Should show:
# ┌─────────────────┬────┬─────────┬──────┬───────┬────────┬─────────┬────────┬─────┬───────────┬──────┬──────────┐
# │ App name        │ id │ version │ mode │ pid   │ status │ restart │ uptime │ cpu │ mem       │ user │ watching │
# ├─────────────────┼────┼─────────┼──────┼───────┼────────┼─────────┼────────┼─────┼───────────┼──────┼──────────┤
# │ techno-etl-api  │ 0  │ 1.0.0   │ fork │ 12345 │ online │ 0       │ 5s     │ 0%  │ 50.0 MB   │ user │ disabled │
# │ techno-etl-cron │ 1  │ 1.0.0   │ fork │ 12346 │ online │ 0       │ 5s     │ 0%  │ 30.0 MB   │ user │ disabled │
# └─────────────────┴────┴─────────┴──────┴───────┴────────┴─────────┴────────┴─────┴───────────┴──────┴──────────┘

# Check health
npm run health
# Should return: {"status":"ok","environment":"production"}`,
        tips: [
          'Single command deployment eliminates manual errors',
          'All services start automatically',
          'Health checks verify successful deployment',
        ],
      },
    },
    {
      label: 'Cron Job System',
      icon: <CronIcon />,
      content: {
        description: 'Configure automated cron jobs for ETL processes',
        requirements: [
          'Cron system automatically installed',
          'Configure cron schedules',
          'Set up monitoring for cron jobs',
          'Configure error handling',
          'Set up notifications',
        ],
        code: `# Cron jobs are automatically configured in production build
# Default schedules (configurable in .env):

# Price Sync - Every 6 hours
PRICE_SYNC_CRON=0 */6 * * *

# Stock Sync - Every 4 hours  
STOCK_SYNC_CRON=0 */4 * * *

# Inventory Sync - Daily at 2 AM
INVENTORY_SYNC_CRON=0 2 * * *

# Timezone configuration
CRON_TIMEZONE=Europe/Paris

# View cron job status
npm run status
pm2 list techno-etl-cron

# View cron logs
npm run logs:cron

# Restart cron jobs if needed
pm2 restart techno-etl-cron

# Monitor cron job performance
pm2 monit`,
        tips: [
          'Cron jobs run in separate PM2 process for isolation',
          'All cron activities are logged separately',
          'Schedules can be customized via environment variables',
        ],
      },
    },
    {
      label: 'Monitoring & Performance',
      icon: <MonitorIcon />,
      content: {
        description: 'Set up comprehensive monitoring and performance optimization',
        requirements: [
          'PM2 monitoring configured',
          'Health check endpoints active',
          'Performance metrics enabled',
          'Log rotation configured',
          'Alert system set up',
        ],
        code: `# Built-in monitoring commands
npm run monit          # Real-time PM2 monitoring
npm run status         # Process status
npm run logs           # All logs
npm run logs:cron      # Cron logs only
npm run health         # API health check

# Performance monitoring endpoints
curl http://localhost:5000/api/health
# Returns: {"status":"ok","environment":"production","uptime":300}

curl http://localhost:5000/api/metrics
# Returns detailed performance metrics

# Access Swagger documentation
# http://localhost:5000/api-docs

# Configure log rotation (automatically set up)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Set up monitoring alerts (optional)
# Configure your monitoring service to check:
# - http://localhost:5000/api/health (every 1 minute)
# - PM2 process status (every 5 minutes)
# - System resources (CPU, Memory, Disk)`,
        tips: [
          'All monitoring is built into the optimized system',
          'Health checks provide detailed system status',
          'PM2 provides professional process monitoring',
        ],
      },
    },
  ];

  const environmentConfig = {
    production: `# TECHNO-ETL Production Environment (Auto-generated)
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database Configuration
SQL_CEGID_SERVER_INSTANCE=CVS196CgStandBy
SQL_CEGID_SERVER_DATABASE=DBRETAIL01
SQL_CEGID_SERVER_USER=reporting_RO
SQL_CEGID_SERVER_PASSWORD=RepCeg1d2021

SQL_MDM_SERVER_INSTANCE=C-VS003-SQL
SQL_MDM_SERVER_DATABASE=MDM_REPORT
SQL_MDM_SERVER_USER=Reporting_RO
SQL_MDM_SERVER_PASSWORD=MdM2oiB!

# Redis Configuration (Optional but recommended)
# REDIS_URL=redis://localhost:6379
# REDIS_HOST=localhost
# REDIS_PORT=6379

# Security Configuration
ACCESS_TOKEN_SECRET=your-strong-secret-here
REFRESH_TOKEN_SECRET=your-strong-refresh-secret
SESSION_SECRET=techno-etl-production-session-secret

# Magento Integration
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_ADMIN_TOKEN=your-magento-admin-token

# Cron Configuration
ENABLE_CRON=true
CRON_TIMEZONE=Europe/Paris
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *

# Performance Tuning
MAX_MEMORY=1024
DB_POOL_MAX=10
RATE_LIMIT_MAX=100`,

    pm2Config: `/**
 * TECHNO-ETL Unified PM2 Configuration
 * Author: Mounir Abderrahmani
 * Single configuration for API + Cron
 */

module.exports = {
  apps: [
    {
      name: 'techno-etl-api',
      script: './server.js',
      instances: 'max',              // Use all CPU cores
      exec_mode: 'cluster',          // Cluster mode for scalability
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',      // Restart if memory > 1GB
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      node_args: '--max-old-space-size=1024 --no-warnings --expose-gc',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'info'
      }
    },
    {
      name: 'techno-etl-cron',
      script: './src/cron/cron-runner.js',
      instances: 1,                  // Single instance for cron jobs
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_file: './logs/cron-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        ENABLE_CRON: 'true'
      }
    }
  ]
};`,
  };

  const troubleshooting = [
    {
      issue: 'Server shows "development" mode',
      solution: 'Fixed in optimized build - automatically sets NODE_ENV=production',
      status: 'resolved',
    },
    {
      issue: 'Redis URL not set warnings',
      solution: 'Proper Redis configuration with fallback to in-memory cache',
      status: 'resolved',
    },
    {
      issue: 'PM2 ES module errors',
      solution: 'Using .cjs extension for PM2 compatibility',
      status: 'resolved',
    },
    {
      issue: 'Multiple build systems confusion',
      solution: 'Single unified build in backend/dist/ only',
      status: 'resolved',
    },
    {
      issue: 'Manual deployment steps',
      solution: 'Single command deployment with automated scripts',
      status: 'resolved',
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 Optimized Deployment Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Professional deployment with unified build system, automated cron jobs, and single-command deployment
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Optimized Build" color="primary" icon={<OptimizedIcon />} />
              <Chip label="Single Command" color="success" icon={<RocketIcon />} />
              <Chip label="Auto Cron Jobs" color="info" icon={<CronIcon />} />
              <Chip label="Professional" color="warning" icon={<MonitorIcon />} />
            </Box>
          </Box>
        </motion.div>

        {/* Key Improvements */}
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>✅ Key Improvements in Optimized System</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="NODE_ENV=production (fixed development mode)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="No Redis warnings (proper configuration)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Single unified build system" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Automated cron job system" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Single command deployment" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Professional monitoring & logging" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Alert>
        </motion.div>

        {/* Quick Start */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                🎯 Quick Start (2 Commands)
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.9rem', margin: 0 }}>
                  {`# Step 1: Build production (from backend folder)
npm run build:production

# Step 2: Deploy (from backend/dist folder)
./deploy.bat    # Windows
./deploy.sh     # Linux

# That's it! Your production server is running! 🎉`}
                </pre>
              </Paper>
            </CardContent>
          </Card>
        </motion.div>

        {/* Deployment Steps */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📝 Optimized Deployment Steps
          </Typography>
          <Paper sx={{ p: 3, mb: 6 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {optimizedSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel icon={step.icon}>
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {step.content.description}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Requirements:
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {step.content.requirements.map((req, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={req} />
                        </ListItem>
                      ))}
                    </List>

                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Implementation:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', overflow: 'auto', mb: 2 }}>
                      <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {step.content.code}
                      </pre>
                    </Paper>

                    {step.content.tips && (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          💡 Pro Tips:
                        </Typography>
                        <List dense sx={{ mb: 2 }}>
                          {step.content.tips.map((tip, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <OptimizedIcon color="info" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={tip} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}

                    <Box sx={{ mb: 1 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === optimizedSteps.length - 1}
                        >
                          {index === optimizedSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === optimizedSteps.length && (
              <Paper square elevation={0} sx={{ p: 3, bgcolor: 'success.light' }}>
                <Typography variant="h6" gutterBottom>
                  🎉 Optimized Deployment Completed!
                </Typography>
                <Typography>
                  Your TECHNO-ETL system is now running in production mode with automated cron jobs,
                  professional monitoring, and optimized performance.
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset Guide
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>

        {/* Configuration Files */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ⚙️ Configuration Files
          </Typography>
          <Paper sx={{ mb: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Production Environment" />
              <Tab label="PM2 Configuration" />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', overflow: 'auto' }}>
                  <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {environmentConfig.production}
                  </pre>
                </Paper>
              )}
              {tabValue === 1 && (
                <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#fff', overflow: 'auto' }}>
                  <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {environmentConfig.pm2Config}
                  </pre>
                </Paper>
              )}
            </Box>
          </Paper>
        </motion.div>

        {/* Cron Job System */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🕐 Automated Cron Job System
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Price Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Synchronizes prices from MDM to Magento every 6 hours
                  </Typography>
                  <Chip label="0 */6 * * *" size="small" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Stock Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Updates inventory levels every 4 hours
                  </Typography>
                  <Chip label="0 */4 * * *" size="small" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Inventory Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Full inventory reconciliation daily at 2 AM
                  </Typography>
                  <Chip label="0 2 * * *" size="small" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🔧 Troubleshooting (Issues Fixed)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {troubleshooting.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckIcon color="success" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {item.issue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.solution}
                        </Typography>
                      </Box>
                      <Chip label="RESOLVED" color="success" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Success Checklist */}
        <motion.div variants={itemVariants}>
          <Alert severity="success">
            <Typography variant="h6" gutterBottom>
              <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Deployment Success Checklist
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="npm run status shows all processes running" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="npm run health returns success" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Server logs show NODE_ENV=production" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="No Redis warnings (if configured)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Cron jobs active and scheduled" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="API documentation accessible" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Alert>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default OptimizedDeploymentGuide;
