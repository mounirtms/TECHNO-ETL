import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Link,
    styled,
    keyframes 
} from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, FOOTER_HEIGHT } from './Constants';
import { useLanguage } from '../../contexts/LanguageContext';
import packageJson from '../../../package.json';

// Add text animation keyframes
const textGradientAnimation = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const StyledFooter = styled(({ isLoginScreen, sidebarOpen, ...other }) => 
    <AppBar {...other} />)(({ theme, isLoginScreen, sidebarOpen }) => ({
    position: 'fixed',
    bottom: 0,
    height: `${FOOTER_HEIGHT}px`,
    minHeight: `${FOOTER_HEIGHT}px`,
    width: isLoginScreen ? '100%' : `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
    backgroundColor: theme.palette.primary.main,
    marginLeft: isLoginScreen ? 0 : `${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    zIndex: theme.zIndex.appBar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Prevent any potential overflow
}));

const AnimatedTypography = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(45deg, 
        ${theme.palette.primary.light}, 
        ${theme.palette.secondary.light}, 
        ${theme.palette.text.secondary}
    )`,
    backgroundSize: '200% 200%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    animation: `${textGradientAnimation} 5s ease infinite`,
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
    }
}));

const Footer = ({ sidebarOpen, isLoginScreen = false }) => {
    const { language } = useLanguage();
    const currentYear = new Date().getFullYear();
    const buildVersion = packageJson.version || '1.0.0';

    return (
        <StyledFooter 
            position="fixed" 
            sidebarOpen={sidebarOpen} 
            isLoginScreen={isLoginScreen}
        >
            <Toolbar 
                sx={{ 
                    width: '100%',
                    minHeight: `${FOOTER_HEIGHT}px !important`, 
                    height: `${FOOTER_HEIGHT}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2, // Add some horizontal padding
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                }}>
                    <AnimatedTypography 
                        variant="body2" 
                        color="inherit"
                    >
                        {currentYear} 
                        <Link 
                            href="https://technostationary.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{
                                color: 'inherit',
                                ml: 0.5,
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Technostationary.com
                        </Link>
                    </AnimatedTypography>
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                }}>
                    <AnimatedTypography 
                        variant="body2" 
                        color="inherit"
                    >
                        Developed by 
                        <Link 
                            href="https://technostationary.com/team" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{
                                color: 'inherit',
                                ml: 0.5,
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Technostationary Team
                        </Link>
                    </AnimatedTypography>
                </Box>

                <Box>
                    <AnimatedTypography 
                        variant="body2" 
                        color="inherit"
                    >
                        v{buildVersion}
                    </AnimatedTypography>
                </Box>
            </Toolbar>
        </StyledFooter>
    );
};

export default Footer;