import React, { Suspense, memo, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme,
    useMediaQuery,
    CircularProgress,
    alpha,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useTab } from '../../contexts/TabContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import ComprehensiveDashboard from '../dashboard/ComprehensiveDashboard';

// ===== STYLED COMPONENTS =====

/**
 * Full-width, full-height tab panel container
 * Positioned between header and footer with no scrollbars
 */
const TabPanelContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    // Ensure proper centering
    alignItems: 'center',
    justifyContent: 'center'
}));

/**
 * Tab header with close buttons
 * Fixed height, no scrolling
 */
const TabsHeader = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    height: 48,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.98),
    backdropFilter: 'blur(8px)',
    boxShadow: theme.shadows[1],
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10
}));

/**
 * Optimized tabs with close functionality
 */
const StyledTabs = styled(Tabs, {
    shouldForwardProp: (prop) => !['isMobile', 'tabCount'].includes(prop)
})(({ theme, isMobile, tabCount }) => ({
    flex: 1,
    minHeight: 48,
    '& .MuiTabs-flexContainer': {
        height: 48,
        alignItems: 'center'
    },
    '& .MuiTab-root': {
        minWidth: isMobile ? 80 : 120,
        maxWidth: isMobile ? 120 : 200,
        height: 48,
        fontSize: isMobile ? '0.75rem' : '0.875rem',
        padding: isMobile ? '8px 8px' : '12px 16px',
        textTransform: 'none',
        fontWeight: 500,
        position: 'relative',
        transition: theme.transitions.create(['color', 'background-color'], {
            duration: theme.transitions.duration.short
        }),
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            color: theme.palette.primary.main
        },
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: 600,
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
        }
    },
    '& .MuiTabs-indicator': {
        height: 3,
        borderRadius: '3px 3px 0 0',
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
    },
    '& .MuiTabs-scrollButtons': {
        width: 40,
        '&.Mui-disabled': {
            opacity: 0.3
        }
    }
}));

/**
 * Tab with close button
 */
const TabWithClose = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%',
    justifyContent: 'space-between'
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    padding: 2,
    marginLeft: theme.spacing(0.5),
    opacity: 0.6,
    transition: theme.transitions.create(['opacity', 'color'], {
        duration: theme.transitions.duration.short
    }),
    '&:hover': {
        opacity: 1,
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1)
    }
}));

/**
 * Content area that fills remaining space
 * This is where tab content renders with its own scrolling
 */
const ContentArea = styled(Box)(({ theme }) => ({
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.palette.background.default
}));

/**
 * Content wrapper for individual tab content
 * Each tab content manages its own scrolling
 */
const ContentWrapper = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Ensure full width
    height: '100%', // Ensure full height
    
    // Grid-specific optimizations
    '& .MuiDataGrid-root': {
        border: 'none',
        height: '100%',
        width: '100%', // Ensure full width for DataGrid
        minHeight: 400, // Minimum height to prevent 0px issue
        '& .MuiDataGrid-main': {
            overflow: 'hidden'
        },
        '& .MuiDataGrid-virtualScroller': {
            overflow: 'auto !important'
        },
        '& .MuiDataGrid-toolbarContainer': {
            padding: theme.spacing(1, 2),
            minHeight: 56,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)'
        },
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `2px solid ${theme.palette.divider}`
        },
        '& .MuiDataGrid-row': {
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
            }
        }
    },
    
    // Dashboard and other page optimizations
    '& .dashboard-container': {
        height: '100%',
        width: '100%', // Ensure full width
        overflow: 'auto',
        padding: theme.spacing(2)
    },
    
    // Stats cards positioning for grids
    '& .stats-cards-container': {
        position: 'sticky',
        bottom: 0,
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2),
        zIndex: 5
    }
}));

/**
 * Loading state
 */
const LoadingContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.default, 0.8),
    backdropFilter: 'blur(4px)'
}));

/**
 * Error state
 */
const ErrorContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
    textAlign: 'center',
    padding: theme.spacing(4)
}));

// ===== MAIN COMPONENT =====

/**
 * Optimized TabPanel Component
 * 
 * Features:
 * - Full width and height between header and footer
 * - No scrollbars on container (only on tab content)
 * - Tab close functionality
 * - Perfect grid integration with stats cards
 * - Dashboard as default tab
 * - Enhanced performance with memoization
 */
const TabPanel = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { tabs, activeTabId: activeTab, openTab, closeTab, getActiveComponent } = useTab();

  // Add default dashboard tab if no tabs exist
  useEffect(() => {
    if (tabs.length === 0 && typeof openTab === 'function') {
      openTab('Dashboard');
    }
  }, [tabs.length, openTab]);

  // Ensure dashboard tab is always present
  useEffect(() => {
    const hasDashboard = tabs.some(tab => tab.id === 'Dashboard');
    if (!hasDashboard && typeof openTab === 'function') {
      openTab('Dashboard');
    }
  }, [tabs, openTab]);

  // Set active tab to dashboard if none is active
  useEffect(() => {
    if (tabs.length > 0 && !activeTab && typeof openTab === 'function') {
      openTab('Dashboard');
    }
  }, [tabs, activeTab, openTab]);

  // Handle tab change with optimized callback
  const handleTabChange = useCallback((event, tabId) => {
    if (typeof openTab === 'function') {
      openTab(tabId);
    }
  }, [openTab]);

  // Handle tab close with optimized callback
  const handleTabClose = useCallback((event, tabId) => {
    event.stopPropagation();
    if (tabs.length <= 1) return; // Prevent closing the last tab
    if (typeof closeTab === 'function') {
      closeTab(tabId);
    }
  }, [tabs.length, closeTab]);

  // Get active component with enhanced error handling and type checking
  const ActiveComponent = useMemo(() => {
    // If no active tab or active tab is Dashboard, show dashboard by default
    if (!activeTab || activeTab === 'Dashboard') {
      return () => <ComprehensiveDashboard />;
    }
    
    // Check if getActiveComponent exists and is a function
    if (typeof getActiveComponent !== 'function') {
      console.warn('getActiveComponent is not a function:', typeof getActiveComponent);
      console.warn('Available functions from useTab:', Object.keys(useTab()));
      // Return the default dashboard component
      return () => <ComprehensiveDashboard />;
    }
    
    try {
      const component = getActiveComponent();
      // If component is null or undefined, return dashboard
      return component || (() => <ComprehensiveDashboard />);
    } catch (error) {
      console.error('Error getting active component:', error);
      // Return the default dashboard component as fallback
      return () => <ComprehensiveDashboard />;
    }
  }, [getActiveComponent, activeTab]);

  // Render tab label with optional close button - memoized for performance
  const renderTabLabel = useCallback((tab) => {
    if (!tab.closeable) {
      return tab.label;
    }

    return (
      <TabWithClose>
        <span>{isMobile && tab.label.length > 10 
          ? `${tab.label.substring(0, 8)}...` 
          : tab.label
        }</span>
        <CloseButton
          size="small"
          onClick={(event) => handleTabClose(event, tab.id)}
          aria-label={`Close ${tab.label} tab`}
        >
          <CloseIcon fontSize="inherit" />
        </CloseButton>
      </TabWithClose>
    );
  }, [isMobile, handleTabClose]);

  // Memoized tabs list for better performance
  const memoizedTabs = useMemo(() => {
    if (!Array.isArray(tabs)) {
      console.warn('Tabs is not an array:', typeof tabs);
      return [];
    }
    
    return tabs.map((tab) => (
      <Tab
        key={tab.id}
        label={renderTabLabel(tab)}
        value={tab.id}
        aria-label={`${tab.label} tab`}
        disableRipple={tab.closeable} // Prevent ripple when close button is clicked
      />
    ));
  }, [tabs, renderTabLabel]);

  return (
    <TabPanelContainer>
      {/* Tab Header */}
      <TabsHeader>
        <StyledTabs
          value={activeTab || 'Dashboard'}
          onChange={handleTabChange}
          variant={tabs.length > (isMobile ? 3 : 6) ? "scrollable" : "standard"}
          scrollButtons="auto"
          allowScrollButtonsMobile
          isMobile={isMobile}
          tabCount={tabs.length}
        >
          {memoizedTabs}
        </StyledTabs>
      </TabsHeader>

      {/* Content Area */}
      <ContentArea>
        <ContentWrapper>
          {ActiveComponent ? (
            <Suspense fallback={
              <LoadingContainer>
                <CircularProgress 
                  size={40}
                  thickness={4}
                  color="primary"
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Loading {tabs.find(tab => tab.id === activeTab)?.label || 'Content'}...
                </Typography>
              </LoadingContainer>
            }>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                <ActiveComponent />
              </Box>
            </Suspense>
          ) : (
            <ErrorContainer>
              <Typography variant="h6" color="error" gutterBottom>
                Component Not Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The requested component could not be loaded.
              </Typography>
            </ErrorContainer>
          )}
        </ContentWrapper>
      </ContentArea>
    </TabPanelContainer>
  );
});

TabPanel.displayName = 'TabPanel';
export default TabPanel;