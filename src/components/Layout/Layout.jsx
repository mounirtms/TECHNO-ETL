import React, { useMemo, useEffect, memo } from 'react';
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
  
  // Simplified dynamic margins
  [isRTL ? 'marginRight' : 'marginLeft']: isTemporary ? 0 : sidebarWidth,
  
  // Perfect height calculation using CSS variables
  height: 'var(--content-height)',
  minHeight: 'var(--content-height)',
  
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
 * Optimized Main Content Component
 * Simplified routing with perfect centering
 */
const DynamicMainContent = memo(() => {
  const location = useLocation();
  const { layoutPreferences } = useLayoutResponsive();

  // Optimized route checking with memoization
  const isTabRoute = useMemo(() => {
    if (!layoutPreferences.showTabs) return false;
    
    return TAB_ROUTES.some(route => {
      return route === location.pathname || location.pathname.startsWith(route + '/');
    });
  }, [location.pathname, layoutPreferences.showTabs]);

  // Simplified content container with perfect centering
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {isTabRoute ? <TabPanel /> : <Outlet />}
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
});

Layout.displayName = 'Layout';

export default Layout;