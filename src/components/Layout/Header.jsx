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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { StyledAppBar } from './styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';
import { useAuth } from '../../contexts/AuthContext';
import { useTab } from '../../contexts/TabContext';
import UserMenu from './UserMenu'; 

export const Header = ({
    isDrawerCollapsed,
    handleDrawerToggle,
    handleProfileMenuOpen,
    handleProfileMenuClose,
    anchorEl
}) => {
    const { currentUser } = useAuth();
    const { openTab } = useTab();

    const handleOpenProfile = () => {
        if (currentUser) {
            const profileTabId = 'UserProfile';
            openTab(profileTabId);
        }
        handleProfileMenuClose();
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleProfileMenuClose();
            // Optionally redirect to login page
        } catch (error) {
            console.error('Logout failed', error);
            // Optionally show an error notification
        }
    };

    return (
        <StyledAppBar
            position="fixed"
            open={!isDrawerCollapsed}
            sx={{
                width: {
                    xs: '100%',
                    sm: `calc(100% - ${isDrawerCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`
                },
                marginLeft: {
                    sm: isDrawerCollapsed ? `${COLLAPSED_WIDTH}px` : `${DRAWER_WIDTH}px`
                },
                transition: theme => theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}
        >
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleDrawerToggle} // Ensure this is correct
                    sx={{ mr: 2, ...(!isDrawerCollapsed && { display: 'none' }) }} // Hide when open
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Techno Stationery
                </Typography>

                <UserMenu
                    onProfileClick={handleOpenProfile}
                    onSettingsClick={() => openTab('Settings')}
                    onLogout={handleLogout}
                />
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;