import React from 'react';
import { 
    Box, 
    Typography, 
    Link,
    styled 
} from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import packageJson from '../../../package.json';

const FooterContainer = styled(({ 
    component, 
    sidebarOpen, 
    isLoginScreen, 
    isUsingLocalData, 
    ...props 
}) => (
    <Box 
        component={component} 
        data-login-screen={isLoginScreen} 
        data-local-data={isUsingLocalData} 
        {...props} 
    />
))(({ theme, sidebarOpen, isLoginScreen, isUsingLocalData }) => {
    const baseStyles = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing(1, 2),
        height: `${FOOTER_HEIGHT}px`,
        width: isLoginScreen 
            ? '100%' 
            : `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
        marginLeft: isLoginScreen ? 0 : `${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxShadow: theme.shadows[2],
        zIndex: theme.zIndex.drawer + 1,
        
        // Styling based on data attributes
        '&[data-local-data="true"]': {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
        },
        '&[data-local-data="false"]': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        }
    };

    return baseStyles;
});

const AnimatedLink = styled(Link)(({ theme }) => ({
    color: 'inherit',
    marginLeft: theme.spacing(0.5),
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        textDecoration: 'underline',
        transform: 'scale(1.02)',
    }
}));

const Footer = ({ sidebarOpen, isLoginScreen = false }) => {
    const { language } = useLanguage();
    const { isUsingLocalData } = useAuth();
    const currentYear = new Date().getFullYear();
    const buildVersion = packageJson.version || '1.0.0';

    return (
        <FooterContainer 
            component="footer" 
            sidebarOpen={sidebarOpen} 
            isLoginScreen={isLoginScreen}
            isUsingLocalData={isUsingLocalData}
        >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">
                    {currentYear} 
                    <AnimatedLink 
                        href="https://technostationary.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Technostationary.com
                    </AnimatedLink>
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">
                    {isUsingLocalData && 'Local Data Mode: '}
                    Developed by 
                    <AnimatedLink 
                        href="https://technostationary.com/team" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Technostationary Team
                    </AnimatedLink>
                </Typography>
            </Box>

            <Box>
                <Typography variant="body2">
                    v{buildVersion}
                </Typography>
            </Box>
        </FooterContainer>
    );
};

export default Footer;