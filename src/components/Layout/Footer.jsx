import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Link,
    Chip,
    useTheme,
    alpha,
    useMediaQuery,
    Divider
} from '@mui/material';
import {
    Language as LanguageIcon,
    Storage as StorageIcon,
    Copyright as CopyrightIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import { useVersion } from '../../hooks/useVersion';
import TooltipWrapper from '../common/TooltipWrapper';

// ===== STYLED COMPONENTS =====

const ResponsiveFooter = styled(Box, {
    shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary', 'isUsingLocalData', 'isLoginScreen'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary, isUsingLocalData, isLoginScreen }) => ({
    position: 'fixed',
    bottom: 0,
    [isRTL ? 'right' : 'left']: isLoginScreen ? 0 : (isTemporary ? 0 : sidebarWidth),
    width: isLoginScreen ? '100%' : `calc(100% - ${isTemporary ? 0 : sidebarWidth}px)`,
    height: 48,
    padding: theme.spacing(0.5, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: theme.zIndex.appBar - 1,
    
    // Dynamic background based on data source
    backgroundColor: isUsingLocalData 
        ? alpha(theme.palette.warning.main, 0.95)
        : alpha(theme.palette.background.paper, 0.95),
    
    color: isUsingLocalData 
        ? theme.palette.warning.contrastText
        : theme.palette.text.primary,
    
    backdropFilter: 'blur(8px)',
    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: theme.shadows[1],
    
    transition: theme.transitions.create(['left', 'right', 'width', 'background-color'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard
    }),
    
    // Mobile responsive
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.5, 1),
        height: 40
    }
}));

const FooterSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
    
    [theme.breakpoints.down('sm')]: {
        gap: theme.spacing(0.5)
    }
}));

const AnimatedLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: theme.transitions.create(['color', 'transform'], {
        duration: theme.transitions.duration.short
    }),
    
    '&:hover': {
        color: theme.palette.primary.main,
        textDecoration: 'underline',
        transform: 'translateY(-1px)'
    },
    
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem'
    }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
    height: 24,
    fontSize: '0.75rem',
    fontWeight: 600,
    
    [theme.breakpoints.down('sm')]: {
        height: 20,
        fontSize: '0.7rem'
    }
}));

const VersionInfo = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: 'monospace',
    opacity: 0.8,
    
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.7rem'
    }
}));

// ===== MAIN COMPONENT =====

/**
 * Enhanced Footer Component
 * 
 * Features:
 * - Responsive layout with sidebar integration
 * - RTL support with proper positioning
 * - Data source status indication
 * - Mobile-optimized design
 * - Smooth animations and transitions
 */
const Footer = ({ isLoginScreen = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { translate } = useLanguage();
    const { isUsingLocalData } = useAuth();
    const { isRTL, rtlUtils } = useRTL();
    const versionInfo = useVersion();
    
    const {
        sidebarState,
        dimensions,
        layoutPreferences
    } = useLayoutResponsive();

    // Don't render footer if disabled in preferences
    if (!layoutPreferences.showFooter && !isLoginScreen) {
        return null;
    }

    const currentYear = new Date().getFullYear();

    // Status indicator
    const statusIndicator = useMemo(() => {
        if (isUsingLocalData) {
            return (
                <TooltipWrapper title="Using local data - some features may be limited">
                    <StatusChip
                        icon={<StorageIcon />}
                        label="Local Mode"
                        color="warning"
                        variant="filled"
                        size="small"
                    />
                </TooltipWrapper>
            );
        }
        
        return (
            <TooltipWrapper title="Connected to server">
                <StatusChip
                    icon={<LanguageIcon />}
                    label="Online"
                    color="success"
                    variant="filled"
                    size="small"
                />
            </TooltipWrapper>
        );
    }, [isUsingLocalData]);

    // Compact footer content
    const footerContent = useMemo(() => {
        const versionText = versionInfo ? `v${versionInfo.fullVersion}` : 'v1.0.0';
        
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                width: '100%',
                gap: 1
            }}>
                {/* Left: Copyright & Company */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexDirection: isRTL ? 'row-reverse' : 'row'
                }}>
                    <CopyrightIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ 
                        fontSize: isMobile ? '0.7rem' : '0.75rem',
                        opacity: 0.8
                    }}>
                        {currentYear} Techno Stationery
                    </Typography>
                    
                    {!isMobile && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, opacity: 0.3 }} />
                            <Typography variant="body2" sx={{ 
                                fontSize: '0.7rem',
                                opacity: 0.6,
                                fontStyle: 'italic',
                                fontWeight: 500
                            }}>
                                Engineered with 💎 by Techno Innovation Team
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Center: Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {statusIndicator}
                </Box>

                {/* Right: Version & Links */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexDirection: isRTL ? 'row-reverse' : 'row'
                }}>
                    <VersionInfo>{versionText}</VersionInfo>
                    
                    {!isMobile && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, opacity: 0.3 }} />
                            <AnimatedLink
                                href="./docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ fontSize: '0.7rem' }}
                            >
                                {translate('common.documentation') || 'Docs'}
                            </AnimatedLink>
                        </>
                    )}
                </Box>
            </Box>
        );
    }, [currentYear, statusIndicator, versionInfo, isMobile, isRTL, translate]);

    return (
        <ResponsiveFooter
            component="footer"
            sidebarWidth={dimensions.sidebar.width}
            isRTL={isRTL}
            isTemporary={sidebarState.isTemporary}
            isUsingLocalData={isUsingLocalData}
            isLoginScreen={isLoginScreen}
            role="contentinfo"
            aria-label="Application footer"
        >
            {footerContent}
        </ResponsiveFooter>
    );
};

Footer.displayName = 'Footer';

export default Footer;