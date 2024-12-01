// Layout dimensions
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
export const DRAWER_WIDTH = 240;
export const COLLAPSED_DRAWER_WIDTH = 65;
export const HEADER_HEIGHT = 64;

/// Navigation items
export const MENU_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        component: 'Dashboard',
        path: '/dashboard'
    },
    {
        id: 'products',
        label: 'Products',
        icon: ShoppingCartIcon,
        component: 'ProductsGrid',
        path: '/products'
    },
    {
        id: 'customers',
        label: 'Customers',
        icon: PeopleIcon,
        component: 'CustomersGrid',
        path: '/customers'
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: ReceiptIcon,
        component: 'OrdersGrid',
        path: '/orders'
    },
    {
        id: 'invoices',
        label: 'Invoices',
        icon: LocalShippingIcon,
        component: 'InvoicesGrid',
        path: '/invoices'
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: PersonIcon,
        component: 'Profile',
        path: '/profile'
    }
];
