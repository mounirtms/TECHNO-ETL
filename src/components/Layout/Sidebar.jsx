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

/**
 * Sidebar Component
 * 
 * Features:
 * - Collapsible drawer
 * - Responsive logo
 * - Navigation menu with icons
 * - Active tab highlighting
 * - Tooltips for collapsed mode
 */
const Sidebar = ({ open }) => {
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
                width: open ? 240 : 64,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                '& .MuiDrawer-paper': {
                    overflowX: 'hidden',
                    width: open ? 240 : 64,
                    backgroundColor: theme.palette.background.paper,
                    borderRight: 'none',
                    boxShadow: theme.shadows[3],
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    transition: theme.transitions.create('all', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <img
                    src={open ? logoTechno : technoIcon}
                    alt="Logo"
                    style={{
                        maxWidth: open ? '180px' : '40px',
                        height: 'auto',
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }}
                />
            </Box>

            {/* Navigation Menu */}
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
                                    backgroundColor: `${theme.palette.primary.main}15`,
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: `${theme.palette.primary.main}25`,
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: theme.palette.primary.main,
                                    }
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: activeTab === item.id ? 'inherit' : theme.palette.text.secondary,
                                }}
                            >
                                <item.icon />
                            </ListItemIcon>
                            {open && (
                                <ListItemText 
                                    primary={item.label} 
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        sx: { 
                                            fontWeight: activeTab === item.id ? 600 : 400,
                                            transition: theme.transitions.create('font-weight')
                                        }
                                    }}
                                />
                            )}
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;