/**
 * Modern Navigation System for TECHNO-ETL
 * Clean, contextual navigation without traditional breadcrumbs
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Chip,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
  Paper,
  Fade,
  Popper,
  ClickAwayListener,
  MenuList
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Bookmark as BookmarkIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, getRouteMetadata } from '../../config/routes';

/**
 * Quick Access Search Component
 */
const QuickAccessSearch: React.FC<any> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock search data - in real app, this would come from API
  const searchableItems = useMemo(() => [
    { id: 1, title: 'Dashboard', path: '/dashboard', type: 'page', icon: DashboardIcon },
    { id: 2, title: 'Customer Management', path: '/customers', type: 'page', icon: AccountIcon },
    { id: 3, title: 'Product Catalog', path: '/products', type: 'page', icon: SettingsIcon },
    { id: 4, title: 'Order Processing', path: '/orders', type: 'page', icon: SettingsIcon },
    { id: 5, title: 'Inventory Levels', path: '/inventory', type: 'page', icon: SettingsIcon },
    { id: 6, title: 'Sales Reports', path: '/reports', type: 'page', icon: SettingsIcon },
    { id: 7, title: 'System Settings', path: '/settings', type: 'page', icon: SettingsIcon }
  ], []);

  useEffect(() => {
    if(searchQuery.length > 1) {
      const filtered = searchableItems.filter((item: any) =>
        item?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
  }, [searchQuery, searchableItems]);

  const handleItemClick = (item) => {
    navigate(item.path);
    onClose();
  };

  return (
    <Paper sx={{ display: "flex", p: 2, minWidth: 300, maxWidth: 400 } as any}></
      <TextField fullWidth
        placeholder={t('Search pages, features...')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps
        }}
        autoFocus
      />
      
      {searchResults.length > 0 && (
        <Box sx={{ display: "flex", mt: 2 } as any}></
          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", px: 1 } as any}>
            Quick Access
          </Typography>
          <MenuList dense>
            {searchResults.map((item: any) => {
              const IconComponent = item?.icon;
              return (
                <MenuItem key={item?.id}
                  onClick={() => handleItemClick(item)}
                  sx={{ display: "flex", borderRadius: 1, my: 0.5 } as any}
                >
                  <ListItemIcon></
                    <IconComponent fontSize="small" /></IconComponent>
                  <ListItemText primary={item?.title} /></
                  <Chip label={item?.type} size="small" variant="outlined" /></Chip>
              );
            })}
          </MenuList>
        </Box>
      )}
      
      {searchQuery.length > 1 && searchResults.length ===0 && (
        <Box sx={{ display: "flex", mt: 2, textAlign: 'center', py: 2 } as any}></
          <Typography variant="outlined" color="text.secondary">
            No results found for "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

/**
 * Contextual Page Header Component
 */
const ContextualPageHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Use getRouteMetadata function instead of direct access to avoid undefined errors
  const currentRoute = getRouteMetadata(location.pathname);

  const canGoBack = window.history.length > 1;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 } as any}>
      {canGoBack && (
        <Tooltip title="Go Back"></
          <IconButton onClick={() => navigate(-1)} size="small">
            <BackIcon /></BackIcon>
        </Tooltip>
      )}
      
      <Box></
        <Typography variant="h6" component="h1" sx={{ display: "flex", fontWeight: 600 } as any}>
          {t(currentRoute?.title)}
        </Typography>
        {currentRoute.description && (
          <Typography variant="caption" color="text.secondary">
            {t(currentRoute.description)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Quick Actions Menu Component
 */
const QuickActionsMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const quickActions = [
    { label: 'New Product', path: '/products/new', icon: SettingsIcon },
    { label: 'New Order', path: '/orders/new', icon: SettingsIcon },
    { label: 'New Customer', path: '/customers/new', icon: AccountIcon },
    { label: 'Generate Report', path: '/reports/new', icon: SettingsIcon }
  ];

  return(<>
      <Tooltip title="Quick Actions"></
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {quickActions.map((action, index) => {
          const IconComponent = action?.icon;
          return (
            <MenuItem key={index}
              onClick={() => {
                action?.onClick();
                setQuickActionsMenu(null);
              }}
            >
              <ListItemIcon></
                <IconComponent fontSize="small" /></IconComponent>
              <ListItemText>{t(action.label)}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

/**
 * User Profile Menu Component
 */
const UserProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch(error: any) {
      console.error('Logout error:', error);
    setAnchorEl(null);
  };

  return(<>
      <Tooltip title="Account"></
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          <Avatar sx={{ display: "flex", width: 32, height: 32 } as any}>
            {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
          </Avatar>
        </IconButton>
      </Tooltip>
      
      <Menu anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ display: "flex", px: 2, py: 1, borderBottom: 1, borderColor: 'divider' } as any}></
          <Typography variant="subtitle2">
            {currentUser?.displayName || currentUser?.email || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></SettingsIcon>
          <ListItemText>{t('Settings')}</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { navigate('/help'); setAnchorEl(null); }}>
          <ListItemIcon><HelpIcon fontSize="small" /></HelpIcon>
          <ListItemText>{t('Help & Support')}</ListItemText>
        </MenuItem>
        
        <Divider /></
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></LogoutIcon>
          <ListItemText>{t('Logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * Main Modern Navigation Component
 */
const ModernNavigation: React.FC<any> = ({ onMenuToggle, isMenuOpen = false }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const { t } = useTranslation();

  const handleSearchClick = (event) => {
    setSearchAnchorEl(event.currentTarget);
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchAnchorEl(null);
  };

  return(<>
      <AppBar position
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          borderBottom: 1,
          borderColor: 'divider'
        } as any}></
        <Toolbar sx={{ display: "flex", justifyContent: 'space-between' } as any}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 } as any}></
            <IconButton edge
              onClick={onMenuToggle}
              sx={{ display: "flex", mr: 1 } as any}>
              <MenuIcon /></MenuIcon>
            
            <ContextualPageHeader /></ContextualPageHeader>

          {/* Center Section - Search */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}></
            <Tooltip title="Search">
              <IconButton onClick={handleSearchClick}></
                <SearchIcon /></SearchIcon>
            </Tooltip>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}></
            <QuickActionsMenu />
            
            <Tooltip title="Notifications"></
              <IconButton size="small">
                <Badge badgeContent={3} color="error"></
                  <NotificationsIcon /></NotificationsIcon>
              </IconButton>
            </Tooltip>
            
            <UserProfileMenu /></UserProfileMenu>
        </Toolbar>
      </AppBar>

      {/* Search Popper */}
      <Popper open={searchOpen}
        anchorEl={searchAnchorEl}
        placement
        sx={{ display: "flex", zIndex: (theme) => theme.zIndex.modal } as any}
      >
        {({ TransitionProps }) => (
          <Fade { ...TransitionProps} timeout={200}></
            <Box>
              <ClickAwayListener onClickAway={handleSearchClose}></
                <Box>
                  <QuickAccessSearch onClose={handleSearchClose} /></QuickAccessSearch>
              </ClickAwayListener>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default ModernNavigation;
