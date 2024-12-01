import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';




import LocationOnIcon from '@mui/icons-material/LocationOn'; // 








export const DRAWER_WIDTH = 240;
export const COLLAPSED_WIDTH = 64;
/**
 * Menu Items Configuration
 * 
 * Defines the main navigation items for the admin dashboard
 */
export const MENU_ITEMS = [
    {
        id: 'Dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        path: '/dashboard'
    },
    {
        id: 'ProductsGrid',
        label: 'Products',
        icon: InventoryIcon,
        path: '/products'
    },
    {
        id: 'CustomersGrid',
        label: 'Customers',
        icon: PeopleIcon,
        path: '/customers'
    },
    {
        id: 'OrdersGrid',
        label: 'Orders',
        icon: ShoppingCartIcon,
        path: '/orders'
    },
    {
        id: 'InvoicesGrid',
        label: 'Invoices',
        icon: ReceiptIcon,
        path: '/invoices'
    },
    {
        id: 'CategoryTree',
        label: 'Categories',
        icon: CategoryIcon,
        path: '/categories'
    },
    { id: 'stocks', label: 'Stocks', icon: InventoryIcon, path: '/stocks' },
    { id: 'sources', label: 'Sources', icon: LocationOnIcon, path: '/sources' }
];