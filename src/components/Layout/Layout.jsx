import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';
import { TabProvider } from '../../contexts/TabContext';
import { HEADER_HEIGHT, DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

// Dynamically render TabPanel or Outlet based on route
const tabRoutes = [
  '/dashboard', '/charts', '/products', '/voting', '/inventory', '/orders', '/customers', 
  '/products-catalog', '/reports', '/settings', '/bug-bounty', '/profile', '/products/', 
  '/products/category/', '/mdmproducts', '/cegid-products', '/categories', '/stocks', 
  '/sources', '/cms-pages', '/grid-test', '/license-management', '/license', '/analytics/',
  '/locker/'
];

function DynamicMainContent() {
  const location = useLocation();
  
  // More robust check for tab routes
  const isTabRoute = useMemo(() => {
    return tabRoutes.some(route => {
      // Handle exact matches
      if (route === location.pathname) return true;
      
      // Handle prefix matches for routes with trailing slashes or parameters
      if (route.endsWith('/')) {
        return location.pathname.startsWith(route);
      }
      
      // Handle routes with parameters (ending with :)
      if (route.endsWith(':')) {
        const prefix = route.slice(0, -1);
        return location.pathname.startsWith(prefix);
      }
      
      return false;
    });
  }, [location.pathname]);

  if (isTabRoute) {
    return <TabPanel />;
  }
  
  return <Outlet />;
}

const LayoutContent = () => {
  const theme = useTheme();
  const isRTL = theme.direction === 'rtl';
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <TabProvider sidebarOpen={sidebarOpen}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header 
          sidebarOpen={sidebarOpen} 
          handleDrawerToggle={handleDrawerToggle} 
        />
        
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Sidebar 
            open={sidebarOpen} 
            toggleDrawer={handleDrawerToggle} 
            isRTL={isRTL}
          />
          
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
              height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
              transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: sidebarOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
              }),
              ...(isRTL ? {
                marginRight: {
                  xs: 0,
                  sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                }
              } : {
                marginLeft: {
                  xs: 0,
                  sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                }
              }),
              padding: {
                xs: theme.spacing(0.5),
                sm: theme.spacing(1),
                md: theme.spacing(1.5)
              },
              background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)',
                pointerEvents: 'none'
              },
              [theme.breakpoints.down('sm')]: {
                minHeight: `calc(100vh - 56px - ${FOOTER_HEIGHT}px)`,
              },
              [theme.breakpoints.up('sm')]: {
                minHeight: `calc(100vh - 64px - ${FOOTER_HEIGHT}px)`,
              }
            }}
          >
            <DynamicMainContent />
          </Box>
        </Box>
        <Footer sidebarOpen={sidebarOpen} />
      </Box>
    </TabProvider>
  );
};

const Layout = () => {
  return <LayoutContent />;
};

export default Layout;