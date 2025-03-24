import React from 'react';
import { Container, Typography, Box, Paper, Divider, Grid, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

const ETLIntegration = () => {
  const youtubeVideoIds = [
    'dQw4w9WgXcQ', // Example video IDs, replace with actual Magento API sync videos
    'dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CoolTitle variant="h2" gutterBottom>
        MDM to Magento ETL Integration 🚀
      </CoolTitle>
      <CoolSubtitle variant="subtitle1" paragraph>
        Seamlessly synchronize inventory and pricing between your MDM and Magento, ensuring data accuracy and efficiency.
      </CoolSubtitle>
      <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.1)' }} />
      <Box sx={{ my: 2 }}>
        <img
          src="/docs/images/etl-flow.svg"
          alt="ETL Flow Diagram"
          style={{ width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', display: 'block' }}
        />
      </Box>

      {/* Overview */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Overview 🔍
        </CoolTitle>
        <Typography variant="body1">
          This documentation outlines the automated and manual synchronization of product stock and pricing between your Master Data Management (MDM) database and Magento. The Extract, Transform, Load (ETL) process ensures consistent and accurate inventory and pricing data across all channels.
        </Typography>
        <CoolTitle variant="h4" sx={{ mt: 3, mb: 1 }}>
          Technology Stack 🛠️
        </CoolTitle>
        <List>
          <CoolListItem>
            <ListItemText primary="Backend:" secondary="Node.js, Express.js" />
          </CoolListItem>
          <CoolListItem>
            <ListItemText primary="Database:" secondary="SQL Server (MDM)" />
          </CoolListItem>
          <CoolListItem>
            <ListItemText primary="E-commerce Platform:" secondary="Magento 2 (via REST API)" />
          </CoolListItem>
          <CoolListItem>
            <ListItemText primary="Scheduling:" secondary="Node-cron" />
          </CoolListItem>
          <CoolListItem>
            <ListItemText primary="Data Transfer:" secondary="Axios (REST API Calls)" />
          </CoolListItem>
        </List>
      </CoolPaper>

      {/* Inventory Sync Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Inventory Synchronization 📦
        </CoolTitle>

        <CoolTitle variant="h5" sx={{ mt: 3, mb: 2 }}>
          Automated Inventory Sync 🤖
        </CoolTitle>
        <Typography variant="body1">
          The system automatically synchronizes inventory every night at 2 AM, fetching stock data from the MDM and updating Magento stock levels to ensure real-time accuracy.
        </Typography>
        <CodeBlock language="javascript">
          {`// Scheduled inventory sync (runs daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  // ... (Your inventory sync code)
});`}
        </CodeBlock>

        <CoolTitle variant="h5" sx={{ mt: 4, mb: 2 }}>
          Manual Inventory Sync 🖱️
        </CoolTitle>
        <Typography variant="body1">
          Users can manually synchronize inventory by selecting products in the MDM Products Grid and clicking the "Sync" button, providing on-demand updates.
        </Typography>
        <Typography variant="body1">
          <strong>Sync Logic:</strong> Extract stock data from MDM, transform it by mapping MDM sources to Magento sources, and load the data into Magento using the V1/inventory/source-items API.
        </Typography>
        <CodeBlock language="javascript">
          {`// Manual inventory sync endpoint
router.post('/api/inventory/sync-manual', authMiddleware, async (req, res) => {
  // ... (Your manual inventory sync code)
});`}
        </CodeBlock>
      </CoolPaper>

      {/* Price Sync Section */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Price Synchronization 💰
        </CoolTitle>

        <CoolTitle variant="h5" sx={{ mt: 3, mb: 2 }}>
          Automated Price Sync 🔄
        </CoolTitle>
        <Typography variant="body1">
          Prices are automatically fetched and synchronized every night, ensuring Magento reflects the latest pricing from the MDM.
        </Typography>

        <CoolTitle variant="h5" sx={{ mt: 4, mb: 2 }}>
          Manual Price Sync ✍️
        </CoolTitle>
        <Typography variant="body1">
          Users can manually update prices via an API or a UI button, allowing for immediate price adjustments as needed.
        </Typography>
        <Typography variant="body1">
          <strong>Sync Logic:</strong> Extract price data from MDM, transform and format the data appropriately, and load it into Magento via the bulk product API.
        </Typography>
        <CodeBlock language="javascript">
          {`// Fetch prices from MDM (Node.js)
async function fetchPricesFromMDM() {
  // ... (Your price fetching code)
}`}
        </CodeBlock>
      </CoolPaper>

      {/* Learn More */}
      <CoolPaper>
        <CoolTitle variant="h3" gutterBottom>
          Learn More (YouTube Resources) 🎥
        </CoolTitle>
        <Typography variant="body1">
          Explore these helpful YouTube resources to learn more about synchronizing Magento stock using the API.
        </Typography>
        <YouTubeContainer>
          {youtubeVideoIds.map((videoId) => (
            <YouTube key={videoId} videoId={videoId} opts={{ width: '100%', height: '200' }} />
          ))}
        </YouTubeContainer>
      </CoolPaper>
    </Container>
  );
};

export default ETLIntegration;