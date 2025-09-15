<<<<<<< HEAD
import React, { useMemo, useEffect, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useTheme, alpha, Fade, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Enhanced imports
=======
import React, { useState, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
>>>>>>> c6441e2e3dfc49039556dc9f20f39448ef505c7e
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';
<<<<<<< HEAD
import { TabProvider } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import useViewportHeight from '../../hooks/useViewportHeight';
import { defaultScrollbarStyles } from '../../styles/customScrollbars';
import { TAB_ROUTES as CONFIG_TAB_ROUTES } from '../../router/RouteConfig'; // Import from centralized config

// ===== CONSTANTS =====

// Use the centralized TAB_ROUTES configuration
const TAB_ROUTES = CONFIG_TAB_ROUTES;

// ===== STYLED COMPONENTS =====

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  overflow: 'hidden',
  position: 'relative',
  
  // CSS custom properties for dynamic layout
  '--header-height': 'var(--header-height, 64px)',
  '--footer-height': 'var(--footer-height, 48px)',
  '--sidebar-width': 'var(--sidebar-width, 280px)',
  '--content-height': 'var(--content-height, calc(100vh - 112px))',
  
  // Performance optimization
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  
  // Enhanced responsive behavior
  '& *': {
    boxSizing: 'border-box'
  }
}));

const MainContainer = styled(Box, {
  shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary }) => ({
  display: 'flex',
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  
  // Dynamic spacing based on header
  paddingTop: 'var(--header-height)',
  paddingBottom: 'var(--footer-height)',
  
  // Smooth transitions
  transition: theme.transitions.create(['padding'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard
  }),
  
  // Enhanced responsive behavior
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const ContentArea = styled(Box, {
  shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary', 'hasBackground'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary, hasBackground }) => ({
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  
  // Simplified dynamic margins
  [isRTL ? 'marginRight' : 'marginLeft']: isTemporary ? 0 : sidebarWidth,
  
  // Perfect height calculation - between header and footer
  height: 'calc(100vh - var(--header-height) - var(--footer-height))',
  
  // Smooth transitions
  transition: theme.transitions.create(['margin-left', 'margin-right'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard
  }),
  
  // Optional background enhancement
  ...(hasBackground && {
    backgroundColor: alpha(theme.palette.background.default, 0.95),
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  }),
  
  // Enhanced responsive behavior
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    marginRight: 0,
    height: 'auto',
    minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))'
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  overflow: 'hidden' // No scrollbar on wrapper - tabs handle their own scrolling
}));

// ===== COMPONENTS =====

/**
 * Optimized Main Content Component
 * Simplified routing with perfect centering
 */
const DynamicMainContent = memo(() => {
  const location = useLocation();
  const { layoutPreferences } = useLayoutResponsive();

  // Optimized route checking with memoization and early returns
  const isTabRoute = useMemo(() => {
    // Early return if tabs are disabled
    if (!layoutPreferences?.showTabs) return false;
    
    // Use the centralized TAB_ROUTES for consistent behavior
    // Also include profile and settings routes
    const allTabRoutes = [...CONFIG_TAB_ROUTES, '/profile', '/settings'];
    return allTabRoutes.some(route => {
      return location.pathname === route || location.pathname.startsWith(route + '/');
    });
  }, [location.pathname, layoutPreferences?.showTabs]);

  // Show TabPanel for tab routes or when on dashboard
  const shouldShowTabPanel = useMemo(() => {
    return isTabRoute || location.pathname === '/dashboard';
  }, [isTabRoute, location.pathname]);

  // Simplified content container with perfect centering
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {shouldShowTabPanel ? <TabPanel /> : <Outlet />}
    </Box>
  );
});

DynamicMainContent.displayName = 'DynamicMainContent';

/**
 * Optimized Layout Component
 * 
 * Enhanced Features:
 * - Perfect responsive layout with sidebar integration
 * - RTL support with proper positioning
 * - Smooth animations and transitions
 * - Smart height management with CSS variables
 * - Performance optimizations and memoization
 * - Clean, maintainable code structure
 */
const Layout = memo(() => {
  const { currentLanguage, languages } = useLanguage();
  const { isRTL } = useRTL();
  const location = useLocation();
  
  const {
    sidebarState,
    dimensions,
    layoutPreferences,
    cssVariables
  } = useLayoutResponsive();

  const {
    isReady: heightsReady
  } = useViewportHeight({
    includeHeader: true,
    includeFooter: layoutPreferences.showFooter,
    includeTabs: layoutPreferences.showTabs,
    updateCSSVars: true
  });

  // RTL language detection (simplified)
  const effectiveRTL = isRTL || (languages[currentLanguage]?.dir === 'rtl');

  // Background effect determination (optimized)
  const hasBackground = useMemo(() => {
    const authPaths = ['/login', '/auth', '/error'];
    return !authPaths.some(path => location.pathname.includes(path));
  }, [location.pathname]);

  // Determine if we should show tabs based on current route
  const shouldShowTabs = useMemo(() => {
    // Always show tabs for dashboard
    if (location.pathname === '/dashboard') return true;
    
    // Show tabs for all configured tab routes
    return CONFIG_TAB_ROUTES.some(route => {
      return location.pathname === route || location.pathname.startsWith(route + '/');
    });
  }, [location.pathname]);

  // Apply CSS variables for dynamic styling
  useEffect(() => {
    if (heightsReady) {
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [cssVariables, heightsReady]);

  // Memoized content to prevent unnecessary re-renders
  const memoizedContent = useMemo(() => (
    <DynamicMainContent />
  ), [location.pathname, layoutPreferences.showTabs, shouldShowTabs]);

  return (
    <TabProvider>
      <LayoutContainer>
        {/* Header */}
        <Header />
        
        {/* Main Content Area */}
        <MainContainer
          sidebarWidth={dimensions.sidebar.width}
          isRTL={effectiveRTL}
          isTemporary={sidebarState.isTemporary}
        >
          {/* Sidebar */}
          <Sidebar />
          
          {/* Content Area */}
          <ContentArea
            component="main"
            sidebarWidth={dimensions.sidebar.width}
            isRTL={effectiveRTL}
            isTemporary={sidebarState.isTemporary}
            hasBackground={hasBackground}
            role="main"
            aria-label="Main content area"
          >
            <ContentWrapper>
              {memoizedContent}
            </ContentWrapper>
          </ContentArea>
        </MainContainer>
        
        {/* Footer */}
        <Footer />
      </LayoutContainer>
    </TabProvider>
  );
});

Layout.displayName = 'Layout';
=======

import { HEADER_HEIGHT, DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';

const Layout = () => {
    const theme = useTheme();
    const isRTL = theme.direction === 'rtl';
    
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleDrawerToggle = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            bgcolor: 'background.default'
        }}>
            {/* Header at the top */}
            <Header 
                sidebarOpen={sidebarOpen} 
                handleDrawerToggle={handleDrawerToggle} 
            />
            
            {/* Main content area with sidebar and tab panel */}
            <Box sx={{ 
                display: 'flex', 
                flex: 1,
                height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`
            }}>
                {/* Sidebar on the left (or right for RTL) */}
                <Sidebar 
                    open={sidebarOpen} 
                    isRTL={isRTL}
                />
                
                {/* Tab Panel in the center */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        ...(isRTL ? {
                            marginRight: {
                                sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                            }
                        } : {
                            marginLeft: {
                                sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                            }
                        }),
                        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `radial-gradient(circle at 10% 20%, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0) 20%), 
                                         radial-gradient(circle at 90% 80%, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0) 20%)`,
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <TabPanel />
                </Box>
            </Box>
            
            {/* Footer at the bottom */}
            <Footer />
        </Box>
    );
};
>>>>>>> c6441e2e3dfc49039556dc9f20f39448ef505c7e

export default Layout;