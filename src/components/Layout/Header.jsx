import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { StyledAppBar } from './styles';

/**
 * Header Component
 * 
 * Features:
 * - Drawer toggle button
 * - App title
 * - Profile menu
 * - Responsive design
 * - Smooth transitions
 */
const Header = ({ 
    isDrawerCollapsed,
    handleDrawerToggle,
    handleProfileMenuOpen,
    handleProfileMenuClose,
    anchorEl
}) => {
    return (
        <StyledAppBar 
            position="sticky" 
            open={!isDrawerCollapsed}
            collapsed={isDrawerCollapsed}
        >
            <Toolbar>
                {/* Drawer Toggle Button */}
                <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ 
                        mr: 2,
                        transition: theme => theme.transitions.create('transform', {
                            duration: theme.transitions.duration.shorter
                        }),
                        transform: isDrawerCollapsed ? 'rotate(0deg)' : 'rotate(180deg)'
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* App Title */}
                <Typography 
                    variant="h6" 
                    noWrap 
                    component="div" 
                    sx={{ flexGrow: 1 }}
                >
                    Techno Stationery
                </Typography>

                {/* Profile Menu */}
                <IconButton
                    onClick={handleProfileMenuOpen}
                    size="large"
                    edge="end"
                    aria-label="account"
                    aria-controls={Boolean(anchorEl) ? 'profile-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                    color="inherit"
                >
                    <Avatar>A</Avatar>
                </IconButton>

                <Menu
                    id="profile-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    onClick={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
                    <MenuItem onClick={handleProfileMenuClose}>My account</MenuItem>
                    <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;