import { memo, useCallback, useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { ComponentOptimizer, LayoutOptimizer } from '../../utils/componentOptimizer';
import BaseComponent from '../base/BaseComponent';

const ModernLayout = memo(({
  header,
  sidebar,
  children,
  toolbarContent,
  sidebarWidth = LayoutOptimizer.sidebarWidth,
  headerHeight = LayoutOptimizer.headerHeight,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Handle responsive behavior
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Toggle sidebar
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Calculate content dimensions
  const contentStyle = {
    marginLeft: sidebarOpen && !isMobile ? sidebarWidth : 0,
    minHeight: `calc(100vh - ${headerHeight}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          height: headerHeight,
        }}
      >
        <Toolbar sx={{ height: '100%' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {header}
          <Box sx={{ flexGrow: 1 }} />
          {toolbarContent}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            marginTop: `${headerHeight}px`,
            height: `calc(100% - ${headerHeight}px)`,
          },
        }}
      >
        <BaseComponent elevation={0}>
          {sidebar}
        </BaseComponent>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: theme.spacing(3),
          marginTop: `${headerHeight}px`,
          ...contentStyle,
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

// Add display name for debugging
ModernLayout.displayName = 'ModernLayout';

// Export optimized component
export default ComponentOptimizer.optimizeComponent(ModernLayout);