import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    useMediaQuery
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Components
import Footer from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import UserMenu from '../user/UserMenu';

// Pages
import Dashboard from '../../pages/Dashboard';
import OrdersGrid from '../../pages/OrdersGrid';
import CustomersGrid from '../../pages/CustomersGrid';
import ProductsGrid from '../../pages/ProductsGrid';

// Constants
const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;
const TOPBAR_DESKTOP_HEIGHT = 64;
const TOPBAR_MOBILE_HEIGHT = 56;

// Styled Components
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: DRAWER_WIDTH_COLLAPSED,
        width: `calc(100% - ${DRAWER_WIDTH_COLLAPSED}px)`,
        [theme.breakpoints.up('md')]: {
            marginLeft: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            width: `calc(100% - ${open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px)`,
        },
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
            width: '100%',
        },
    }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        height: TOPBAR_MOBILE_HEIGHT,
        [theme.breakpoints.up('sm')]: {
            height: TOPBAR_DESKTOP_HEIGHT,
        },
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.common.white 
            : theme.palette.grey[900],
        color: theme.palette.text.primary,
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        [theme.breakpoints.up('md')]: {
            marginLeft: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            width: `calc(100% - ${open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED}px)`,
        },
        '& .MuiToolbar-root': {
            minHeight: TOPBAR_MOBILE_HEIGHT,
            [theme.breakpoints.up('sm')]: {
                minHeight: TOPBAR_DESKTOP_HEIGHT,
                padding: theme.spacing(0, 3),
            },
        },
        '& .MuiIconButton-root': {
            color: theme.palette.text.secondary,
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
            },
        },
    }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    minHeight: TOPBAR_MOBILE_HEIGHT,
    [theme.breakpoints.up('sm')]: {
        minHeight: TOPBAR_DESKTOP_HEIGHT,
    },
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: DRAWER_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: DRAWER_WIDTH,
        boxSizing: 'border-box',
        backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[50] 
            : theme.palette.grey[900],
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiListItemButton-root': {
            borderRadius: theme.shape.borderRadius,
            margin: theme.spacing(0.5, 1),
            '&:hover': {
                backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.main}14`,
                color: theme.palette.primary.main,
                '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                },
                '&:hover': {
                    backgroundColor: `${theme.palette.primary.main}1f`,
                },
            },
        },
        '& .MuiListItemIcon-root': {
            color: theme.palette.text.secondary,
            minWidth: 40,
        },
        '& .MuiListItemText-primary': {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
    },
    '&.collapsed': {
        width: DRAWER_WIDTH_COLLAPSED,
        '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH_COLLAPSED,
            overflowX: 'hidden',
            '& .MuiListItemText-root': {
                opacity: 0,
                transition: theme.transitions.create('opacity'),
            },
            '& .MuiListItemIcon-root': {
                minWidth: 0,
                marginLeft: theme.spacing(1),
            },
        },
    },
}));

const Layout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const { currentUser, logout } = useAuth();
    const { translate } = useLanguage();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Auto-collapse drawer on mobile/tablet
    useEffect(() => {
        if (isMobile || isTablet) {
            setOpen(false);
        }
    }, [isMobile, isTablet]);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const menuItems = useMemo(() => [
        {
            id: 'dashboard',
            text: translate('Dashboard'),
            icon: <DashboardIcon />,
            component: <Dashboard />,
            path: '/'
        },
        {
            id: 'orders',
            text: translate('Orders'),
            icon: <ShoppingCartIcon />,
            component: <OrdersGrid />,
            path: '/orders'
        },
        {
            id: 'products',
            text: translate('Products'),
            icon: <InventoryIcon />,
            component: <ProductsGrid />,
            path: '/products'
        },
        {
            id: 'customers',
            text: translate('Customers'),
            icon: <PeopleIcon />,
            component: <CustomersGrid />,
            path: '/customers'
        }
    ], [translate]);

    const handleMenuItemClick = (item) => {
        navigate(item.path);
        if (isMobile) {
            setOpen(false);
        }
    };

    const drawerContent = (
        <>
            <DrawerHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    {(!isMobile || open) && (
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            Magento Admin
                        </Typography>
                    )}
                    <IconButton onClick={handleDrawerToggle}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Box>
            </DrawerHeader>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                            display: 'block',
                        }}
                    >
                        <ListItemButton
                            onClick={() => handleMenuItemClick(item)}
                            selected={location.pathname === item.path}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                sx={{ 
                                    opacity: open ? 1 : 0,
                                    transition: theme.transitions.create('opacity'),
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBarStyled position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ 
                            mr: 2,
                            ...(open && {
                                display: { sm: 'none' },
                            }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 1, sm: 2 }
                    }}>
                        <IconButton 
                            color="inherit"
                            sx={{
                                backgroundColor: theme.palette.mode === 'light' 
                                    ? 'rgba(0,0,0,0.04)' 
                                    : 'rgba(255,255,255,0.04)',
                            }}
                        >
                            <NotificationsIcon />
                        </IconButton>
                        <UserMenu />
                    </Box>
                </Toolbar>
            </AppBarStyled>
            
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { 
                            width: DRAWER_WIDTH,
                            backgroundColor: theme.palette.mode === 'light' 
                                ? theme.palette.grey[50] 
                                : theme.palette.grey[900],
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <StyledDrawer
                    variant="permanent"
                    className={!open ? 'collapsed' : ''}
                    open={open}
                >
                    {drawerContent}
                </StyledDrawer>
            )}

            <Main open={open}>
                <DrawerHeader />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: { xs: 2, sm: 3 },
                        width: '100%',
                        minHeight: `calc(100vh - ${TOPBAR_DESKTOP_HEIGHT}px - 64px)`,
                        backgroundColor: theme.palette.background.default,
                        overflow: 'auto',
                        '& .MuiCard-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                                transform: 'translateY(-2px)'
                            }
                        }
                    }}
                >
                    <Outlet />
                </Box>
                <Footer 
                    sx={{
                        mt: 'auto',
                        py: 2,
                        px: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                        position: 'sticky',
                        bottom: 0,
                        width: '100%',
                        zIndex: 1
                    }} 
                />
            </Main>
        </Box>
    );
};

export default Layout;
