/**
 * Enhanced Sidebar Component
 * Integrates with React Router and provides optimized navigation
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  Box,
  Typography,
  Divider,
  Collapse,
  Badge,
  useTheme,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  HowToVote as HowToVoteIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Warehouse as WarehouseIcon,
} from '@mui/icons-material';

import { useNavigation, useMenuState } from '../../hooks/useNavigation';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from '../Layout/Constants';
import technoIcon from '../../assets/images/techno.png';

// Icon mapping
const ICON_MAP = {
  Dashboard: DashboardIcon,
  Inventory: InventoryIcon,
  ShoppingCart: ShoppingCartIcon,
  People: PeopleIcon,
  BarChart: BarChartIcon,
  Assessment: AssessmentIcon,
  HowToVote: HowToVoteIcon,
  Settings: SettingsIcon,
  Warehouse: WarehouseIcon,
};

// Styled components
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    color: theme.palette.primary.contrastText,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active, open }) => ({
  minHeight: 48,
  justifyContent: open ? 'initial' : 'center',
  px: 2.5,
  margin: '4px 8px',
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
  ...(active && {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 4,
      height: '60%',
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '0 2px 2px 0',
    },
  }),
}));

const LogoContainer = styled(Box)(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: open ? 'flex-start' : 'center',
  padding: theme.spacing(2),
  minHeight: 64,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const EnhancedSidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const { getMenuItems, navigateTo, isRouteActive } = useNavigation();
  const { activeSubmenu, setActiveSubmenu } = useMenuState();

  const menuItems = getMenuItems();

  const handleNavigation = (item) => {
    if (item.path) {
      navigateTo(item.path);
    }

    // Close submenu if navigating to a different section
    if (activeSubmenu && activeSubmenu !== item.path) {
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuToggle = (itemPath) => {
    setActiveSubmenu(activeSubmenu === itemPath ? null : itemPath);
  };

  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || DashboardIcon;

    return <IconComponent />;
  };

  const renderMenuItem = (item) => {
    const isActive = isRouteActive(item.path);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = activeSubmenu === item.path;

    return (
      <React.Fragment key={item.path}>
        <Tooltip
          title={!open ? item.label : ''}
          placement="right"
          arrow
        >
          <StyledListItemButton
            active={isActive}
            open={open}
            onClick={() => hasSubmenu ? handleSubmenuToggle(item.path) : handleNavigation(item)}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: 'inherit',
              }}
            >
              <Badge
                badgeContent={item.badge}
                color="secondary"
                variant="dot"
                invisible={!item.badge}
              >
                {getIcon(item.icon)}
              </Badge>
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              sx={{
                opacity: open ? 1 : 0,
                transition: theme.transitions.create('opacity'),
              }}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
              }}
            />

            {hasSubmenu && open && (
              isSubmenuOpen ? <ExpandLess /> : <ExpandMore />
            )}
          </StyledListItemButton>
        </Tooltip>

        {/* Submenu */}
        {hasSubmenu && (
          <Collapse in={isSubmenuOpen && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => (
                <Tooltip
                  key={subItem.path}
                  title={!open ? subItem.label : ''}
                  placement="right"
                  arrow
                >
                  <StyledListItemButton
                    active={isRouteActive(subItem.path)}
                    open={open}
                    onClick={() => handleNavigation(subItem)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit',
                      }}
                    >
                      {getIcon(subItem.icon)}
                    </ListItemIcon>
                    <ListItemText
                      primary={subItem.label}
                      sx={{ opacity: open ? 1 : 0 }}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: isRouteActive(subItem.path) ? 600 : 400,
                      }}
                    />
                  </StyledListItemButton>
                </Tooltip>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
    >
      {/* Logo Section */}
      <LogoContainer open={open}>
        <img
          src={technoIcon}
          alt="Techno Logo"
          style={{
            width: open ? 40 : 32,
            height: open ? 40 : 32,
            transition: theme.transitions.create(['width', 'height']),
          }}
        />
        {open && (
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              TECHNO
            </Typography>
            <Typography variant="caption" noWrap sx={{ opacity: 0.8 }}>
              ETL System
            </Typography>
          </Box>
        )}
      </LogoContainer>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer Section */}
      {open && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            Version 2.0.0
          </Typography>
        </Box>
      )}
    </StyledDrawer>
  );
};

export default EnhancedSidebar;
