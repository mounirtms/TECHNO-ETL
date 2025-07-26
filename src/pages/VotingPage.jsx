/**
 * VotingPage - Main page for feature voting and roadmap
 */
import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography
} from '@mui/material';
import {
  HowToVote
} from '@mui/icons-material';
import {
  Timeline
} from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import VotingGrid from '../components/grids/VotingGrid';
import EnhancedVotingGrid from '../components/grids/EnhancedVotingGrid';
import RoadmapGrid from '../components/grids/RoadmapGrid';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';

/**
 * Tab panel component
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voting-tabpanel-${index}`}
      aria-labelledby={`voting-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * VotingPage Component
 */
const VotingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>


      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Feature Voting & Roadmap
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Help shape the future of our platform by voting on features and tracking development progress
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<HowToVote />} 
            label="Feature Voting" 
            id="voting-tab-0"
            aria-controls="voting-tabpanel-0"
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<Timeline />} 
            label="Development Roadmap" 
            id="voting-tab-1"
            aria-controls="voting-tabpanel-1"
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <ComponentErrorBoundary componentName="Enhanced Voting Grid">
          <EnhancedVotingGrid userId="current_user" />
        </ComponentErrorBoundary>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ComponentErrorBoundary componentName="Roadmap Grid">
          <RoadmapGrid />
        </ComponentErrorBoundary>
      </TabPanel>
    </Container>
  );
};

export default VotingPage;