import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DescriptionIcon from '@mui/icons-material/Description';
import BugReportIcon from '@mui/icons-material/BugReport';

// Drawer (Sidebar) Widths
export const DRAWER_WIDTH = 240;  // Full sidebar width
export const COLLAPSED_WIDTH = 64;  // Collapsed/minimized sidebar width

// Header and Footer Heights
export const HEADER_HEIGHT = 55;
export const FOOTER_HEIGHT = 26;
export const DASHBOARD_TAB_HEIGHT = 80;
export const STATS_CARD_ZINDEX = 1200;
export const STATS_CARD_HEIGHT = 80;
export const TRANSITION_DURATION = 225;

/**
 * Menu Items Configuration
 * 
 * Defines the main navigation items for the admin dashboard
 */

export const staticPrimaryKeys = {
    OrdersGrid: 'increment_id',
    InvoicesGrid: 'entity_id',
    ProductsGrid: 'sku',
    CustomersGrid: 'id',
    MDMProductsGrid: 'sku',
    CegidProductsGrid: 'sku',
    CategoryGrid: 'id', // Example for CategoryGrid
};

export const MENU_ITEMS = [
    {
        id: 'Dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        path: '/dashboard',
        hidden: false,
        licensed: true
    },
    {
        id: 'ProductsGrid',
        label: 'Products',
        icon: InventoryIcon,
        path: '/products',
        hidden: false,
        licensed: true
    },
    {
        id: 'MDMProductsGrid',
        label: 'MDM Products',
        icon: InventoryIcon,
        path: '/mdmproducts',
        hidden: false,
        licensed: true
    },
    {
        id: 'CegidProductsGrid',
        label: 'Cegid Products',
        icon: StorefrontIcon,
        path: '/cegid-products',
        hidden: false,
        licensed: true
    },
    {
        id: 'CustomersGrid',
        label: 'Customers',
        icon: PeopleIcon,
        path: '/customers',
        hidden: false,
        licensed: true
    },
    {
        id: 'OrdersGrid',
        label: 'Orders',
        icon: ShoppingCartIcon,
        path: '/orders',
        hidden: false,
        licensed: true
    },
    {
        id: 'InvoicesGrid',
        label: 'Invoices',
        icon: ReceiptIcon,
        path: '/invoices',
        hidden: false,
        licensed: true
    },
    {
        id: 'CategoryTree',
        label: 'Categories',
        icon: CategoryIcon,
        path: '/categories',
        hidden: false,
        licensed: true
    },
    {
        id: 'StocksGrid',
        label: 'Stocks',
        icon: Inventory2Icon,
        path: '/stocks',
        hidden: false,
        licensed: true
    },
    {
        id: 'SourcesGrid',
        label: 'Sources',
        icon: WarehouseIcon,
        path: '/sources',
        hidden: false,
        licensed: true
    },
    {
        id: 'UserProfile',
        label: 'User Profile',
        icon: AccountCircleIcon,
        path: '/profile',
        hidden: true,
        licensed: true
    },
    {
        id: 'CmsPageGrid',
        label: 'CMS Pages',
        icon: DescriptionIcon,
        path: '/cms-pages',
        hidden: false,
        licensed: true
    },
    {
        id: 'GridTestPage',
        label: 'Grid Test',
        icon: BugReportIcon,
        path: '/grid-test',
        hidden: false,
        licensed: true
    }
];