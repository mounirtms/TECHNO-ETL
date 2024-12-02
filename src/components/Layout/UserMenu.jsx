import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTab } from '../../contexts/TabContext'; // Add this import


const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        minWidth: 200,
        boxShadow: theme.shadows[3],
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            padding: theme.spacing(1, 2),
            '& .MuiSvgIcon-root': {
                fontSize: 20,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: theme.palette.primary.light,
            },
        },
    },
}));

const UserMenu = ({ onProfileClick, onSettingsClick, onLogout }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser, logout } = useAuth();
    const { translate } = useLanguage();
    const { openTab } = useTab(); // Add this line

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleClose();
        openTab('UserProfile'); // Use openTab to ensure the UserProfile tab is opened
        onProfileClick(); // Keep the original onProfileClick for any additional logic

    };

    const handleSettingsClick = () => {
        handleClose();
        onSettingsClick();
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
            onLogout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {currentUser?.displayName || 'User'}
                </Typography>
                <IconButton
                    onClick={handleMenu}
                    size="small"
                    aria-controls={open ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar
                        alt={currentUser?.displayName || 'User'}
                        src={currentUser?.photoURL}
                        sx={{ 
                            width: 32, 
                            height: 32,
                            border: (theme) => `2px solid ${theme.palette.primary.main}`
                        }}
                    />
                </IconButton>
            </Box>
            <StyledMenu
                anchorEl={anchorEl}
                id="user-menu"
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
         
         
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={translate('common.logout')} />
                </MenuItem>
            </StyledMenu>
        </Box>
    );
};

export default UserMenu;
