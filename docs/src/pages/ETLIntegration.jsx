import React from 'react';
import { Container, Typography, Box, Paper, Divider, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import CodeBlock from '../components/CodeBlock';

const ETLIntegration = () => {
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
            ETL Integration Guide
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Comprehensive guide to Techno's ETL (Extract, Transform, Load) data integration process
          </Typography>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              ETL Process Overview
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/docs/images/etl-flow.svg"
                alt="ETL Flow Diagram"
                style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
              />
            </Box>
          </Paper>
        </motion.div>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Data Sources
                </Typography>
                <Typography paragraph>
                  Our ETL pipeline integrates data from multiple sources:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    Magento e-commerce platform (orders, products, customers)
                  </Typography>
                  <Typography component="li" paragraph>
                    JD Edwards EnterpriseOne (inventory, finance)
                  </Typography>
                  <Typography component="li" paragraph>
                    CEGID retail management system (POS data, store operations)
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" gutterBottom>
                  Transformation Rules
                </Typography>
                <Typography paragraph>
                  Data transformation includes:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" paragraph>
                    Data cleaning and validation
                  </Typography>
                  <Typography component="li" paragraph>
                    Format standardization
                  </Typography>
                  <Typography component="li" paragraph>
                    Business rule application
                  </Typography>
                  <Typography component="li" paragraph>
                    Data enrichment and aggregation
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, my: 4 }}>
            <Typography variant="h4" gutterBottom>
              Implementation Example
            </Typography>
            <CodeBlock
              language="python"
              code={`
import pandas as pd
from sqlalchemy import create_engine
from typing import Dict, List

class ETLPipeline:
    def __init__(self, config: Dict):
        self.source_db = create_engine(config['source_uri'])
        self.target_db = create_engine(config['target_uri'])
        
    def extract_data(self, source: str) -> pd.DataFrame:
        """Extract data from source system"""
        if source == 'magento':
            query = """
                SELECT o.increment_id, o.created_at, o.status,
                       c.email, p.sku, oi.qty_ordered
                FROM sales_order o
                JOIN customer_entity c ON o.customer_id = c.entity_id
                JOIN sales_order_item oi ON o.entity_id = oi.order_id
                JOIN catalog_product_entity p ON oi.product_id = p.entity_id
                WHERE o.created_at >= :start_date
            """
            return pd.read_sql(query, self.source_db, params={'start_date': '2025-01-01'})
            
    def transform_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply transformation rules"""
        # Clean and standardize data
        df['email'] = df['email'].str.lower()
        df['status'] = df['status'].str.upper()
        
        # Add derived columns
        df['order_date'] = pd.to_datetime(df['created_at']).dt.date
        df['order_month'] = pd.to_datetime(df['created_at']).dt.to_period('M')
        
        # Aggregate by month and status
        monthly_stats = df.groupby(['order_month', 'status']).agg({
            'increment_id': 'count',
            'qty_ordered': 'sum'
        }).reset_index()
        
        return monthly_stats
        
    def load_data(self, df: pd.DataFrame, target_table: str):
        """Load transformed data to target system"""
        df.to_sql(
            target_table,
            self.target_db,
            if_exists='append',
            index=False
        )
        
    def run_pipeline(self, source: str, target_table: str):
        """Execute the full ETL pipeline"""
        try:
            # Extract
            raw_data = self.extract_data(source)
            
            # Transform
            transformed_data = self.transform_data(raw_data)
            
            # Load
            self.load_data(transformed_data, target_table)
            
            print(f"Successfully processed {len(raw_data)} records")
            
        except Exception as e:
            print(f"Error in ETL pipeline: {str(e)}")
            raise

# Usage example
config = {
    'source_uri': 'mysql://user:pass@magento-db/magento',
    'target_uri': 'postgresql://user:pass@warehouse-db/analytics'
}

pipeline = ETLPipeline(config)
pipeline.run_pipeline('magento', 'order_analytics')`}
            />
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Scheduling and Monitoring
            </Typography>
            <Typography paragraph>
              The ETL pipeline is scheduled to run at specific intervals:
            </Typography>
            <CodeBlock
              language="yaml"
              code={`
# Airflow DAG configuration
default_args:
  owner: 'techno'
  start_date: '2025-02-03'
  retries: 3
  retry_delay: minutes(5)

schedule_interval: '0 */4 * * *'  # Every 4 hours

tasks:
  - extract_magento_data:
      timeout: 1800  # 30 minutes
      
  - extract_jde_data:
      timeout: 1800
      
  - transform_data:
      timeout: 3600  # 1 hour
      
  - load_warehouse:
      timeout: 1800
      
alerts:
  email:
    - data_team@technostationery.com
  slack:
    channel: '#etl-monitoring'`}
            />
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default ETLIntegration;
