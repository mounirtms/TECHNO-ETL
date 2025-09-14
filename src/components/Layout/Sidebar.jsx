import React, { useCallback, useMemo } from 'react';
import {
    Drawer,
    Box,
    useTheme,
    alpha,
    Backdrop,
    Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import { useTab } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import TreeMenuNavigation from './TreeMenuNavigation';

// Assets
import technoIcon from '../../assets/images/techno.png';
import logoTechno from '../../assets/images/logo_techno.png';

// ===== STYLED COMPONENTS =====

const ResponsiveDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isCollapsed', 'isTemporary'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isCollapsed, isTemporary }) => ({
    width: sidebarWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    
    '& .MuiDrawer-paper': {
        width: sidebarWidth,
        position: 'fixed',
        top: 0,
        bottom: 0,
        [isRTL ? 'right' : 'left']: 0,
        height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        zIndex: theme.zIndex.drawer,
        
        // Enhanced background with glassmorphism effect
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)'
            : 'linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(32,32,32,0.95) 100%)',
        
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        
        // RTL-aware borders and shadows
        borderRight: isRTL ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderLeft: isRTL ? `1px solid ${alpha(theme.palette.divider, 0.12)}` : 'none',
        
        boxShadow: isRTL 
            ? theme.palette.mode === 'light'
                ? '-4px 0 20px rgba(0,0,0,0.08)'
                : '-4px 0 20px rgba(0,0,0,0.3)'
            : theme.palette.mode === 'light'
                ? '4px 0 20px rgba(0,0,0,0.08)'
                : '4px 0 20px rgba(0,0,0,0.3)',
        
        // Smooth transitions
        transition: theme.transitions.create(['width', 'transform', 'box-shadow', 'opacity'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard
        }),
        
        // Mobile handling
        ...(isTemporary && {
            position: 'fixed',
            zIndex: theme.zIndex.modal,
            transform: 'translateX(0)',
            
            [theme.breakpoints.down('md')]: {
                transform: 'translateX(0)',
                width: 280 // Fixed width for mobile
            }
        }),
        
        // Enhanced scrollbar styling
        '&::-webkit-scrollbar': {
            width: isCollapsed ? 0 : 6,
            transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.short
            })
        },
        
        '&::-webkit-scrollbar-track': {
            background: 'transparent'
        },
        
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.text.primary, 0.2),
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.background.paper, 0.1)}`,
            
            '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.3)
            }
        },
        
        // Subtle hover effects for expanded sidebar
        ...(!isCollapsed && !isTemporary && {
            '&:hover': {
                boxShadow: `${isRTL ? '-' : ''}6px 0 20px ${alpha(theme.palette.common.black, theme.palette.mode === 'light' ? 0.08 : 0.25)}`
            }
        })
    }
}));

const LogoContainer = styled(Box, {
    shouldForwardProp: (prop) => !['isCollapsed', 'isRTL'].includes(prop)
})(({ theme, isCollapsed, isRTL }) => ({
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(isCollapsed ? 1 : 2),
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
    position: 'relative',
    overflow: 'hidden',
    
    // RTL support
    direction: isRTL ? 'rtl' : 'ltr',
    
    // Hover effect
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
    },
    
    transition: theme.transitions.create(['padding', 'background-color'], {
        duration: theme.transitions.duration.short
    })
}));

const LogoImage = styled('img')(({ theme }) => ({
    height: 'auto',
    width: '100%',
    maxHeight: 40,
    objectFit: 'contain',
    transition: theme.transitions.create(['opacity', 'transform'], {
        duration: theme.transitions.duration.standard
    }),
    
    '&:hover': {
        transform: 'scale(1.02)'
    }
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
}));

const MobileBackdrop = styled(Backdrop)(({ theme }) => ({
    zIndex: theme.zIndex.drawer - 1,
    backgroundColor: alpha(theme.palette.common.black, 0.5),
    backdropFilter: 'blur(4px)'
}));

// ===== MAIN COMPONENT =====

/**
 * Enhanced Sidebar Component
 * 
 * Features:
 * - Full RTL support with proper positioning
 * - Responsive layout integration
 * - Smooth animations and transitions
 * - Mobile overlay support
 * - Enhanced visual design
 * - Accessibility compliance
 */
const Sidebar = () => {
    const theme = useTheme();
    const { activeTab, openTab } = useTab();
    const { translate } = useLanguage();
    const { currentUser } = useAuth();
    const { isRTL, rtlUtils } = useRTL();
    
    const {
        sidebarState,
        dimensions,
        layoutConfig,
        closeSidebar,
        toggleSidebarCollapse
    } = useLayoutResponsive();

    // Optimized tab click handler
    const handleTabClick = useCallback((tabId) => {
        if (typeof openTab === 'function') {
            openTab(tabId);
        }
        
        // Auto-close sidebar on mobile after navigation
        if (layoutConfig.isMobile && sidebarState.isTemporary) {
            closeSidebar();
        }
    }, [openTab, layoutConfig.isMobile, sidebarState.isTemporary, closeSidebar]);

    // Simplified backdrop click handler
    const handleBackdropClick = useCallback(() => {
        if (sidebarState.isTemporary) {
            closeSidebar();
        }
    }, [sidebarState.isTemporary, closeSidebar]);

    // Smart logo selection based on sidebar state
    const logoSrc = useMemo(() => {
        // Use the expanded logo when sidebar is open and not collapsed, otherwise use icon
        return (sidebarState.isOpen && !sidebarState.isCollapsed) ? logoTechno : technoIcon;
    }, [sidebarState.isOpen, sidebarState.isCollapsed]);

    // Drawer variant optimization
    const drawerVariant = sidebarState.isTemporary ? 'temporary' : 'permanent';

    return (
        <>
            <ResponsiveDrawer
                variant={drawerVariant}
                open={sidebarState.isOpen}
                onClose={handleBackdropClick}
                sidebarWidth={dimensions.sidebar.width}
                isRTL={isRTL}
                isCollapsed={sidebarState.isCollapsed}
                isTemporary={sidebarState.isTemporary}
                anchor={isRTL ? 'right' : 'left'}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                    BackdropComponent: sidebarState.isTemporary ? MobileBackdrop : undefined
                }}
                SlideProps={{
                    direction: isRTL ? 'left' : 'right'
                }}
            >
                {/* Logo Section */}
                <LogoContainer 
                    isCollapsed={sidebarState.isCollapsed}
                    isRTL={isRTL}
                >
                    <Fade in timeout={300}>
                        <LogoImage
                            src={logoSrc}
                            alt="Techno-ETL Logo"
                            loading="lazy"
                        />
                    </Fade>
                </LogoContainer>

                {/* Navigation Section */}
                <NavigationContainer>
                    <TreeMenuNavigation
                        open={sidebarState.isOpen}
                        isRTL={isRTL}
                        activeTab={activeTab}
                        onTabClick={handleTabClick}
                        currentUser={currentUser}
                        translate={translate}
                        isCollapsed={sidebarState.isCollapsed} // Pass the collapse state
                        isMobile={layoutConfig.isMobile}
                    />
                </NavigationContainer>
            </ResponsiveDrawer>
        </>
    );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;