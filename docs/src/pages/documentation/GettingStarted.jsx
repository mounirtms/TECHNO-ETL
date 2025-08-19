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
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as StartIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const GettingStarted = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const setupSteps = [
    {
      label: 'Prerequisites & Environment',
      icon: <SettingsIcon />,
      content: {
        description: 'Install required software and prepare your development environment',
        requirements: [
          'Node.js 18+ and npm/yarn package manager',
          'SQL Server 2019+ or Azure SQL Database',
          'Redis 6+ for caching and session management',
          'Firebase project for authentication services',
          'Magento 2.4+ instance with API access',
          'Git for version control',
          'Code editor (VS Code recommended)'
        ],
        commands: [
          {
            title: 'Install Node.js',
            code: `# Download and install Node.js 18+ from nodejs.org
# Verify installation
node --version
npm --version

# Should show v18.x.x or higher`,
            language: 'bash'
          },
          {
            title: 'Install Git',
            code: `# Download Git from git-scm.com
# Verify installation
git --version

# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"`,
            language: 'bash'
          }
        ]
      }
    },
    {
      label: 'Clone & Install Dependencies',
      icon: <DownloadIcon />,
      content: {
        description: 'Clone the repository and install all required dependencies',
        requirements: [
          'Git repository access',
          'Stable internet connection for package downloads',
          'Sufficient disk space (minimum 2GB)',
          'Administrative privileges for global packages'
        ],
        commands: [
          {
            title: 'Clone Repository',
            code: `# Clone the TECHNO-ETL repository
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl

# Check repository structure
ls -la`,
            language: 'bash'
          },
          {
            title: 'Install Backend Dependencies',
            code: `# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install global dependencies (optional)
npm install -g pm2 nodemon

# Verify installation
npm list --depth=0`,
            language: 'bash'
          },
          {
            title: 'Install Frontend Dependencies',
            code: `# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Install documentation dependencies
cd ../docs
npm install

# Return to project root
cd ..`,
            language: 'bash'
          }
        ]
      }
    },
    {
      label: 'Database Setup',
      icon: <DatabaseIcon />,
      content: {
        description: 'Configure SQL Server database with required schemas and initial data',
        requirements: [
          'SQL Server 2019+ or Azure SQL Database',
          'Database administrator privileges',
          'SQL Server Management Studio or Azure Data Studio',
          'Network connectivity to database server'
        ],
        commands: [
          {
            title: 'Create Database',
            code: `-- Connect to SQL Server and run these commands
-- Create the main database
CREATE DATABASE TECHNO_ETL;
GO

-- Use the database
USE TECHNO_ETL;
GO

-- Verify database creation
SELECT name FROM sys.databases WHERE name = 'TECHNO_ETL';`,
            language: 'sql'
          },
          {
            title: 'Run Setup Script',
            code: `-- Execute the complete database setup script
-- This script is located in: /backend/database/setup.sql
-- Run it in SQL Server Management Studio or Azure Data Studio

-- Verify tables were created
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Should show: Products, Inventory, Prices, Categories, etc.`,
            language: 'sql'
          }
        ]
      }
    },
    {
      label: 'Environment Configuration',
      icon: <SecurityIcon />,
      content: {
        description: 'Configure environment variables for all application components',
        requirements: [
          'Database connection details',
          'Firebase project credentials',
          'Magento API access token',
          'Redis server connection details'
        ],
        commands: [
          {
            title: 'Backend Environment (.env)',
            code: `# Copy example environment file
cd backend
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=1433
DB_NAME=TECHNO_ETL
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
MAGENTO_BASE_URL=https://your-magento-site.com
MAGENTO_API_TOKEN=your_magento_token
FIREBASE_PROJECT_ID=your_firebase_project`,
            language: 'bash'
          },
          {
            title: 'Frontend Environment (.env.development)',
            code: `# Copy example environment file
cd ../frontend
cp .env.example .env.development

# Edit .env.development file:
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project
REACT_APP_MAGENTO_BASE_URL=https://your-magento-site.com`,
            language: 'bash'
          }
        ]
      }
    },
    {
      label: 'Start Development Servers',
      icon: <StartIcon />,
      content: {
        description: 'Launch all application components in development mode',
        requirements: [
          'All dependencies installed',
          'Database configured and running',
          'Environment variables set',
          'Ports 3000, 3001 available'
        ],
        commands: [
          {
            title: 'Start Backend Server',
            code: `# In backend directory
cd backend

# Start development server with auto-reload
npm run dev

# Or start with PM2 for production-like environment
pm2 start ecosystem.config.cjs --env development

# Verify server is running
curl http://localhost:3001/api/v1/health`,
            language: 'bash'
          },
          {
            title: 'Start Frontend Application',
            code: `# In new terminal, navigate to frontend
cd frontend

# Start development server
npm start

# Application will open at http://localhost:3000
# Hot reload is enabled for development`,
            language: 'bash'
          },
          {
            title: 'Start Documentation Site',
            code: `# In new terminal, navigate to docs
cd docs

# Start documentation server
npm start

# Documentation will open at http://localhost:3000
# (if frontend is not running on this port)`,
            language: 'bash'
          }
        ]
      }
    }
  ];

  const quickStartCommands = `# Quick Start - All in One
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../docs && npm install
cd ..

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development

# Start all services (requires 3 terminals)
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm start

# Terminal 3: Documentation
cd docs && npm start`;

  const CodeBlock = ({ code, language, title }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1,
        backgroundColor: 'grey.100',
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={language} size="small" color="primary" />
          {title && <Typography variant="subtitle2">{title}</Typography>}
        </Box>
        <Tooltip title={copiedText === title ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton 
            size="small" 
            onClick={() => copyToClipboard(code, title)}
            color={copiedText === title ? 'success' : 'default'}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Paper sx={{ 
        p: 2, 
        backgroundColor: '#f5f5f5', 
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: 'auto',
        maxHeight: 300
      }}>
        <pre style={{ fontSize: '0.875rem', margin: 0, whiteSpace: 'pre-wrap' }}>
          {code}
        </pre>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 Getting Started Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Complete setup guide to get TECHNO-ETL running in your environment
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Step-by-step" color="primary" />
              <Chip label="Copy-paste Ready" color="success" />
              <Chip label="Development Setup" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Quick Start */}
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>⚡ Quick Start</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              For experienced developers, here's the quick setup command sequence:
            </Typography>
            <CodeBlock 
              code={quickStartCommands}
              language="bash"
              title="quick-start"
            />
          </Alert>
        </motion.div>

        {/* System Requirements */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📋 System Requirements
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Minimum Requirements
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="4 CPU cores" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="8 GB RAM" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="50 GB storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Windows 10/11 or macOS 10.15+" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Recommended
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="8+ CPU cores" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="16 GB RAM" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="100 GB SSD storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Latest OS version" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Software Dependencies
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Node.js 18+" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="SQL Server 2019+" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Redis 6+" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Git" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Step-by-Step Setup */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📝 Step-by-Step Setup
          </Typography>
          <Paper sx={{ p: 3, mb: 6 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {setupSteps.map((step, index) => (
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
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>Requirements:</Typography>
                      <List dense>
                        {step.content.requirements.map((req, idx) => (
                          <ListItem key={idx} sx={{ py: 0.25 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <InfoIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={req} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>

                    {step.content.commands.map((command, idx) => (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {command.title}:
                        </Typography>
                        <CodeBlock 
                          code={command.code}
                          language={command.language}
                          title={`${step.label}-${idx}`}
                        />
                      </Box>
                    ))}

                    <Box sx={{ mb: 1, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === setupSteps.length - 1}
                        >
                          {index === setupSteps.length - 1 ? 'Finish' : 'Continue'}
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
            {activeStep === setupSteps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>🎉 Setup Complete!</Typography>
                <Typography>
                  Congratulations! You have successfully set up TECHNO-ETL. 
                  Your application should now be running and accessible.
                </Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset Guide
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>

        {/* Verification & Next Steps */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ✅ Verification & Next Steps
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Verify Installation
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Frontend accessible at http://localhost:3000"
                        secondary="Should show the TECHNO-ETL dashboard"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Backend API at http://localhost:3001/api/v1/health"
                        secondary="Should return status: 'OK'"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                      <ListItemText 
                        primary="Database connection working"
                        secondary="Check backend logs for connection success"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Next Steps
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><StartIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Explore the Documentation"
                        secondary="Visit all documentation sections to understand the system"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Configure Integrations"
                        secondary="Set up Magento and other system integrations"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SecurityIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Set up Authentication"
                        secondary="Configure Firebase authentication for users"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Troubleshooting */}
        <motion.div variants={itemVariants}>
          <Alert severity="warning" sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Need Help?
            </Typography>
            <Typography variant="body1">
              If you encounter any issues during setup, check the 
              <strong> Troubleshooting Guide</strong> in the documentation or contact support at 
              <strong> mounir.ab@techno-dz.com</strong>
            </Typography>
          </Alert>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default GettingStarted;
