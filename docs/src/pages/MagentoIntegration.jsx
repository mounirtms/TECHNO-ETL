import React from 'react';
import { Container, Typography, Box, Paper, Divider, Grid, Link } from '@mui/material';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const MagentoIntegration = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
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
            Magento Integration Guide
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Complete guide to integrating Adobe Commerce (Magento) with the Techno ecosystem
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Link
              href="https://developer.adobe.com/commerce/webapi/rest"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Official Adobe Commerce REST API Documentation
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Link>
          </Box>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>
              The Magento integration enables seamless synchronization between your Adobe Commerce store and Techno's systems.
              This integration supports real-time product updates, order management, customer data synchronization, and inventory tracking.
            </Typography>
          </Paper>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Authentication
                </Typography>
                <Typography paragraph>
                  Authentication is handled through OAuth 2.0 tokens. You'll need to generate an integration token
                  from your Magento admin panel:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    Go to System → Integrations
                  </Typography>
                  <Typography component="li" paragraph>
                    Click "Add New Integration"
                  </Typography>
                  <Typography component="li" paragraph>
                    Fill in the integration details
                  </Typography>
                  <Typography component="li" paragraph>
                    Select the required API resources
                  </Typography>
                </Box>
                <CodeBlock
                  language="bash"
                  code={`
# Example API request with token
curl -X GET \\
  "https://your-store.com/rest/V1/products" \\
  -H "Authorization: Bearer your_access_token"`}
                />
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  API Endpoints
                </Typography>
                <Typography paragraph>
                  Common endpoints used in the integration:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    /V1/products - Product management
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/orders - Order processing
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/customers - Customer data
                  </Typography>
                  <Typography component="li" paragraph>
                    /V1/inventory - Stock management
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Inventory Management
            </Typography>
            <Typography paragraph>
              The inventory lifecycle in Magento integration follows a comprehensive flow that ensures accurate stock management across all channels.
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/inventory-lifecycle.svg"
                alt="Inventory Lifecycle"
                style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </Box>
            <Typography paragraph>
              This diagram illustrates the complete lifecycle of inventory management, from initial stock updates to final order fulfillment.
            </Typography>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, my: 4 }}>
            <Typography variant="h4" gutterBottom>
              Integration Example
            </Typography>
            <CodeBlock
              language="javascript"
              code={`
// Example: Product Sync with Magento
const axios = require('axios');

async function syncProducts() {
  const config = {
    baseURL: 'https://your-store.com/rest/V1',
    headers: {
      'Authorization': \`Bearer \${process.env.MAGENTO_ACCESS_TOKEN}\`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Fetch products from Magento
    const response = await axios.get('/products', config);
    
    // Process each product
    for (const product of response.data.items) {
      await updateLocalInventory(product);
    }
  } catch (error) {
    console.error('Magento API Error:', error);
    throw error;
  }
}

async function updateLocalInventory(product) {
  // Update local database with product data
  await db.products.upsert({
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: product.extension_attributes.stock_item.qty
  });
}`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Webhook Configuration
            </Typography>
            <Typography paragraph>
              Configure webhooks to receive real-time updates:
            </Typography>
            <CodeBlock
              language="json"
              code={`
{
  "name": "Order Update Webhook",
  "endpoint": "https://api.technostationery.com/webhooks/magento/orders",
  "topics": [
    "sales_order_save_after",
    "sales_order_status_change"
  ],
  "authentication": {
    "type": "hmac",
    "secret": "your_webhook_secret"
  }
}`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Testing Resources
            </Typography>
            <Typography paragraph>
              Use our testing environments to validate your integration:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" paragraph>
                <Link
                  href="https://beta.technostationery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  Beta Environment
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Typography>
              <Typography component="li" paragraph>
                <Link
                  href="https://www.postman.com/techno-e-commerce/techno-e-commerce-workspace/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  Postman Collection
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default MagentoIntegration;
