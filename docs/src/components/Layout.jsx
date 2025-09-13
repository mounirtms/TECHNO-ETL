import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Collapse,
  Typography,
  Divider,
  AppBar,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import StorageIcon from '@mui/icons-material/Storage';
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import SyncIcon from '@mui/icons-material/Sync';
import GridOnIcon from '@mui/icons-material/GridOn';
import ApiIcon from '@mui/icons-material/Api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BuildIcon from '@mui/icons-material/Build';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SecurityIcon from '@mui/icons-material/Security';
import SearchComponent from './SearchComponent';
import GlobalSearchModal from './GlobalSearchModal';

const drawerWidth = 280;

const menuItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'Search', path: '/search', icon: <SearchIcon /> },
  {
    text: 'Integrations',
    icon: <IntegrationInstructionsIcon />,
    children: [
      { text: 'Magento Integration', path: '/magento-integration', icon: <IntegrationInstructionsIcon /> },
      { text: 'ETL Integration', path: '/etl-integration', icon: <StorageIcon /> },
      { text: 'JDE Integration', path: '/jde-integration', icon: <InventoryIcon /> },
      { text: 'CEGID Integration', path: '/cegid-integration', icon: <IntegrationInstructionsIcon /> },
    ],
  },
  {
    text: 'Documentation',
    icon: <DescriptionIcon />,
    children: [
      { text: 'System Overview', path: '/docs/system-overview', icon: <DescriptionIcon /> },
      { text: 'Getting Started', path: '/docs/getting-started', icon: <SettingsIcon /> },
      { text: 'Features Showcase', path: '/docs/features-showcase', icon: <DashboardIcon /> },
      { text: 'Project Overview', path: '/docs/project-overview', icon: <DescriptionIcon /> },
      { text: 'Technical Architecture', path: '/docs/technical-architecture', icon: <ArchitectureIcon /> },
      { text: 'ETL Process', path: '/docs/etl-process', icon: <SyncIcon /> },
      { text: 'Grid System', path: '/docs/grid-system', icon: <GridOnIcon /> },
      { text: 'API Documentation', path: '/docs/api-documentation', icon: <ApiIcon /> },
      { text: 'Dashboard System', path: '/docs/dashboard-system', icon: <DashboardIcon /> },
      { text: 'Product Management', path: '/docs/product-management', icon: <ShoppingCartIcon /> },
      { text: 'Configuration & Setup', path: '/docs/configuration-setup', icon: <SettingsIcon /> },
      { text: 'Search Help', path: '/docs/search-help', icon: <SearchIcon /> },
    ],
  },
  {
    text: 'Deployment',
    icon: <CloudUploadIcon />,
    children: [
      { text: 'Standard Deployment', path: '/docs/deployment-guide', icon: <CloudUploadIcon /> },
      { text: 'Optimized Deployment', path: '/docs/optimized-deployment', icon: <RocketLaunchIcon /> },
      { text: 'Backend Production', path: '/docs/backend-production', icon: <BuildIcon /> },
      { text: 'Troubleshooting', path: '/docs/troubleshooting', icon: <BugReportIcon /> },
    ],
  },
  {
    text: 'Project Management',
    icon: <SettingsIcon />,
    children: [
      { text: 'Complete Project Summary', path: '/docs/complete-project-summary', icon: <DescriptionIcon /> },
      { text: 'Project Cleanup', path: '/docs/project-cleanup', icon: <CleaningServicesIcon /> },
      { text: 'User Settings Guide', path: '/docs/user-settings-guide', icon: <SettingsIcon /> },
      { text: 'License Information', path: '/docs/license', icon: <SecurityIcon /> },
    ],
  },
];

const Layout = ({ children }) => {
  const [openSections, setOpenSections] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionToggle = (sectionText) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionText]: !prev[sectionText],
    }));
  };

  const renderMenuItem = (item, level = 0) => {
    if (item.children) {
      return (
        <React.Fragment key={item.text}>
          <ListItem
            button
            onClick={() => handleSectionToggle(item.text)}
            sx={{
              pl: 2 + level * 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: 500,
                color: 'primary.main',
              }}
            />
            {openSections[item.text] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openSections[item.text]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem
        button
        key={item.text}
        component={RouterLink}
        to={item.path}
        sx={{
          pl: 2 + level * 2,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '&.active': {
            backgroundColor: 'primary.light',
            '& .MuiListItemText-primary': {
              color: 'primary.main',
              fontWeight: 600,
            },
          },
        }}
      >
        <ListItemIcon sx={{ color: level > 0 ? 'text.secondary' : 'inherit' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: level > 0 ? '0.875rem' : '1rem',
          }}
        />
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TECHNO-ETL Documentation
          </Typography>

          {/* Search Component */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2, minWidth: 300 }}>
            <SearchComponent variant="outlined" size="small" fullWidth />
          </Box>

          {/* Search Icon for Mobile */}
          <Tooltip title="Search (Ctrl+K)">
            <IconButton
              color="inherit"
              onClick={() => setSearchModalOpen(true)}
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* Search Icon for Desktop */}
          <Tooltip title="Advanced Search (Ctrl+K)">
            <IconButton
              color="inherit"
              onClick={() => setSearchModalOpen(true)}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#fafafa',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            TECHNO-ETL
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ overflow: 'auto', py: 1 }}>
          <List>
            {menuItems.map((item) => renderMenuItem(item))}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          marginTop: '64px', // Height of the AppBar
        }}
      >
        {children}
      </Box>

      {/* Global Search Modal */}
      <GlobalSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </Box>
  );
};

export default Layout;
