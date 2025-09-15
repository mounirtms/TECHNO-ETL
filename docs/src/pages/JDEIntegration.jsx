import React from 'react';
import { Container, Typography, Box, Paper, Divider, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';

const JDEIntegration = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <Container maxWidth={false}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Typography variant="h2" component="h1" gutterBottom>
            JD Edwards Integration
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Comprehensive guide to integrating with JD Edwards Enterprise One
          </Typography>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              System Architecture
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/system-architecture.svg"
                alt="System Architecture"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
            <Typography paragraph>
              The integration with JD Edwards Enterprise One is built on a robust architecture that ensures reliable data synchronization and process automation.
            </Typography>
          </Paper>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, mb: 4, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Authentication
                </Typography>
                <Typography paragraph>
                  JDE integration requires proper authentication setup. Here's an example configuration:
                </Typography>
                <CodeBlock
                  language="javascript"
                  code={`
{
  "jdeConnection": {
    "environment": "JPS920",
    "role": "*ALL",
    "username": "JDE_USER",
    "password": "encrypted_password",
    "sessionTimeout": 3600,
    "maxPoolSize": 10
  }
}`}
                />
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, mb: 4, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  API Endpoints
                </Typography>
                <Typography paragraph>
                  Available endpoints for JDE integration:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" paragraph>
                    /api/v1/jde/inventory - Inventory management
                  </Typography>
                  <Typography component="li" paragraph>
                    /api/v1/jde/orders - Order processing
                  </Typography>
                  <Typography component="li" paragraph>
                    /api/v1/jde/customers - Customer data sync
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Inventory Lifecycle
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/inventory-lifecycle.svg"
                alt="Inventory Lifecycle"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
            <Typography paragraph>
              The inventory synchronization process follows a specific lifecycle:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Typography component="li" paragraph>
                Initial data extraction from JDE
              </Typography>
              <Typography component="li" paragraph>
                Data transformation and validation
              </Typography>
              <Typography component="li" paragraph>
                Synchronization with local system
              </Typography>
              <Typography component="li" paragraph>
                Status updates and confirmation
              </Typography>
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Example Integration
            </Typography>
            <Typography paragraph>
              Here's an example of how to integrate with the JDE API:
            </Typography>
            <CodeBlock
              language="javascript"
              code={`
// JDE API Integration Example
const jdeApi = {
  async getInventory(sku) {
    try {
      const response = await fetch('/api/v1/jde/inventory/' + sku, {
        headers: {
          'Authorization': 'Bearer ' + jdeToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json();
      return {
        sku: data.sku,
        quantity: data.onHandQty,
        location: data.primaryBin,
        lastUpdated: data.timestamp
      };
    } catch (error) {
      console.error('JDE API Error:', error);
      throw error;
    }
  }
};`}
            />
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default JDEIntegration;
