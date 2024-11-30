import React from 'react';
import {
    Box,
    Tabs,
    Tab,
    IconButton,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TabPanel = ({ tabs, activeTab, onTabChange, onTabClose, onContentChange }) => {
    const theme = useTheme();

    // Validate inputs
    if (!tabs?.length) {
        console.warn('TabPanel: No tabs provided');
        return null;
    }

    return (
        <Box sx={{
            width: '100%',
            bgcolor: 'background.tabs',
            borderBottom: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar - 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}>
            <Tabs
                value={activeTab}
                onChange={onTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="dashboard tabs"
                sx={{
                    minHeight: theme.customValues.tabHeight,
                    '& .MuiTabs-scroller': {
                        height: theme.customValues.tabHeight,
                    },
                    '& .MuiTabs-flexContainer': {
                        height: theme.customValues.tabHeight,
                    },
                    '& .MuiTab-root': {
                        minHeight: theme.customValues.tabHeight,
                        padding: '0 16px',
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&.Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 600,
                        },
                    },
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderTopLeftRadius: 3,
                        borderTopRightRadius: 3,
                    },
                    '& .MuiTabs-scrollButtons': {
                        width: 28,
                        '&.Mui-disabled': {
                            opacity: 0.3,
                        },
                        '& svg': {
                            fontSize: '1.25rem',
                        },
                    },
                }}
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        value={tab.id}
                        label={
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                whiteSpace: 'nowrap',
                                height: '100%',
                            }}>
                                {tab.label}
                                {tab.id !== 'dashboard' && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onTabClose(tab.id, e);
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        sx={{
                                            width: 16,
                                            height: 16,
                                            ml: 0.5,
                                            p: 0,
                                            '&:hover': {
                                                color: 'error.main',
                                                bgcolor: 'error.light',
                                            },
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                )}
                            </Box>
                        }
                        sx={{
                            '&:hover': {
                                color: 'primary.main',
                                opacity: 0.8,
                            },
                            '&.Mui-selected:hover': {
                                color: 'primary.main',
                                opacity: 1,
                            },
                        }}
                        onClick={() => onContentChange?.(tab.id)}
                    />
                ))}
            </Tabs>
        </Box>
    );
};

TabPanel.displayName = 'TabPanel';

export default TabPanel;
