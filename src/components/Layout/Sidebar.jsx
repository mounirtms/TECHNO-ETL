import React from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Tooltip,
    Box,
    useTheme
} from '@mui/material';

import { MENU_ITEMS } from './Constants';
import { useTab } from '../../contexts/TabContext';
import technoIcon from '../../assets/images/techno.png';
import logoTechno from '../../assets/images/logo_techno.png';
const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const Sidebar = ({ open, toggleDrawer }) => {
    const theme = useTheme();
    const { activeTab, openTab } = useTab();

    const handleTabClick = (tabId) => {
        openTab(tabId);
    };

    return (
        <Drawer
        variant="permanent"
        open={open}
        sx={{
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
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
            },
        }}
    >
             <Box
                sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                }}
            >
                <img
                    src={open ? logoTechno : technoIcon}
                    alt="Logo"
                    style={{
                        maxWidth: open ? '180px' : '40px',
                        height: 'auto',
                        transition: theme.transitions.create('all', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }}
                />
            </Box>
            <List>
                {MENU_ITEMS.map((item) => (
                    <Tooltip 
                        key={item.id}
                        title={!open ? item.label : ''}
                        placement="right"
                    >
                        <ListItem
                            button
                            selected={activeTab === item.id}
                            onClick={() => handleTabClick(item.id)}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.action.selected
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                }}
                            >
                                <item.icon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label} 
                                sx={{ 
                                    opacity: open ? 1 : 0,
                                    transition: theme.transitions.create('opacity', {
                                        duration: theme.transitions.duration.enteringScreen,
                                    })
                                }} 
                            />
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;