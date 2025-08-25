/**
 * TaskPage - Main page for task management and roadmap
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
  Task
} from '@mui/icons-material';
import {
  Timeline
} from '@mui/lab';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import VotingGrid from '../components/grids/VotingGrid';
import ProfessionalVotingGrid from '../components/grids/ProfessionalVotingGrid';
import RoadmapGrid from '../components/grids/RoadmapGrid';
import ComponentErrorBoundary from '../components/common/ComponentErrorBoundary';

/**
 * Tab panel component
 */
function TabPanel({ children, value, index, ...other } as any) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
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
 * TaskPage Component
 */
const TaskPage = () => {
  const { translate } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 } as any}>
 

      {/* Tabs */}
      <Paper sx={{ mb: 3 } as any}>
        <Tabs 
          value={activeTab} 
          onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' } as any}
        >
          <Tab
            icon={<Task />}
            label="Task Management"
            id="task-tab-0"
            aria-controls="task-tabpanel-0"
            sx={{ minHeight: 64 } as any}
          />
          <Tab
            icon={<Timeline />}
            label="Development Roadmap"
            id="task-tab-1"
            aria-controls="task-tabpanel-1"
            sx={{ minHeight: 64 } as any}
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <ComponentErrorBoundary componentName="Professional Voting Grid">
          <ProfessionalVotingGrid userId="current_user" />
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

export default TaskPage;