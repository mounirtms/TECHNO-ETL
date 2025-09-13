import React, { useState, useEffect, Suspense } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    useTheme,
    useMediaQuery,
    CircularProgress,
    alpha
} from '@mui/material';
import { useTab } from '../../contexts/TabContext';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from './Constants';


const TabPanel = () => {
    const theme = useTheme();
    const { tabs, activeTab, openTab, getActiveComponent } = useTab();
    const [tabPanelHeight, setTabPanelHeight] = useState('100%');
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const calculateHeight = () => {
            const windowHeight = window.innerHeight;
            const calculatedHeight = windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
            setTabPanelHeight(`${calculatedHeight}px`);
        };

        calculateHeight();
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    const handleChange = (event, newValue) => {
        openTab(newValue);
    };

    const ActiveComponent = getActiveComponent();

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Professional Tab Header */}
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(8px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: theme.shadows[1]
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    px: { xs: 1, sm: 2, md: 3 }
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        variant={isMobile ? "scrollable" : (tabs.length > 8 ? "scrollable" : "standard")}
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        centered={!isMobile && tabs.length <= 8}
                        sx={{
                            maxWidth: '100%',
                            '& .MuiTabs-flexContainer': {
                                justifyContent: !isMobile && tabs.length <= 8 ? 'center' : 'flex-start'
                            },
                            '& .MuiTab-root': {
                                minWidth: isMobile ? 90 : 120,
                                maxWidth: isMobile ? 140 : 200,
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                padding: isMobile ? '8px 12px' : '12px 20px',
                                textTransform: 'none',
                                fontWeight: 500,
                                letterSpacing: '0.02em',
                                transition: theme.transitions.create(['color', 'background-color'], {
                                    duration: theme.transitions.duration.short
                                }),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    color: theme.palette.primary.main
                                },
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                    fontWeight: 600
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            },
                            '& .MuiTabs-scrollButtons': {
                                '&.Mui-disabled': {
                                    opacity: 0.3
                                }
                            }
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.id}
                                label={isMobile && tab.label.length > 12 
                                    ? `${tab.label.substring(0, 10)}...` 
                                    : tab.label
                                }
                                value={tab.id}
                                aria-label={`${tab.label} tab`}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            {/* Centered Tab Content */}
            <Box sx={{
                flexGrow: 1,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                p: { xs: 1, sm: 1.5, md: 2 },
                height: `calc(${tabPanelHeight} - ${isMobile ? '48px' : '56px'})`
            }}>
                <Box sx={{
                    width: '100%',
                    maxWidth: '100%',
                    height: '100%',
                    overflow: 'auto',
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: theme.shadows[2],
                    '& .MuiDataGrid-root': {
                        border: 'none',
                        borderRadius: 2,
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: isMobile ? '12px' : '16px',
                            minHeight: isMobile ? '52px' : '64px',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            minHeight: isMobile ? '44px' : '52px',
                            backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        },
                        '& .MuiDataGrid-row': {
                            minHeight: isMobile ? '44px' : '52px',
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.04)
                            }
                        }
                    }
                }}>
                    {ActiveComponent ? (
                        <Suspense fallback={
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '300px',
                                flexDirection: 'column',
                                gap: 3
                            }}>
                                <CircularProgress 
                                    size={48}
                                    thickness={4}
                                    sx={{
                                        color: theme.palette.primary.main
                                    }}
                                />
                                <Typography 
                                    variant="body1" 
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Loading {tabs.find(tab => tab.id === activeTab)?.label || 'Content'}...
                                </Typography>
                            </Box>
                        }>
                            <Box sx={{ 
                                height: '100%', 
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                <ActiveComponent />
                            </Box>
                        </Suspense>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '300px',
                            flexDirection: 'column',
                            gap: 3,
                            textAlign: 'center'
                        }}>
                            <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
                                Component Not Found
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                The requested component could not be loaded.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please try selecting a different tab or refresh the page.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};
export default TabPanel;