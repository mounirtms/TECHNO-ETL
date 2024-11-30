import React from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import config from '../config/config';

// TODO: Add more footer items for logged-in state:
// - Documentation link
// - API Status
// - System Status
// - Admin Guide
// - Release Notes

// TODO: Add functionality:
// - Make Help/Support open modal with contact form
// - Add version check/update notification
// - Add system status indicators
// - Add language selector
// - Add quick theme toggle

const Footer = () => {
    const theme = useTheme();
    const { currentUser } = useAuth();
    const year = new Date().getFullYear();

    if (!currentUser) {
        // Login page footer
        return (
            <Box sx={{ 
                height: theme.customValues.footerHeight, 
                backgroundColor: theme.palette.background.footer, 
                color: theme.palette.text.footer, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                px: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider', 
                mt: 'auto', 
                width: '100%', 
                boxSizing: 'border-box' 
            }}>
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    <Link href="#" underline="hover" color="inherit">Terms</Link>
                    <span>•</span>
                    <Link href="#" underline="hover" color="inherit">Privacy</Link>
                    <span>•</span>
                    <Link href="#" underline="hover" color="inherit">Contact</Link>
                </Typography>
            </Box>
        );
    }

    // Dashboard footer
    return (
        <Box
            component="footer"
            sx={{
                height: theme.customValues.footerHeight,
                backgroundColor: theme.palette.background.footer,
                color: theme.palette.text.footer,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                mt: 'auto',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                &copy; {year} technostationary.com. All rights reserved. v{config.version}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Link
                    href="https://technostationary.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    technostationary.com
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    Help
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    Support
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    Terms
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    Privacy
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{ fontSize: '0.75rem' }}
                >
                    Contact
                </Link>
            </Box>
        </Box>
    );
};

export default Footer;
