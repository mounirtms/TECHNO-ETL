import React, { useMemo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useTheme, alpha, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TabPanel from './TabPanel';
import { TabProvider } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import useViewportHeight from '../../hooks/useViewportHeight';
import { defaultScrollbarStyles } from '../../styles/customScrollbars';

// ===== CONSTANTS =====

// Define tab routes - these are the routes that should show tabs
const TAB_ROUTES = [
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
  '/mdm-stock',
  '/voting',
  '/tasks',
  '/settings'
];

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
  backfaceVisibility: 'hidden'
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
  })
}));

const ContentArea = styled(Box, {
  shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary', 'hasBackground'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary, hasBackground }) => ({
  flexGrow: 1,
  position: 'relative',
  overflow: 'hidden',
  
  // Dynamic margins based on sidebar
  [isRTL ? 'marginRight' : 'marginLeft']: isTemporary ? 0 : sidebarWidth,
  
  // Height management - no padding for TabPanel to be right under header
  height: 'var(--content-height)',
  minHeight: 'var(--content-height)',
  
  // No padding to allow TabPanel to touch header
  padding: 0,
  
  // Smooth transitions
  transition: theme.transitions.create(['margin-left', 'margin-right'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard
  }),
  
  // Background with glassmorphism effect
  ...(hasBackground && {
    background: theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.grey[900], 0.8)} 100%)`,
    
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.palette.mode === 'light'
        ? 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.06) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.08) 0%, transparent 50%)',
      pointerEvents: 'none',
      zIndex: -1
    }
  }),
  
  // Custom scrollbar
  ...defaultScrollbarStyles(theme, isRTL)
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  height: '100%',
  overflow: 'auto',
  
  // Custom scrollbar
  ...defaultScrollbarStyles(theme)
}));

// ===== COMPONENTS =====

/**
 * Dynamic Main Content Component
 * Handles routing between TabPanel and direct Outlet rendering
 */
const DynamicMainContent = () => {
  const location = useLocation();
  const { layoutPreferences } = useLayoutResponsive();

  // Check if current route should show tabs
  const isTabRoute = useMemo(() => {
    if (!layoutPreferences.showTabs) return false;
    
    return TAB_ROUTES.some(route => {
      // Exact match
      if (route === location.pathname) return true;
      
      // Handle nested routes (e.g., /products/123 should still show tabs)
      return location.pathname.startsWith(route + '/');
    });
  }, [location.pathname, layoutPreferences.showTabs]);

  // For tab routes, show TabPanel; for others, show Outlet
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden'
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {isTabRoute ? <TabPanel /> : <Outlet />}
      </Box>
    </Box>
  );
};

/**
 * Enhanced Layout Component
 * 
 * Features:
 * - Responsive layout with sidebar integration
 * - RTL support with proper positioning
 * - Smooth animations and transitions
 * - Intelligent height management
 * - Performance optimizations
 * - Custom scrollbars
 */
const Layout = () => {
  const theme = useTheme();
  const { currentLanguage, languages } = useLanguage();
  const { isRTL } = useRTL();
  const location = useLocation();
  
  const {
    sidebarState,
    dimensions,
    layoutConfig,
    layoutPreferences,
    cssVariables
  } = useLayoutResponsive();

  const {
    heights,
    isReady: heightsReady
  } = useViewportHeight({
    includeHeader: true,
    includeFooter: layoutPreferences.showFooter,
    includeTabs: layoutPreferences.showTabs,
    updateCSSVars: true
  });

  // Check if current language is RTL (fallback)
  const isRTLFallback = languages[currentLanguage]?.dir === 'rtl';
  const effectiveRTL = isRTL || isRTLFallback;

  // Determine if we should show background effects
  const hasBackground = useMemo(() => {
    // Show background for main app routes, not for login/auth pages
    return !location.pathname.includes('/login') && 
           !location.pathname.includes('/auth') &&
           !location.pathname.includes('/error');
  }, [location.pathname]);

  // Apply CSS variables to root element
  useEffect(() => {
    if (heightsReady) {
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [cssVariables, heightsReady]);

  // Performance optimization: prevent unnecessary re-renders
  const memoizedContent = useMemo(() => (
    <DynamicMainContent />
  ), [location.pathname, layoutPreferences.showTabs]);

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
};

Layout.displayName = 'Layout';

export default Layout;