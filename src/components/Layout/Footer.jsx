import React, { memo } from 'react';
import { AppBar, Toolbar, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './constants'; // Ensure constants are imported
import { useLanguage } from '../../contexts/LanguageContext';

const StyledFooter = styled(({ isLoginScreen, sidebarOpen, ...other }) => <AppBar {...other} />)(({ theme, isLoginScreen, sidebarOpen }) => ({
    top: 'auto',
    bottom: 0,
    backgroundColor: theme.palette.primary.main,
    width: isLoginScreen ? '100%' : `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
    marginLeft: isLoginScreen ? 0 : `${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    '& .MuiToolbar-root': {
        minHeight: '28px',
        padding: theme.spacing(0, 2),
    },
}));

const Footer = memo(({ version = '1.0.0', buildInfo = 'Development Build', sidebarOpen, isLoginScreen }) => {
    return (
       <StyledFooter position="static" isLoginScreen={isLoginScreen} sidebarOpen={sidebarOpen}>
            <Toolbar>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography variant="caption" color="inherit">
                        Version: {version} | {buildInfo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Link href="#" color="inherit" underline="hover" variant="caption">
                            About
                        </Link>
                        <Link href="#" color="inherit" underline="hover" variant="caption">
                            Support
                        </Link>
                        <Link href="#" color="inherit" underline="hover" variant="caption">
                            technostationary.com
                        </Link>
                    </Box>
                </Box>
            </Toolbar>
        </StyledFooter>
    );
});

export default Footer;