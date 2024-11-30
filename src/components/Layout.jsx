import * as React from 'react';
import { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ShoppingCart,
  People,
  Settings,
  DarkMode,
  Translate,
  Receipt,
  LocalShipping,
  ChevronLeft,
} from '@mui/icons-material';
import ProductsGrid from './grids/ProductsGrid';
import CustomersGrid from './grids/CustomersGrid';
import OrdersGrid from './grids/OrdersGrid';
import InvoicesGrid from './grids/InvoicesGrid';
import DashboardComponent from './Dashboard';

const drawerWidth = 240;
const collapsedDrawerWidth = 65;

export default function Layout({ toggleDarkMode, toggleDirection, isDarkMode, isRtl }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setIsDrawerCollapsed(!isDrawerCollapsed);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const currentDrawerWidth = isDrawerCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        minHeight: '64px !important'
      }}>
        {!isDrawerCollapsed && (
          <Typography variant="h6" noWrap component="div">
            Techno Stationery
          </Typography>
        )}
        <IconButton onClick={handleDrawerCollapse}>
          <ChevronLeft sx={{ 
            transform: isDrawerCollapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s'
          }} />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <ListItem 
          button 
          selected={selectedTab === 0} 
          onClick={() => setSelectedTab(0)}
          sx={{ 
            justifyContent: isDrawerCollapsed ? 'center' : 'flex-start',
            px: isDrawerCollapsed ? 1 : 2
          }}
        >
          <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 0 : 40 }}>
            <Dashboard />
          </ListItemIcon>
          {!isDrawerCollapsed && <ListItemText primary="Dashboard" />}
        </ListItem>
        <ListItem 
          button 
          selected={selectedTab === 1} 
          onClick={() => setSelectedTab(1)}
          sx={{ 
            justifyContent: isDrawerCollapsed ? 'center' : 'flex-start',
            px: isDrawerCollapsed ? 1 : 2
          }}
        >
          <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 0 : 40 }}>
            <ShoppingCart />
          </ListItemIcon>
          {!isDrawerCollapsed && <ListItemText primary="Products" />}
        </ListItem>
        <ListItem 
          button 
          selected={selectedTab === 2} 
          onClick={() => setSelectedTab(2)}
          sx={{ 
            justifyContent: isDrawerCollapsed ? 'center' : 'flex-start',
            px: isDrawerCollapsed ? 1 : 2
          }}
        >
          <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 0 : 40 }}>
            <People />
          </ListItemIcon>
          {!isDrawerCollapsed && <ListItemText primary="Customers" />}
        </ListItem>
        <ListItem 
          button 
          selected={selectedTab === 3} 
          onClick={() => setSelectedTab(3)}
          sx={{ 
            justifyContent: isDrawerCollapsed ? 'center' : 'flex-start',
            px: isDrawerCollapsed ? 1 : 2
          }}
        >
          <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 0 : 40 }}>
            <Receipt />
          </ListItemIcon>
          {!isDrawerCollapsed && <ListItemText primary="Orders" />}
        </ListItem>
        <ListItem 
          button 
          selected={selectedTab === 4} 
          onClick={() => setSelectedTab(4)}
          sx={{ 
            justifyContent: isDrawerCollapsed ? 'center' : 'flex-start',
            px: isDrawerCollapsed ? 1 : 2
          }}
        >
          <ListItemIcon sx={{ minWidth: isDrawerCollapsed ? 0 : 40 }}>
            <LocalShipping />
          </ListItemIcon>
          {!isDrawerCollapsed && <ListItemText primary="Invoices" />}
        </ListItem>
      </List>
      {!isDrawerCollapsed && (
        <>
          <Divider />
          <List>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch checked={isDarkMode} onChange={toggleDarkMode} />
                }
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DarkMode sx={{ mr: 1 }} /> Dark Mode
                </Box>}
              />
            </ListItem>
            <ListItem>
              <FormControlLabel
                control={
                  <Switch checked={isRtl} onChange={toggleDirection} />
                }
                label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Translate sx={{ mr: 1 }} /> RTL Mode
                </Box>}
              />
            </ListItem>
          </List>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 0:
        return <DashboardComponent />;
      case 1:
        return <Box sx={{ height: '85vh', p: 2 }}><ProductsGrid /></Box>;
      case 2:
        return <Box sx={{ height: '85vh', p: 2 }}><CustomersGrid /></Box>;
      case 3:
        return <Box sx={{ height: '85vh', p: 2 }}><OrdersGrid /></Box>;
      case 4:
        return <Box sx={{ height: '85vh', p: 2 }}><InvoicesGrid /></Box>;
      default:
        return <DashboardComponent />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          transition: 'width 0.3s, margin-left 0.3s'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={handleProfileMenuOpen}
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar>A</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>My account</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: currentDrawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.3s'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              transition: 'width 0.3s'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              transition: 'width 0.3s'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          transition: 'width 0.3s, margin-left 0.3s',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}
