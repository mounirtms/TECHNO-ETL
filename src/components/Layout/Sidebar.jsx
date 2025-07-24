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
import { useLanguage } from '../../contexts/LanguageContext';
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
        transition: theme.transitions.create(['width', 'transform'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
        }),
        overflowX: 'hidden',
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(18,18,18,0.95) 0%, rgba(32,32,32,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: isRTL ? 'none' : `1px solid ${theme.palette.divider}`,
        borderLeft: isRTL ? `1px solid ${theme.palette.divider}` : 'none',
        boxShadow: theme.palette.mode === 'light'
            ? '4px 0 20px rgba(0,0,0,0.08)'
            : '4px 0 20px rgba(0,0,0,0.3)',
        [theme.breakpoints.up('sm')]: {
            position: 'fixed',
            height: '100%',
            ...(isRTL ? { right: 0 } : { left: 0 }),
        },
        [theme.breakpoints.down('sm')]: {
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            width: DRAWER_WIDTH,
            zIndex: theme.zIndex.drawer + 1,
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

const StyledListItem = styled(ListItem, {
    shouldForwardProp: (prop) => !['isRTL', 'open'].includes(prop),
})(({ theme, isRTL, open }) => ({
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
    const { translate } = useLanguage();

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
                    (!item.hidden && !!item.licensed) && (
                        <Tooltip
                            key={item.id}
                            title={!open ? translate(item.labelKey) : ''}
                            placement={isRTL ? "left" : "right"}
                        >
                            <StyledListItem
                                component="div"
                                selected={activeTab === item.id}
                                onClick={() => handleTabClick(item.id)}
                                isRTL={isRTL}
                                open={open}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemIcon>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={translate(item.labelKey)}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        transition: theme.transitions.create('opacity'),
                                        marginLeft: isRTL ? 0 : 'inherit',
                                        marginRight: isRTL ? 'inherit' : 0,
                                    }}
                                />
                            </StyledListItem>
                        </Tooltip>
                    )
                ))}
            </List>
        </StyledDrawer>
    );
};

export default Sidebar;