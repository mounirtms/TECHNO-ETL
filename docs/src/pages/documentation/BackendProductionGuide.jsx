import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Speed as OptimizedIcon,
  Schedule as CronIcon,
  Monitor as MonitorIcon,
  Build as BuildIcon,
  Rocket as RocketIcon,
  Settings as SettingsIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const BackendProductionGuide = () => {
  const [expandedPanel, setExpandedPanel] = useState('overview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const issuesFixed = [
    {
      issue: 'NODE_ENV showing "development"',
      before: 'Server running in development mode',
      after: 'Proper production environment configuration',
      status: 'fixed'
    },
    {
      issue: 'Redis URL not set warnings',
      before: 'Constant Redis warnings in logs',
      after: 'Proper Redis configuration with fallback',
      status: 'fixed'
    },
    {
      issue: 'Multiple confusing build systems',
      before: 'webpack, dist/, dist_prod/, multiple scripts',
      after: 'Single unified build in backend/dist/',
      status: 'fixed'
    },
    {
      issue: 'Manual deployment steps',
      before: 'Multiple manual commands required',
      after: 'Single command deployment',
      status: 'fixed'
    },
    {
      issue: 'Missing cron job system',
      before: 'No automated ETL processes',
      after: 'Professional cron job automation',
      status: 'fixed'
    }
  ];

  const cronJobs = [
    {
      name: 'Price Sync',
      schedule: '0 */6 * * *',
      description: 'Synchronizes prices from MDM to Magento',
      frequency: 'Every 6 hours',
      purpose: 'Keep product prices up to date'
    },
    {
      name: 'Stock Sync',
      schedule: '0 */4 * * *',
      description: 'Updates inventory levels across systems',
      frequency: 'Every 4 hours',
      purpose: 'Maintain accurate stock levels'
    },
    {
      name: 'Inventory Sync',
      schedule: '0 2 * * *',
      description: 'Full inventory reconciliation',
      frequency: 'Daily at 2 AM',
      purpose: 'Complete inventory audit and sync'
    }
  ];

  const performanceFeatures = [
    {
      feature: 'Cluster Mode',
      description: 'Uses all available CPU cores',
      benefit: 'Maximum performance and scalability'
    },
    {
      feature: 'Memory Management',
      description: '1GB limit per process with automatic restart',
      benefit: 'Prevents memory leaks and ensures stability'
    },
    {
      feature: 'Connection Pooling',
      description: 'Optimized database connection management',
      benefit: 'Reduced latency and better resource usage'
    },
    {
      feature: 'Redis Caching',
      description: 'Optional Redis with in-memory fallback',
      benefit: 'Improved response times and reduced database load'
    },
    {
      feature: 'Rate Limiting',
      description: 'Configurable request rate limiting',
      benefit: 'Protection against abuse and overload'
    },
    {
      feature: 'Compression',
      description: 'Gzip compression for all responses',
      benefit: 'Reduced bandwidth usage and faster responses'
    }
  ];

  const monitoringEndpoints = [
    {
      endpoint: '/api/health',
      method: 'GET',
      description: 'System health check',
      response: '{"status":"ok","environment":"production"}'
    },
    {
      endpoint: '/api/metrics',
      method: 'GET',
      description: 'Performance metrics',
      response: 'Detailed performance statistics'
    },
    {
      endpoint: '/api-docs',
      method: 'GET',
      description: 'Swagger API documentation',
      response: 'Interactive API documentation'
    }
  ];

  const commands = [
    {
      category: 'Build & Deploy',
      commands: [
        { cmd: 'npm run build:production', desc: 'Build optimized production version' },
        { cmd: 'cd dist && ./deploy.bat', desc: 'Deploy with all services' }
      ]
    },
    {
      category: 'Service Management',
      commands: [
        { cmd: 'npm run start:cluster', desc: 'Start API cluster' },
        { cmd: 'npm run start:cron', desc: 'Start cron jobs' },
        { cmd: 'npm run stop', desc: 'Stop all services' },
        { cmd: 'npm run restart', desc: 'Restart all services' },
        { cmd: 'npm run reload', desc: 'Zero-downtime reload' }
      ]
    },
    {
      category: 'Monitoring',
      commands: [
        { cmd: 'npm run status', desc: 'Check process status' },
        { cmd: 'npm run logs', desc: 'View all logs' },
        { cmd: 'npm run logs:cron', desc: 'View cron logs only' },
        { cmd: 'npm run monit', desc: 'Real-time monitoring' },
        { cmd: 'npm run health', desc: 'Health check' }
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🏭 Backend Production Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Complete guide for TECHNO-ETL backend production deployment and management
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Production Ready" color="primary" icon={<RocketIcon />} />
              <Chip label="Optimized Build" color="success" icon={<OptimizedIcon />} />
              <Chip label="Auto Cron Jobs" color="info" icon={<CronIcon />} />
              <Chip label="Professional" color="warning" icon={<MonitorIcon />} />
            </Box>
          </Box>
        </motion.div>

        {/* Quick Summary */}
        <motion.div variants={itemVariants}>
          <Card sx={{ mb: 4, bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                ✅ Production System Status: OPTIMIZED & READY
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Environment:</strong> NODE_ENV=production ✅
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Build System:</strong> Single unified build ✅
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Deployment:</strong> Single command ✅
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Cron Jobs:</strong> Automated ETL processes ✅
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Monitoring:</strong> Professional PM2 setup ✅
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Performance:</strong> Cluster mode + caching ✅
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accordion Sections */}
        <motion.div variants={itemVariants}>
          {/* Overview */}
          <Accordion expanded={expandedPanel === 'overview'} onChange={handlePanelChange('overview')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                📋 System Overview
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Architecture
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Node.js 18+ with ES modules" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Express.js API server" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="PM2 cluster management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="SQL Server database integration" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Redis caching (optional)" />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Key Features
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><OptimizedIcon color="info" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Optimized production build" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CronIcon color="warning" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Automated cron job system" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><MonitorIcon color="secondary" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Comprehensive monitoring" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SecurityIcon color="error" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Production security features" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><RocketIcon color="primary" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Single command deployment" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Issues Fixed */}
          <Accordion expanded={expandedPanel === 'fixes'} onChange={handlePanelChange('fixes')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                🔧 Issues Fixed & Improvements
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Issue</strong></TableCell>
                      <TableCell><strong>Before</strong></TableCell>
                      <TableCell><strong>After</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {issuesFixed.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.issue}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{item.before}</TableCell>
                        <TableCell sx={{ color: 'success.main' }}>{item.after}</TableCell>
                        <TableCell>
                          <Chip label="FIXED" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* Deployment */}
          <Accordion expanded={expandedPanel === 'deployment'} onChange={handlePanelChange('deployment')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                🚀 Single Command Deployment
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  2-Command Deployment Process
                </Typography>
                <Typography>
                  The optimized system requires only 2 commands to go from source code to production deployment.
                </Typography>
              </Alert>
              
              <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', color: '#fff', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50' }}>
                  Step 1: Build Production (from backend folder)
                </Typography>
                <pre style={{ fontSize: '1rem', margin: 0 }}>
{`npm run build:production`}
                </pre>
                
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', mt: 2 }}>
                  Step 2: Deploy (from backend/dist folder)
                </Typography>
                <pre style={{ fontSize: '1rem', margin: 0 }}>
{`./deploy.bat    # Windows
./deploy.sh     # Linux`}
                </pre>
                
                <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', mt: 2 }}>
                  Verification
                </Typography>
                <pre style={{ fontSize: '1rem', margin: 0 }}>
{`npm run status  # Check all processes
npm run health   # Verify API health`}
                </pre>
              </Paper>

              <Typography variant="h6" gutterBottom>
                What the deployment script does:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Installs production dependencies automatically" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Starts API cluster with PM2" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Starts automated cron job system" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Configures logging and monitoring" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Sets up health check endpoints" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Cron Jobs */}
          <Accordion expanded={expandedPanel === 'cron'} onChange={handlePanelChange('cron')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                🕐 Automated Cron Job System
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 3 }}>
                The production system includes a professional cron job system that automatically handles ETL processes.
              </Typography>
              
              <Grid container spacing={3}>
                {cronJobs.map((job, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary.main">
                          {job.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {job.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Chip label={job.schedule} size="small" sx={{ mr: 1 }} />
                          <Chip label={job.frequency} size="small" color="info" />
                        </Box>
                        <Typography variant="body2">
                          <strong>Purpose:</strong> {job.purpose}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Cron Job Management Commands:
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0 }}>
{`# Start cron jobs
npm run start:cron

# Check cron status
pm2 list techno-etl-cron

# View cron logs
npm run logs:cron

# Restart cron jobs
pm2 restart techno-etl-cron`}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>

          {/* Performance */}
          <Accordion expanded={expandedPanel === 'performance'} onChange={handlePanelChange('performance')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                ⚡ Performance Features
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {performanceFeatures.map((feature, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary.main">
                          {feature.feature}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {feature.description}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          <strong>Benefit:</strong> {feature.benefit}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Monitoring */}
          <Accordion expanded={expandedPanel === 'monitoring'} onChange={handlePanelChange('monitoring')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                📊 Monitoring & Health Checks
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" gutterBottom>
                Health Check Endpoints:
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Endpoint</strong></TableCell>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell><strong>Response</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monitoringEndpoints.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <code>{endpoint.endpoint}</code>
                        </TableCell>
                        <TableCell>
                          <Chip label={endpoint.method} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{endpoint.description}</TableCell>
                        <TableCell>
                          <code style={{ fontSize: '0.75rem' }}>{endpoint.response}</code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                PM2 Monitoring Commands:
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <pre style={{ fontSize: '0.875rem', margin: 0 }}>
{`# Real-time monitoring
npm run monit

# Process status
npm run status

# View all logs
npm run logs

# Health check
npm run health`}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>

          {/* Commands Reference */}
          <Accordion expanded={expandedPanel === 'commands'} onChange={handlePanelChange('commands')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                💻 Command Reference
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {commands.map((category, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    {category.category}
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Command</strong></TableCell>
                          <TableCell><strong>Description</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.commands.map((cmd, cmdIndex) => (
                          <TableRow key={cmdIndex}>
                            <TableCell>
                              <code>{cmd.cmd}</code>
                            </TableCell>
                            <TableCell>{cmd.desc}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </motion.div>

        {/* Success Indicators */}
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              🎉 Production Deployment Success Indicators
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

export default BackendProductionGuide;
