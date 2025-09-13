import React, { Suspense, memo } from 'react';
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
import { styled } from '@mui/material/styles';
import { useTab } from '../../contexts/TabContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';

// ===== STYLED COMPONENTS =====

const TabPanelContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative'
}));

const TabsHeader = styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.98),
    backdropFilter: 'blur(8px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: theme.shadows[1],
    minHeight: 48
}));

const TabsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    px: { xs: 1, sm: 2, md: 3 }
}));

const StyledTabs = styled(Tabs)(({ theme, isMobile, tabCount }) => ({
    maxWidth: '100%',
    '& .MuiTabs-flexContainer': {
        justifyContent: !isMobile && tabCount <= 8 ? 'center' : 'flex-start'
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
}));

const ContentArea = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: theme.spacing(2),
    height: 'calc(100% - 48px)', // Subtract tab header height
    
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1)
    }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    overflow: 'auto',
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: theme.shadows[2],
    
    // Enhanced DataGrid styling
    '& .MuiDataGrid-root': {
        border: 'none',
        borderRadius: theme.spacing(2),
        '& .MuiDataGrid-toolbarContainer': {
            padding: theme.spacing(2),
            minHeight: 64,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(1.5),
                minHeight: 52
            }
        },
        '& .MuiDataGrid-columnHeaders': {
            minHeight: 52,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            
            [theme.breakpoints.down('sm')]: {
                minHeight: 44
            }
        },
        '& .MuiDataGrid-row': {
            minHeight: 52,
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
            },
            
            [theme.breakpoints.down('sm')]: {
                minHeight: 44
            }
        }
    }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    flexDirection: 'column',
    gap: theme.spacing(3)
}));

const ErrorContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    flexDirection: 'column',
    gap: theme.spacing(3),
    textAlign: 'center'
}));

// ===== MAIN COMPONENT =====

const TabPanel = memo(() => {
    const theme = useTheme();
    const { tabs, activeTab, openTab, getActiveComponent } = useTab();
    const { layoutConfig } = useLayoutResponsive();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (event, newValue) => {
        openTab(newValue);
    };

    const ActiveComponent = getActiveComponent();

    return (
        <TabPanelContainer>
            {/* Optimized Tab Header */}
            <TabsHeader>
                <TabsContainer>
                    <StyledTabs
                        value={activeTab}
                        onChange={handleChange}
                        variant={isMobile ? "scrollable" : (tabs.length > 8 ? "scrollable" : "standard")}
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        centered={!isMobile && tabs.length <= 8}
                        isMobile={isMobile}
                        tabCount={tabs.length}
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
                    </StyledTabs>
                </TabsContainer>
            </TabsHeader>

            {/* Perfectly Centered Content Area */}
            <ContentArea>
                <ContentWrapper>
                    {ActiveComponent ? (
                        <Suspense fallback={
                            <LoadingContainer>
                                <CircularProgress 
                                    size={48}
                                    thickness={4}
                                    sx={{ color: theme.palette.primary.main }}
                                />
                                <Typography 
                                    variant="body1" 
                                    color="text.secondary"
                                    sx={{ fontWeight: 500 }}
                                >
                                    Loading {tabs.find(tab => tab.id === activeTab)?.label || 'Content'}...
                                </Typography>
                            </LoadingContainer>
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
                        <ErrorContainer>
                            <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
                                Component Not Found
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                The requested component could not be loaded.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please try selecting a different tab or refresh the page.
                            </Typography>
                        </ErrorContainer>
                    )}
                </ContentWrapper>
            </ContentArea>
        </TabPanelContainer>
    );
});

TabPanel.displayName = 'TabPanel';
export default TabPanel;