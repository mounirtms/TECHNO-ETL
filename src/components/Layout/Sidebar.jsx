import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText, 
    Tooltip,
    Box,
    useTheme,
    styled
} from '@mui/material';

import { MENU_ITEMS, DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';
import { useTab } from '../../contexts/TabContext';
import technoIcon from '../../assets/images/techno.png';
import logoTechno from '../../assets/images/logo_techno.png';

const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => !['isRTL'].includes(prop),
})(({ theme, open, isRTL }) => ({
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
        backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
        borderRight: isRTL ? 'none' : `1px solid ${theme.palette.divider}`,
        borderLeft: isRTL ? `1px solid ${theme.palette.divider}` : 'none',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        [theme.breakpoints.up('sm')]: {
            position: 'fixed',
            height: '100%',
            ...(isRTL ? { right: 0 } : { left: 0 }),
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

const StyledListItem = styled(ListItem)(({ theme, isRTL, open }) => ({
    minHeight: 40,
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.25),
    marginTop: theme.spacing(0.25),
    marginRight: isRTL ? theme.spacing(0.5) : theme.spacing(1),
    marginLeft: isRTL ? theme.spacing(1) : theme.spacing(0.5),
    borderRadius: isRTL ? '16px 0 0 16px' : '0 16px 16px 0',
    transition: theme.transitions.create(['background-color', 'color'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
    },
    '&.Mui-selected': {
        backgroundColor: `${theme.palette.primary.main}12`,
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: `${theme.palette.primary.main}20`,
        },
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Sidebar = ({ open, toggleDrawer, isRTL = false }) => {
    const theme = useTheme();
    const { activeTab, openTab } = useTab();

    const handleTabClick = (tabId) => {
        openTab(tabId);
    };

    return (
        <StyledDrawer
            variant="permanent"
            open={open}
            isRTL={isRTL}
        >
            <LogoContainer>
                <Box
                    component="img"
                    src={open ? logoTechno : technoIcon}
                    alt="Logo"
                    sx={{
                        height: 'auto',
                        width: '100%',
                        transition: theme.transitions.create('all'),
                    }}
                />
            </LogoContainer>
            <List sx={{ mt: 1 }}>
                {MENU_ITEMS.map((item) => (
                    <Tooltip 
                        key={item.id}
                        title={!open ? item.label : ''}
                        placement={isRTL ? "left" : "right"}
                    >
                        <StyledListItem
                            button
                            selected={activeTab === item.id}
                            onClick={() => handleTabClick(item.id)}
                            isRTL={isRTL}
                            open={open}
                        >
                            <ListItemIcon>
                                <item.icon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label}
                                sx={{ 
                                    opacity: open ? 1 : 0,
                                    transition: theme.transitions.create('opacity'),
                                    marginLeft: isRTL ? 0 : 'inherit',
                                    marginRight: isRTL ? 'inherit' : 0,
                                }}
                            />
                        </StyledListItem>
                    </Tooltip>
                ))}
            </List>
        </StyledDrawer>
    );
};

export default Sidebar;