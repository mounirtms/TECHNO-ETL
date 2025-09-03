import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, FOOTER_HEIGHT, TAB_HEADER_HEIGHT } from './Constants';
import { useRoutePerformance, useDocumentTitle } from '../../hooks/useRoutePerformance';

const TabPanel = () => {
  const theme = useTheme();
  const { tabs, activeTab, openTab, getActiveComponent } = useTab();
  const [tabPanelHeight, setTabPanelHeight] = useState('100%');

  // Add route performance monitoring
  const routePerformance = useRoutePerformance();

  useDocumentTitle();

  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      // Correctly account for both main header and tab header heights
      const calculatedHeight = windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT - TAB_HEADER_HEIGHT;

      setTabPanelHeight(`${calculatedHeight}px`);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const handleChange = (event, newValue) => {
    // Validate newValue before opening tab
    if (typeof newValue === 'string' && newValue.trim() !== '') {
      // Only update if the new value exists in our tabs
      const tabExists = tabs.some(tab => tab.id === newValue);

      if (tabExists) {
        openTab(newValue);
      } else {
        // Fallback to first tab if not found
        openTab(tabs[0]?.id || 'Dashboard');
      }
    }
  };

  // Safety check for activeTab validity
  const validTabIds = tabs?.map(tab => tab.id) || [];
  const safeActiveTab = validTabIds.includes(activeTab) ? activeTab : (validTabIds.length > 0 ? validTabIds[0] : 'Dashboard');

  const ActiveComponent = getActiveComponent();

  return (
    <Box sx={{
      width: '100%',
      marginTop: `${HEADER_HEIGHT}px`,
      height: tabPanelHeight,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {(!tabs || tabs.length === 0) ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
        }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading tabs...</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: theme.palette.background.paper,
            minHeight: `${TAB_HEADER_HEIGHT}px`,
            height: `${TAB_HEADER_HEIGHT}px`,
          }}>
            <Tabs
              value={safeActiveTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: `${TAB_HEADER_HEIGHT}px`,
                height: `${TAB_HEADER_HEIGHT}px`,
                '& .MuiTab-root': {
                  minWidth: { xs: 80, sm: 120 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  padding: { xs: '4px 6px', sm: '8px 12px' },
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  value={tab.id}
                  sx={{
                    minHeight: `${TAB_HEADER_HEIGHT}px`,
                  }}
                />
              ))}
            </Tabs>
          </Box>
          <Box sx={{
            flexGrow: 1,
            overflow: 'auto',
            height: `calc(100% - ${TAB_HEADER_HEIGHT}px)`,
          }}>
            <Suspense fallback={
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}>
                <CircularProgress />
              </Box>
            }>
              <ActiveComponent />
            </Suspense>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TabPanel;