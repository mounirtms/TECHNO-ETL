import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';
import { TabProvider, useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

// Define tab routes - these are the routes that should show tabs
const tabRoutes = [
  '/dashboard',
  '/charts',
  '/products',
  '/orders',
  '/customers',
  '/inventory',
  '/mdmproducts',
  '/cegid-products',
  '/categories',
  '/stocks',
  '/sources',
  '/invoices',
  '/cms-pages',
  '/grid-test',
  '/bug-bounty',
  '/license-management',
  '/profile',
  '/mdm-stock'
];

// Component to handle dynamic content based on route
const DynamicMainContent = () => {
  const location = useLocation();
  const { tabs } = useTab();

  // Check if current route should show tabs
  const isTabRoute = useMemo(() => {
    // If we have no tabs yet, default to showing TabPanel for tab routes
    if (!tabs || tabs.length === 0) {
      return tabRoutes.some(route => location.pathname === route);
    }
    
    // Check if current route matches any tab route
    return tabRoutes.some(route => {
      // Exact match
      if (route === location.pathname) return true;
      
      // Handle nested routes (e.g., /products/123 should still show tabs)
      return location.pathname.startsWith(route + '/');
    });
  }, [location.pathname, tabs]);

  // For tab routes, show TabPanel; for others, show Outlet
  if (isTabRoute) {
    return <TabPanel />;
  }

  return <Outlet />;
};

const Layout = () => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        overflow: 'hidden' 
      }}
    >
      <Header
        sidebarOpen={sidebarOpen}
        onMenuToggle={handleDrawerToggle}
        onSidebarToggle={handleSidebarToggle}
        sx={{
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          })
        }}
      />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flex: 1,
          mt: `${HEADER_HEIGHT}px`,
          mb: `${FOOTER_HEIGHT}px`,
          position: 'relative'
        }}
      >
        <Sidebar
          open={sidebarOpen}
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerToggle}
          sx={{
            position: 'fixed',
            height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
            [theme.direction === 'rtl' ? 'right' : 'left']: 0,
            transition: theme.transitions.create(['width', 'transform'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            })
          }}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
            width: {
              xs: '100%',
              sm: `calc(100% - ${COLLAPSED_WIDTH}px)`,
              md: sidebarOpen 
                ? `calc(100% - ${DRAWER_WIDTH}px)` 
                : `calc(100% - ${COLLAPSED_WIDTH}px)`,
            },
            [theme.direction === 'rtl' ? 'marginRight' : 'marginLeft']: {
              xs: 0,
              sm: COLLAPSED_WIDTH,
              md: sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            },
            transition: theme.transitions.create(
              ['width', 'margin'], 
              {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }
            ),
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <DynamicMainContent />
          </Box>
        </Box>
      </Box>
      
      <Footer 
        sx={{
          position: 'fixed',
          bottom: 0,
          width: {
            xs: '100%',
            sm: `calc(100% - ${COLLAPSED_WIDTH}px)`,
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${COLLAPSED_WIDTH}px)`,
          },
          [theme.direction === 'rtl' ? 'right' : 'left']: {
            xs: 0,
            sm: COLLAPSED_WIDTH,
            md: sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      />
    </Box>
  );
};

// Wrap Layout with TabProvider in a separate component to avoid context conflicts
const LayoutWithProviders = () => {
  return (
    <TabProvider>
      <Layout />
    </TabProvider>
  );
};

export default LayoutWithProviders;