import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  styled,
} from '@mui/material';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import YouTube from 'react-youtube';

// Styled Components
const CoolPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const CoolTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
}));

const CoolSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
  fontStyle: 'italic',
}));

const CoolListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  '& .MuiListItemText-primary': {
    fontWeight: 500,
  },
}));

const YouTubeContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '30px',
});

const CodeBlock = ({ language, children }) => (
  <SyntaxHighlighter language={language} style={okaidia}>
    {children}
  </SyntaxHighlighter>
);

const ETLIntegration = () => {
  const youtubeVideoIds = [
    'RZhbcneTa-c',
    '4EwdVm3Enrs',
    'TQplf-9jvgk',
    '9AQnNSahpNg',

  ];

  return (
    <Container sx={{ py: 4 }}>
      <CoolTitle variant="h2" gutterBottom>
        MDM to Magento ETL Integration 🚀
      </CoolTitle>
      <CoolSubtitle variant="subtitle1" paragraph>
        Seamlessly synchronize inventory and pricing between your MDM and Magento, ensuring data accuracy and efficiency.
      </CoolSubtitle>
      <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

      {/* System Architecture Diagram */}
      <Box sx={{ my: 2 }}>
        <img
          src="/docs/images/etl-flow.svg"
          alt="ETL Flow Diagram"
          style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
        />
      </Box>

      {/* Overview Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Overview 🔍
        </CoolTitle>
        <Typography variant="body1" paragraph>
          Our ETL integration system provides a robust pipeline for synchronizing product data between the Master Data Management (MDM) system and Magento e-commerce platform. The system handles both inventory levels and pricing information with automated nightly syncs and on-demand manual updates.
        </Typography>

        <CoolTitle variant="h4" sx={{ mt: 3, mb: 1 }}>
          Key Features ✨
        </CoolTitle>
        <List>
          <CoolListItem>
            <ListItemText
              primary="• Bi-directional data synchronization"
              secondary="Supports both MDM → Magento and Magento → MDM flows"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Multi-source inventory management"
              secondary="Handles complex inventory across multiple warehouses"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Price tier synchronization"
              secondary="Supports customer group specific pricing"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Conflict resolution"
              secondary="Automated handling of data discrepancies"
            />
          </CoolListItem>
        </List>

        <CoolTitle variant="h4" sx={{ mt: 3, mb: 1 }}>
          Technology Stack 🛠️
        </CoolTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List>
              <CoolListItem>
                <ListItemText primary="Backend:" secondary="Node.js, Express.js" />
              </CoolListItem>
              <CoolListItem>
                <ListItemText primary="Database:" secondary="SQL Server (MDM)" />
              </CoolListItem>
              <CoolListItem>
                <ListItemText primary="E-commerce Platform:" secondary="Magento 2.4+" />
              </CoolListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <CoolListItem>
                <ListItemText primary="API Communication:" secondary="REST, GraphQL" />
              </CoolListItem>
              <CoolListItem>
                <ListItemText primary="Scheduling:" secondary="Node-cron" />
              </CoolListItem>
              <CoolListItem>
                <ListItemText primary="Monitoring:" secondary="Prometheus, Grafana" />
              </CoolListItem>
            </List>
          </Grid>
        </Grid>
      </CoolPaper>

      {/* Inventory Sync Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Inventory Synchronization 📦
        </CoolTitle>
        <Typography variant="body1" paragraph>
          The inventory synchronization system ensures accurate stock levels across all sales channels by regularly updating Magento with the latest inventory data from MDM.
        </Typography>

        <CoolTitle variant="h4" sx={{ mt: 3, mb: 1 }}>
          Automated Inventory Sync 🤖
        </CoolTitle>
        <Typography variant="body1" paragraph>
          The system automatically synchronizes inventory every night at 2 AM, processing approximately 15,000 SKUs across all warehouses in under 30 minutes.
        </Typography>
        <CodeBlock language="javascript">
          {`// Scheduled inventory sync configuration
const inventoryJob = new CronJob('0 2 * * *', async () => {
  try {
    const sources = await InventorySource.findActive();
    const results = await Promise.all(sources.map(source => 
      processInventoryBatch({
        sourceId: source.id,
        batchSize: 250,
        delay: 1500
      })
    ));
    
    const totalSynced = results.reduce((sum, r) => sum + r.count, 0);
    logger.info(\`Nightly sync completed: \${totalSynced} items updated\`);
    
    // Send notification to operations team
    await sendSyncReport({
      type: 'inventory',
      success: true,
      itemsProcessed: totalSynced,
      errors: results.flatMap(r => r.errors)
    });
  } catch (error) {
    logger.error('Nightly inventory sync failed', error);
    alertSystem.notifyAdmin('Inventory sync failed', error);
  }
});`}
        </CodeBlock>

        <CoolTitle variant="h4" sx={{ mt: 4, mb: 1 }}>
          Manual Inventory Sync 🖱️
        </CoolTitle>
        <Typography variant="body1" paragraph>
          Users can trigger manual synchronization through the admin interface, with options to sync specific products, categories, or warehouses.
        </Typography>
        <CodeBlock language="javascript">
          {`// Manual sync API endpoint
router.post('/api/inventory/sync-manual', [
  authMiddleware,
  validate({
    skus: { type: 'array', items: 'string', optional: true },
    sourceId: { type: 'string', optional: true },
    forceFullSync: { type: 'boolean', default: false }
  })
], async (req, res) => {
  try {
    const { user } = req;
    const { skus, sourceId, forceFullSync } = req.body;
    
    // Audit log
    await AuditLog.create({
      action: 'manual_inventory_sync',
      userId: user.id,
      metadata: { skus, sourceId }
    });
    
    const result = await InventorySyncService.executeManualSync({
      user,
      skus: skus || await getChangedSkus(forceFullSync ? null : '24h'),
      sourceId
    });
    
    res.json({
      success: true,
      processed: result.processedCount,
      errors: result.errors
    });
  } catch (error) {
    res.status(500).json({
      error: 'SYNC_FAILED',
      details: error.message
    });
  }
});`}
        </CodeBlock>

        <CoolTitle variant="h5" sx={{ mt: 3, mb: 1 }}>
          Sync Process Details
        </CoolTitle>
        <List>
          <CoolListItem>
            <ListItemText
              primary="• Batch Processing"
              secondary="Processes 250 items per batch with 1.5s delay between batches"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Change Detection"
              secondary="Only syncs items changed in last 24 hours (configurable)"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Error Handling"
              secondary="3 automatic retries with exponential backoff"
            />
          </CoolListItem>
        </List>
      </CoolPaper>

      {/* Price Sync Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Price Synchronization 💰
        </CoolTitle>
        <Typography variant="body1" paragraph>
          The price synchronization system ensures accurate and up-to-date pricing across all sales channels, with support for complex pricing rules and customer group pricing.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <CoolTitle variant="h4" sx={{ mb: 1 }}>
              Automated Price Sync 🔄
            </CoolTitle>
            <Typography variant="body1" paragraph>
              Prices are automatically synchronized every night at 3 AM, after inventory updates complete.
            </Typography>
            <CodeBlock language="javascript">
              {`// Price sync configuration
const priceSyncJob = new CronJob('0 3 * * *', async () => {
  try {
    const priceChanges = await PriceChangeDetector.getRecentChanges('24h');
    
    if (priceChanges.length === 0) {
      logger.info('No price changes detected - skipping sync');
      return;
    }
    
    const result = await PriceSyncService.executeBatchSync({
      changes: priceChanges,
      batchSize: 500,
      delay: 2000
    });
    
    logger.info(\`Price sync completed: \${result.successCount} updated, \${result.failedCount} failed\`);
    
    if (result.failedCount > 0) {
      await alertSystem.notifyPriceTeam(result.failedItems);
    }
  } catch (error) {
    logger.error('Price sync failed', error);
    alertSystem.notifyAdmin('Price sync failed', error);
  }
});`}
            </CodeBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <CoolTitle variant="h4" sx={{ mb: 1 }}>
              Manual Price Sync ✍️
            </CoolTitle>
            <Typography variant="body1" paragraph>
              Marketing and sales teams can trigger immediate price updates through the admin UI or API.
            </Typography>
            <CodeBlock language="javascript">
              {`// Manual price update endpoint
router.post('/api/prices/update', [
  authMiddleware,
  validate({
    updates: {
      type: 'array',
      items: {
        type: 'object',
        props: {
          sku: 'string',
          price: 'number',
          customerGroupId: { type: 'string', optional: true }
        }
      }
    }
  })
], async (req, res) => {
  try {
    const result = await PriceSyncService.executeImmediateUpdate(
      req.body.updates,
      req.user.id
    );
    
    res.json({
      success: true,
      updated: result.updatedCount,
      failed: result.failedItems
    });
  } catch (error) {
    res.status(500).json({
      error: 'PRICE_UPDATE_FAILED',
      details: error.message
    });
  }
});`}
            </CodeBlock>
          </Grid>
        </Grid>

        <CoolTitle variant="h5" sx={{ mt: 3, mb: 1 }}>
          Price Sync Features
        </CoolTitle>
        <List>
          <CoolListItem>
            <ListItemText
              primary="• Tier Pricing Support"
              secondary="Handles customer group specific pricing"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Special Price Handling"
              secondary="Manages sale prices and promotions"
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Currency Conversion"
              secondary="Automatic conversion for international stores"
            />
          </CoolListItem>
        </List>
      </CoolPaper>

      {/* Monitoring Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Monitoring & Alerting 🚨
        </CoolTitle>
        <Typography variant="body1" paragraph>
          Comprehensive monitoring ensures system health and data accuracy with real-time alerts for synchronization issues.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <CoolTitle variant="h4" sx={{ mb: 1 }}>
              System Metrics
            </CoolTitle>
            <CodeBlock language="javascript">
              {`// Example monitoring metrics
const metrics = {
  lastSync: new Date(),
  duration: 125, // seconds
  itemsProcessed: 1245,
  successRate: 0.998,
  apiPerformance: {
    inventory: {
      calls: 28,
      avgResponseTime: 320 // ms
    },
    pricing: {
      calls: 15,
      avgResponseTime: 280 // ms
    }
  },
  systemHealth: {
    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    uptime: process.uptime()
  }
};`}
            </CodeBlock>
          </Grid>
          <Grid item xs={12} md={6}>
            <CoolTitle variant="h4" sx={{ mb: 1 }}>
              Alert Configuration
            </CoolTitle>
            <CodeBlock language="yaml">
              {`# Alerting rules configuration
alert_rules:
  - name: "Sync Failure"
    condition: "success_rate < 0.95"
    severity: "critical"
    channels: ["email", "slack"]
    recipients: ["data-team@example.com"]
  
  - name: "High Latency"
    condition: "avg_response_time > 5000"
    severity: "warning"
    channels: ["slack"]
    recipients: ["devops@example.com"]`}
            </CodeBlock>
          </Grid>
        </Grid>
      </CoolPaper>

      {/* Resources Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Learning Resources 🎓
        </CoolTitle>
        <Typography variant="body1" paragraph>
          Explore these resources to learn more about our ETL integration system:
        </Typography>

        <CoolTitle variant="h4" sx={{ mb: 1 }}>
          Documentation Links
        </CoolTitle>
        <List>
          <CoolListItem>
            <ListItemText
              primary="• Technical Architecture Overview"
              secondary={<a href="/docs/architecture">/docs/architecture</a>}
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• API Reference Guide"
              secondary={<a href="/docs/api">/docs/api</a>}
            />
          </CoolListItem>
          <CoolListItem>
            <ListItemText
              primary="• Troubleshooting Handbook"
              secondary={<a href="/docs/troubleshooting">/docs/troubleshooting</a>}
            />
          </CoolListItem>
        </List>

        <CoolTitle variant="h4" sx={{ mt: 3, mb: 1 }}>
          Video Tutorials 🎥
        </CoolTitle>
        <YouTubeContainer>
          {youtubeVideoIds.map((videoId) => (
            <YouTube
              key={videoId}
              videoId={videoId}
              opts={{
                width: '100%',
                height: '200',
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                },
              }}
            />
          ))}
        </YouTubeContainer>
      </CoolPaper>
    </Container>
  );
};

export default ETLIntegration;
