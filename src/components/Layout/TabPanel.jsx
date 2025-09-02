import React, { useState, useEffect, Suspense, useMemo } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    CircularProgress,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTab } from '../../contexts/TabContext';
import { 
    HEADER_HEIGHT, 
    FOOTER_HEIGHT, 
    TAB_HEADER_HEIGHT,
    GRID_CONTAINER_HEIGHT,
    DASHBOARD_CONTENT_HEIGHT 
} from './Constants';

// Simplified Tab Panel Component with Perfect Height Calculations
const TabPanel = () => {
    const { tabs, activeTab, setActiveTab, closeTab, getActiveComponent } = useTab();
    
    // Fixed calculated heights for perfect tab layout
    const totalHeight = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`;
    const contentHeight = activeTab === 'Dashboard' 
        ? `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${TAB_HEADER_HEIGHT}px)`
        : `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${TAB_HEADER_HEIGHT}px)`;
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle tab close
    const handleTabClose = (event, tabId) => {
        event.stopPropagation();
        if (tabId !== 'Dashboard' && closeTab) {
            closeTab(tabId);
        }
    };
    
    // Get active component
    const ActiveComponent = useMemo(() => getActiveComponent(), [getActiveComponent]);

    // Ensure Dashboard tab is always present
    const displayedTabs = tabs.length > 0 ? tabs : [{ id: 'Dashboard', title: 'Dashboard', closeable: false }];

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: totalHeight,
            width: '100%',
            bgcolor: 'background.paper',
            overflow: 'hidden' // Prevent any overflow from container
        }}>
            {/* Tab Headers - Fixed Height */}
            <Tabs
                value={activeTab || 'Dashboard'}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    minHeight: TAB_HEADER_HEIGHT,
                    height: TAB_HEADER_HEIGHT,
                    maxHeight: TAB_HEADER_HEIGHT,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    flexShrink: 0, // Prevent shrinking
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                    },
                    '& .MuiTab-root': {
                        minHeight: TAB_HEADER_HEIGHT,
                        height: TAB_HEADER_HEIGHT,
                        textTransform: 'none',
                        fontWeight: 500
                    }
                }}
            >
                {displayedTabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        label={
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                maxWidth: 180,
                                gap: 1
                            }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: activeTab === tab.id ? 600 : 400
                                    }}
                                >
                                    {tab.title}
                                </Typography>
                                {tab.closeable && (
                                    <IconButton
                                        size="small"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleTabClose(e, tab.id);
                                        }}
                                        sx={{ 
                                            p: 0.5, 
                                            ml: 0.5,
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        }
                        value={tab.id}
                        sx={{
                            padding: '6px 16px',
                            minHeight: TAB_HEADER_HEIGHT,
                            textTransform: 'none'
                        }
                    }
                    />
                ))}
            </Tabs>

            {/* Tab Content - Uses remaining height */}
            <Box 
                sx={{ 
                    flexGrow: 1,
                    height: contentHeight,
                    maxHeight: contentHeight,
                    overflow: 'hidden', // Container should not scroll
                    bgcolor: 'background.default',
                    position: 'relative'
                }}
            >
                {ActiveComponent ? (
                    <Suspense
                        fallback={
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                height: '100%' 
                            }}>
                                <CircularProgress size={40} />
                                <Typography sx={{ ml: 2 }}>Loading {displayedTabs.find(t => t.id === activeTab)?.title}...</Typography>
                            </Box>
                        }
                    >
                        <Box sx={{ 
                            height: '100%',
                            width: '100%',
                            overflow: activeTab === 'Dashboard' ? 'auto' : 'hidden', // Dashboard scrolls, grids don't
                            position: 'relative'
                        }}>
                            <ActiveComponent />
                        </Box>
                    </Suspense>
                ) : (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%' 
                    }}>
                        <CircularProgress size={40} />
                        <Typography sx={{ ml: 2 }}>Loading content...</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TabPanel;