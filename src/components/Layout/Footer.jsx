import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Link,
    styled 
} from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import versionInfo from '../../../version.json';

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
        backgroundColor: isUsingLocalData ? theme.palette.error.main : theme.palette.primary.main,
        color: isUsingLocalData ? theme.palette.error.contrastText : theme.palette.primary.contrastText
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
    const [version, setVersion] = useState('');
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const loadVersion = async () => {
            const response = await fetch('../../../version.json');
            const data = await response.json();
            setVersion(data.version);
        };
        loadVersion();
    }, []);

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
                        href="https://technostationery.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Techno Stationery
                    </AnimatedLink> 
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">
                 
                    <AnimatedLink 
                        href="/assets/docs/index.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Documentation
                    </AnimatedLink>
                </Typography>
            </Box>
           

            <Box>
                <Typography variant="body2">
                    v{version}
                </Typography>
            </Box>
        </FooterContainer>
    );
};

export default Footer;