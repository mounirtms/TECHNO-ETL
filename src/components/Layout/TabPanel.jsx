import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from './Constants';

// Custom Tab component with enhanced styling
const CustomTab = React.memo(({ label, onClose, closeable, active, value, ...props }) => {
    const theme = useTheme();
    
    // Remove non-DOM props before passing to Box
    const { 
        // Keep Material UI Tab props that should be stripped
        disableRipple,
        disableTouchRipple,
        selected,
        focusVisible,
        fullWidth, 
        selectionFollowsFocus, 
        textColor,
        indicator,
        isRTL,
        expanded,
        active: activeProp,
        ...restProps 
    } = props;

    const handleClose = (e) => {
        e.stopPropagation();
        onClose(e);
    };

    return (
        <Box
            {...restProps}
            sx={{
                position: 'relative',
                padding: '6px 16px',
                minHeight: 48,
                minWidth: 120,
                maxWidth: 200,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: active ? 'action.selected' : 'transparent',
                borderBottom: active ? `2px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                    bgcolor: active ? 'action.selected' : 'action.hover'
                },
                ...restProps.sx
            }}
        >
            <Typography 
                variant="body2"
                sx={{ 
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    pr: closeable ? 1 : 0
                }}
            >
                {label}
            </Typography>
            
            {closeable && (
                <IconButton
                    size="small"
                    onClick={handleClose}
                    sx={{
                        p: 0.5,
                        ml: 0.5,
                        '&:hover': {
                            bgcolor: 'action.selected'
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
        </Box>
    );
});

// Tab Panel Component
const TabPanel = () => {
    const theme = useTheme();
    const { tabs, activeTab, setActiveTab, closeTab, getActiveComponent } = useTab();
    
    // Calculate tab panel height
    const tabPanelHeight = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - 48px)`;
    
    // Handle tab change
    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, [setActiveTab]);
    
    // Handle tab close
    const handleTabClose = useCallback((tabId, event) => {
        event.stopPropagation();
        closeTab(tabId);
    }, [closeTab]);
    
    // Get active component
    const activeComponent = useMemo(() => getActiveComponent(), [getActiveComponent]);
    
    // Display tabs (filter out invalid ones)
    const displayTabs = useMemo(() => {
        return tabs.filter(tab => tab && tab.id && tab.title);
    }, [tabs]);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            bgcolor: 'background.paper',
            width: '100%'
        }}>
            {/* Tab Headers */}
            <Tabs
                value={activeTab || 'Dashboard'}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    minHeight: 48,
                    height: 48,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '& .MuiTabs-indicator': {
                        display: 'none'
                    },
                    '& .MuiTabs-scrollButtons': {
                        '&.Mui-disabled': {
                            opacity: 0.3
                        }
                    }
                }}
            >
                {displayTabs.map((tab) => (
                    <CustomTab
                        key={tab.id}
                        label={tab.title}
                        value={tab.id}
                        closeable={tab.closeable !== false}
                        active={activeTab === tab.id}
                        onClose={(e) => handleTabClose(tab.id, e)}
                    />
                ))}
            </Tabs>

            {/* Tab Content */}
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto',
                    height: tabPanelHeight,
                    bgcolor: 'background.default',
                    p: 0 // Remove padding to let components handle their own spacing
                }}
            >
                <Suspense fallback={
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%' 
                    }}>
                        <CircularProgress size={40} />
                        <Typography sx={{ ml: 2 }}>Loading content...</Typography>
                    </Box>
                }>
                    {activeComponent || (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography>No content available</Typography>
                        </Box>
                    )}
                </Suspense>
            </Box>
        </Box>
    );
};

export default React.memo(TabPanel);