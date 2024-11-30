import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
    const { translate } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                px: 3,
                mt: 'auto',
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 64,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © {currentYear}{' '}
                <Link
                    href="https://technostationery.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    Techno Stationery
                </Link>
                . {translate('allRightsReserved')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Link
                    href="#"
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    {translate('privacyPolicy')}
                </Link>
                <Link
                    href="#"
                    color="inherit"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                    {translate('termsOfService')}
                </Link>
            </Box>
        </Box>
    );
};

export default Footer;
