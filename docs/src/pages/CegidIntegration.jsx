import React from 'react';
import { Container, Typography, Box, Paper, Divider, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';

const CegidIntegration = () => {
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
            CEGID Integration Guide
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Comprehensive guide to integrating CEGID Business Retail with the Techno ecosystem
          </Typography>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>
              The CEGID integration enables seamless data exchange between CEGID Business Retail and your enterprise systems. 
              This integration focuses on synchronizing retail operations, inventory management, and financial data.
            </Typography>
          </Paper>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, mb: 4, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Key Features
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" paragraph>
                    Real-time inventory synchronization
                  </Typography>
                  <Typography component="li" paragraph>
                    Point of Sale (POS) integration
                  </Typography>
                  <Typography component="li" paragraph>
                    Customer data management
                  </Typography>
                  <Typography component="li" paragraph>
                    Sales reporting and analytics
                  </Typography>
                  <Typography component="li" paragraph>
                    Multi-store management
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, mb: 4, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  SOAP Configuration
                </Typography>
                <CodeBlock
                  language="xml"
                  code={`
<!-- CEGID SOAP Configuration -->
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <Security>
      <UsernameToken>
        <Username>your_username</Username>
        <Password>your_password</Password>
      </UsernameToken>
    </Security>
  </soap:Header>
  <soap:Body>
    <GetInventory>
      <StoreId>STORE001</StoreId>
      <ProductFilter>
        <Category>ALL</Category>
        <UpdatedSince>2025-02-03</UpdatedSince>
      </ProductFilter>
    </GetInventory>
  </soap:Body>
</soap:Envelope>`}
                />
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Integration Architecture
            </Typography>
            <Typography paragraph>
              The CEGID integration architecture consists of several key components:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Typography component="li" paragraph>
                SOAP API Gateway for secure communication
              </Typography>
              <Typography component="li" paragraph>
                Data transformation layer for format conversion
              </Typography>
              <Typography component="li" paragraph>
                Message queue for asynchronous processing
              </Typography>
              <Typography component="li" paragraph>
                Error handling and retry mechanism
              </Typography>
              <Typography component="li" paragraph>
                Monitoring and alerting system
              </Typography>
            </Box>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Implementation Example
            </Typography>
            <CodeBlock
              language="javascript"
              code={`
// Example: CEGID SOAP API Integration
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

async function fetchCegidInventory(storeId) {
  const url = 'https://api.cegid.com/retail/v1/inventory';
  const soapHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://api.cegid.com/GetInventory'
  };

  const xml = \`
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
      <!-- Authentication headers -->
      <soap:Body>
        <GetInventory>
          <StoreId>\${storeId}</StoreId>
        </GetInventory>
      </soap:Body>
    </soap:Envelope>
  \`;

  try {
    const { response } = await soapRequest({
      url: url,
      headers: soapHeaders,
      xml: xml,
      timeout: 5000
    });

    const { body } = response;
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(body);
    
    return result.Envelope.Body[0].GetInventoryResponse[0];
  } catch (error) {
    console.error('CEGID API Error:', error);
    throw error;
  }
}`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Best Practices
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" paragraph>
                Implement robust error handling and logging
              </Typography>
              <Typography component="li" paragraph>
                Use connection pooling for optimal performance
              </Typography>
              <Typography component="li" paragraph>
                Implement retry mechanisms with exponential backoff
              </Typography>
              <Typography component="li" paragraph>
                Regular monitoring of API health and performance
              </Typography>
              <Typography component="li" paragraph>
                Maintain detailed documentation of integration points
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default CegidIntegration;
