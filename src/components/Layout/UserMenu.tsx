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
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTab } from '../../contexts/TabContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

const UserMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { currentUser, logout } = useAuth();
    const { translate } = useLanguage();
    const { openTab } = useTab();
    const navigate = useNavigate();

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpenProfile = () => {
        navigate('/profile'); // Navigate directly to the profile route
        handleClose();
    };


    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
        } catch(error: any) {
            console.error('Error logging out:', error);
            toast.error('Failed to logout. Please try again.');
        }
    };

    return (
        <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', textAlign: 'center' } as any}>
            <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 } as any}>
                <Typography variant="subtitle1" sx={{ display: "flex", display: { xs: 'none', sm: 'block' } }}>
                    {currentUser?.displayName || currentUser?.email || translate('common.user')}
                </Typography>
                <IconButton
                    onClick={handleMenu}
                    size="small"
                    aria-controls={open ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar
                        alt={currentUser?.displayName || translate('common.user')}
                        src={currentUser?.photoURL}
                        sx={{
                            border: (theme) => `2px solid ${theme.palette.primary.main}`
                        }}
                    />
                </IconButton>
            </Box>
            <StyledMenu
                anchorEl={anchorEl}
                id
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
         
               
                <MenuItem onClick={handleOpenProfile}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={translate('common.profile')} />
                </MenuItem>

                <Divider />
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
