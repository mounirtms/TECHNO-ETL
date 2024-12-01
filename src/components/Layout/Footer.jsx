import React, { memo } from 'react';
import { AppBar, Toolbar, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(AppBar)(({ theme }) => ({
    top: 'auto',
    bottom: 0,
    backgroundColor: theme.palette.primary.main,
    height: '28px',
    '& .MuiToolbar-root': {
        minHeight: '28px',
        padding: theme.spacing(0, 2),
    },
}));

const Footer = memo(({ version = '1.0.0', buildInfo = 'Development Build' }) => {
    return (
        <StyledFooter position="fixed">
            <Toolbar>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography variant="caption" color="inherit">
                        Version: {version} | {buildInfo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Link
                            href="#"
                            color="inherit"
                            underline="hover"
                            variant="caption"
                        >
                            About
                        </Link>
                        <Link
                            href="#"
                            color="inherit"
                            underline="hover"
                            variant="caption"
                        >
                            Support
                        </Link>
                        <Link
                            href="#"
                            color="inherit"
                            underline="hover"
                            variant="caption"
                        >
                            technostationary.com
                        </Link>
                    </Box>
                </Box>
            </Toolbar>
        </StyledFooter>
    );
});

Footer.displayName = 'Footer';

export default Footer;
