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
  AccordionDetails
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as DeployIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Settings as ConfigIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const DeploymentGuide = () => {
  const [activeStep, setActiveStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const deploymentSteps = [
    {
      label: 'Prerequisites & Environment Setup',
      icon: <ConfigIcon />,
      content: {
        description: 'Prepare the deployment environment with required software and configurations',
        requirements: [
          'Node.js 18+ and npm/yarn',
          'SQL Server 2019+ or Azure SQL Database',
          'Redis 6+ for caching',
          'Firebase project for authentication',
          'Magento 2.4+ instance with API access',
          'SSL certificates for HTTPS'
        ],
        code: `# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt update
sudo apt install redis-server

# Install SQL Server (Ubuntu)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
sudo apt-get update
sudo apt-get install -y mssql-server

# Configure SQL Server
sudo /opt/mssql/bin/mssql-conf setup`
      }
    },
    {
      label: 'Database Configuration',
      icon: <DatabaseIcon />,
      content: {
        description: 'Set up and configure the SQL Server database with required schemas',
        requirements: [
          'Create TECHNO_ETL database',
          'Configure user permissions',
          'Import initial schema',
          'Set up connection pooling',
          'Configure backup strategy'
        ],
        code: `-- Create database
CREATE DATABASE TECHNO_ETL;
GO

USE TECHNO_ETL;
GO

-- Create tables
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

-- Create indexes for performance
CREATE INDEX IX_Products_SKU ON Products(SKU);
CREATE INDEX IX_Products_Changed ON Products(Changed, ModifiedDate);
CREATE INDEX IX_Inventory_SourceCode ON Inventory(SourceCode, Changed);`
      }
    },
    {
      label: 'Backend Deployment',
      icon: <DeployIcon />,
      content: {
        description: 'Deploy and configure the Node.js backend API server',
        requirements: [
          'Clone repository and install dependencies',
          'Configure environment variables',
          'Set up PM2 for process management',
          'Configure reverse proxy (Nginx)',
          'Set up SSL certificates'
        ],
        code: `# Clone and setup backend
git clone https://github.com/techno-dz/techno-etl.git
cd techno-etl/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
cat > .env << EOF
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=1433
DB_NAME=TECHNO_ETL
DB_USER=techno_user
DB_PASSWORD=secure_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
MAGENTO_BASE_URL=https://your-magento-site.com
MAGENTO_API_TOKEN=your_magento_token
FIREBASE_PROJECT_ID=your_firebase_project
EOF

# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup`
      }
    },
    {
      label: 'Frontend Deployment',
      icon: <DeployIcon />,
      content: {
        description: 'Build and deploy the React frontend application',
        requirements: [
          'Build production bundle',
          'Configure environment variables',
          'Set up web server (Nginx)',
          'Configure routing and caching',
          'Set up monitoring'
        ],
        code: `# Frontend deployment
cd ../frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_BASE_URL=https://api.your-domain.com/v1
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project
REACT_APP_MAGENTO_BASE_URL=https://your-magento-site.com
EOF

# Build production bundle
npm run build

# Copy build files to web server
sudo cp -r build/* /var/www/html/techno-etl/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/techno-etl/
sudo chmod -R 755 /var/www/html/techno-etl/`
      }
    },
    {
      label: 'Security & SSL Configuration',
      icon: <SecurityIcon />,
      content: {
        description: 'Configure security settings, SSL certificates, and firewall rules',
        requirements: [
          'Install SSL certificates',
          'Configure HTTPS redirects',
          'Set up firewall rules',
          'Configure rate limiting',
          'Set up monitoring and logging'
        ],
        code: `# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Configure Nginx with SSL
sudo tee /etc/nginx/sites-available/techno-etl << EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    root /var/www/html/techno-etl;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/techno-etl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx`
      }
    }
  ];

  const environmentConfigs = [
    {
      name: 'Development',
      description: 'Local development environment',
      config: {
        'NODE_ENV': 'development',
        'PORT': '3001',
        'DB_HOST': 'localhost',
        'REDIS_HOST': 'localhost',
        'LOG_LEVEL': 'debug'
      }
    },
    {
      name: 'Staging',
      description: 'Pre-production testing environment',
      config: {
        'NODE_ENV': 'staging',
        'PORT': '3001',
        'DB_HOST': 'staging-db.company.com',
        'REDIS_HOST': 'staging-redis.company.com',
        'LOG_LEVEL': 'info'
      }
    },
    {
      name: 'Production',
      description: 'Live production environment',
      config: {
        'NODE_ENV': 'production',
        'PORT': '3001',
        'DB_HOST': 'prod-db.company.com',
        'REDIS_HOST': 'prod-redis.company.com',
        'LOG_LEVEL': 'warn'
      }
    }
  ];

  const monitoringSetup = `# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Set up health checks
cat > healthcheck.js << EOF
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log('Health check failed');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
EOF

# Add to crontab for monitoring
echo "*/5 * * * * /usr/bin/node /path/to/healthcheck.js" | crontab -`;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🚀 Deployment Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Complete deployment guide for TECHNO-ETL production environment
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Production Ready" color="primary" />
              <Chip label="Scalable" color="success" />
              <Chip label="Secure" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Overview */}
        <motion.div variants={itemVariants}>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>🎯 Deployment Overview</Typography>
            This comprehensive deployment guide covers the complete setup process for TECHNO-ETL in production environments. 
            Follow these steps to deploy a secure, scalable, and high-performance system with proper monitoring and backup strategies.
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
                      <ListItemText primary="4 CPU cores" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="8 GB RAM" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="100 GB SSD storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Ubuntu 20.04+ or CentOS 8+" />
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
                      <ListItemText primary="8 CPU cores" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="16 GB RAM" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="500 GB SSD storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Load balancer setup" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Enterprise
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="16+ CPU cores" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="32+ GB RAM" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="1+ TB SSD storage" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="High availability cluster" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Deployment Steps */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📝 Deployment Steps
          </Typography>
          <Paper sx={{ p: 3, mb: 6 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {deploymentSteps.map((step, index) => (
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
                    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto', mb: 2 }}>
                      <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {step.content.code}
                      </pre>
                    </Paper>

                    <Box sx={{ mb: 1 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === deploymentSteps.length - 1}
                        >
                          {index === deploymentSteps.length - 1 ? 'Finish' : 'Continue'}
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
            {activeStep === deploymentSteps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>All deployment steps completed! Your TECHNO-ETL system is ready for production.</Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset Guide
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>

        {/* Environment Configurations */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ⚙️ Environment Configurations
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {environmentConfigs.map((env, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary.main">
                      {env.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {env.description}
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                      <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                        {Object.entries(env.config).map(([key, value]) => 
                          `${key}=${value}\n`
                        ).join('')}
                      </pre>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Monitoring & Maintenance */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📊 Monitoring & Maintenance
          </Typography>
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Health Monitoring Setup</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', overflow: 'auto' }}>
                <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {monitoringSetup}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Important Security Notes
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Change all default passwords and secrets" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Enable firewall and configure proper rules" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Set up regular security updates" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Configure backup and disaster recovery" />
              </ListItem>
            </List>
          </Alert>

          <Alert severity="success">
            <Typography variant="h6" gutterBottom>
              <CheckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Post-Deployment Checklist
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="✅ All services running and accessible" />
              </ListItem>
              <ListItem>
                <ListItemText primary="✅ SSL certificates installed and valid" />
              </ListItem>
              <ListItem>
                <ListItemText primary="✅ Database connections working" />
              </ListItem>
              <ListItem>
                <ListItemText primary="✅ API endpoints responding correctly" />
              </ListItem>
              <ListItem>
                <ListItemText primary="✅ Monitoring and logging configured" />
              </ListItem>
              <ListItem>
                <ListItemText primary="✅ Backup strategy implemented" />
              </ListItem>
            </List>
          </Alert>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default DeploymentGuide;
