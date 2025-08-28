import React from 'react';
import {
    Drawer,
    Box,
    useTheme,
    styled
} from '@mui/material';

import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';
import { useTab } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import technoIcon from '../../assets/images/techno.png';
import logoTechno from '../../assets/images/logo_techno.png';
import { useAuth } from '../../contexts/AuthContext';
import TreeMenuNavigation from './TreeMenuNavigation';

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => !['isRTL', 'open'].includes(prop),
})(({ theme, open, isRTL }) => ({
    width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(18,18,18,0.95) 0%, rgba(32,32,32,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: isRTL ? 'none' : `1px solid ${theme.palette.divider}`,
        borderLeft: isRTL ? `1px solid ${theme.palette.divider}` : 'none',
        boxShadow: theme.palette.mode === 'light'
            ? (isRTL ? '-4px 0 20px rgba(0,0,0,0.08)' : '4px 0 20px rgba(0,0,0,0.08)')
            : (isRTL ? '-4px 0 20px rgba(0,0,0,0.3)' : '4px 0 20px rgba(0,0,0,0.3)'),
        [theme.breakpoints.up('sm')]: {
            position: 'fixed',
            height: '100%',
            ...(isRTL ? { right: 0 } : { left: 0 }),
        },
        [theme.breakpoints.down('sm')]: {
            transform: open ? 'translateX(0)' : (isRTL ? `translateX(${DRAWER_WIDTH}px)` : `translateX(-${DRAWER_WIDTH}px)`),
            width: DRAWER_WIDTH,
            zIndex: theme.zIndex.drawer + 2,
        },
        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'light' ? '#E0E0E0' : '#424242',
            borderRadius: '2px',
        },
    },
}));

const LogoContainer = styled(Box)(({ theme, open }) => ({
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: theme.transitions.create('opacity', {
        easing: theme.transitions.easing.sharp,
        duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
    }),
}));

const Sidebar = ({ open, isRTL = false }) => {
    const theme = useTheme();
    const { activeTab, openTab } = useTab();
    const { translate } = useLanguage();
    const { currentUser } = useAuth();

    const handleTabClick = (tabId) => {
        openTab(tabId);
    };

    return (
        <StyledDrawer
            variant="permanent"
            open={open}
            isRTL={isRTL}
        >
            <LogoContainer open={open} sx={{ opacity: open ? 1 : 0 }}>
                <Box
                    component="img"
                    src={open ? logoTechno : technoIcon}
                    alt="Logo"
                    sx={{
                        height: 'auto',
                        width: '100%',
                        maxWidth: open ? '120px' : '32px',
                        transition: theme.transitions.create('all', {
                            easing: theme.transitions.easing.sharp,
                            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
                        }),
                    }}
                />
            </LogoContainer>
            {/* Tree Menu Navigation */}
            <TreeMenuNavigation
                open={open}
                isRTL={isRTL}
                activeTab={activeTab}
                onTabClick={handleTabClick}
                currentUser={currentUser}
                translate={translate}
            />
        </StyledDrawer>
    );
};

export default Sidebar;