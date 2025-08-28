import React from 'react';
import {
    Toolbar,
    IconButton,
    Typography,
    useTheme
} from '@mui/material';
import { StyledAppBar } from './styles';
import { DRAWER_WIDTH, COLLAPSED_WIDTH, HEADER_HEIGHT } from './Constants';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLanguage } from '../../contexts/LanguageContext';
import UserMenu from './UserMenu';

const Header = ({ sidebarOpen, handleDrawerToggle }) => {
    const theme = useTheme();
    const { translate } = useLanguage();
    const isRTL = theme.direction === 'rtl';

    return (
        <StyledAppBar
            position="fixed"
            open={sidebarOpen}
            isRTL={isRTL}
            sx={{
                height: HEADER_HEIGHT,
                width: {
                    xs: '100%',
                    sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`
                },
                ...(isRTL ? {
                    marginRight: {
                        sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                    }
                } : {
                    marginLeft: {
                        sm: sidebarOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`
                    }
                }),
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: sidebarOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label={sidebarOpen ? translate('common.collapseMenu') : translate('common.expandMenu')}
                    onClick={handleDrawerToggle}
                    sx={{ 
                        marginRight: isRTL ? 0 : theme.spacing(2),
                        marginLeft: isRTL ? theme.spacing(2) : 0,
                        display: 'flex'
                    }}
                >
                    {sidebarOpen ? (isRTL ? <ChevronRightIcon /> : <ChevronLeftIcon />) : (isRTL ? <ChevronLeftIcon /> : <ChevronRightIcon />)}
                </IconButton>

                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    {translate('common.appTitle')}
                </Typography>

                <UserMenu />
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;