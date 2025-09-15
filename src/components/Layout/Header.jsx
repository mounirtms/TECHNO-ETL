import React, { useMemo } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    useTheme,
    Fade,
    alpha
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import { useLanguage } from '../../contexts/LanguageContext';
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import UserMenu from './UserMenu';
import TooltipWrapper from '../common/TooltipWrapper';

// ===== STYLED COMPONENTS =====

const ResponsiveAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary }) => ({
    position: 'fixed',
    top: 0,
    [isRTL ? 'right' : 'left']: isTemporary ? 0 : sidebarWidth,
    width: `calc(100% - ${isTemporary ? 0 : sidebarWidth}px)`,
    zIndex: theme.zIndex.appBar,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: theme.shadows[1],
    
    transition: theme.transitions.create(['left', 'right', 'width', 'background-color'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard
    }),
    
    // Hover effect
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        boxShadow: theme.shadows[2]
    }
}));

const HeaderToolbar = styled(Toolbar)(({ theme }) => ({
    minHeight: 64,
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    
    [theme.breakpoints.down('sm')]: {
        minHeight: 56,
        padding: theme.spacing(0, 1)
    }
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.spacing(1),
    transition: theme.transitions.create(['background-color', 'transform'], {
        duration: theme.transitions.duration.short
    }),
    
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transform: 'scale(1.05)'
    },
    
    '&:active': {
        transform: 'scale(0.95)'
    }
}));

const AppTitle = styled(Typography)(({ theme }) => ({
    flexGrow: 1,
    fontWeight: 600,
    letterSpacing: '0.5px',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.1rem'
    }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    
    [theme.breakpoints.down('sm')]: {
        gap: theme.spacing(0.25)
    }
}));

// ===== MAIN COMPONENT =====

/**
 * Enhanced Header Component
 * 
 * Features:
 * - Responsive layout with sidebar integration
 * - RTL support with proper positioning
 * - Smooth animations and transitions
 * - Mobile-optimized design
 * - Accessibility compliance
 */
export const Header = () => {
    const theme = useTheme();
    const { translate } = useLanguage();
    const { isRTL, rtlUtils } = useRTL();
    
    const {
        sidebarState,
        dimensions,
        layoutConfig,
        toggleSidebar,
        toggleSidebarCollapse,
        toggleSidebarPin
    } = useLayoutResponsive();

    // Determine which icon to show for sidebar toggle
    const getSidebarToggleIcon = useMemo(() => {
        if (!sidebarState.isOpen) {
            return <MenuIcon />;
        }
        
        if (sidebarState.isCollapsed) {
            return isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />;
        }
        
        return isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />;
    }, [sidebarState.isOpen, sidebarState.isCollapsed, isRTL]);

    // Get tooltip text for sidebar toggle
    const getSidebarToggleTooltip = useMemo(() => {
        if (!sidebarState.isOpen) {
            return translate('common.openSidebar') || 'Open sidebar';
        }
        
        if (sidebarState.isCollapsed) {
            return translate('common.expandSidebar') || 'Expand sidebar';
        }
        
        return translate('common.collapseSidebar') || 'Collapse sidebar';
    }, [sidebarState.isOpen, sidebarState.isCollapsed, translate]);

    // Optimized sidebar toggle handling
    const handleSidebarToggle = () => {
        if (layoutConfig.isMobile) {
            // On mobile, always toggle the sidebar visibility
            toggleSidebar();
        } else {
            // On desktop, if sidebar is open, toggle collapse state
            if (sidebarState.isOpen) {
                toggleSidebarCollapse();
            } else {
                // If sidebar is closed, open it
                toggleSidebar();
            }
        }
    };

    return (
        <ResponsiveAppBar
            sidebarWidth={dimensions.sidebar.width}
            isRTL={isRTL}
            isTemporary={sidebarState.isTemporary}
            elevation={0}
        >
            <HeaderToolbar>
                {/* Enhanced Sidebar Toggle Button */}
                <TooltipWrapper
                    title={getSidebarToggleTooltip}
                    placement={isRTL ? 'bottom-end' : 'bottom-start'}
                >
                    <ToggleButton
                        edge="start"
                        color="inherit"
                        aria-label={getSidebarToggleTooltip}
                        onClick={handleSidebarToggle}
                        size={layoutConfig.isMobile ? 'small' : 'medium'}
                        sx={{
                            mr: isRTL ? 0 : 1,
                            ml: isRTL ? 1 : 0
                        }}
                    >
                        <Fade in timeout={200}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                transition: 'transform 0.2s ease'
                            }}>
                                {getSidebarToggleIcon}
                            </Box>
                        </Fade>
                    </ToggleButton>
                </TooltipWrapper>

                {/* Optimized App Title */}
                <AppTitle 
                    variant="h6" 
                    noWrap 
                    component="div"
                    sx={{
                        textAlign: isRTL ? 'right' : 'left',
                        flex: '0 0 auto',
                        ml: isRTL ? 0 : 1,
                        mr: isRTL ? 1 : 0
                    }}
                >
                    {translate('common.appTitle') || 'Techno-ETL'}
                </AppTitle>

                {/* Flexible spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Streamlined Action Buttons */}
                <ActionButtons>
                    <UserMenu />
                </ActionButtons>
            </HeaderToolbar>
        </ResponsiveAppBar>
    );
};

Header.displayName = 'Header';

export default Header;