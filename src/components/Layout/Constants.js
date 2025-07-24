import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
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
import SettingsIcon from '@mui/icons-material/Settings';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

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
    ProductCatalog: 'id',
    CustomersGrid: 'id',
    MDMProductsGrid: 'sku',
    CegidProductsGrid: 'sku',
    CategoryGrid: 'id', // Example for CategoryGrid
};

export const MENU_ITEMS = [
    {
        id: 'Dashboard',
        label: 'Dashboard', // Keep for backward compatibility
        labelKey: 'navigation.dashboard',
        icon: DashboardIcon,
        path: '/dashboard',
        hidden: false,
        licensed: true
    },
    {
        id: 'Charts',
        label: 'Analytics & Charts',
        labelKey: 'navigation.analytics',
        icon: AnalyticsIcon,
        path: '/charts',
        hidden: false,
        licensed: true
    },
    {
        id: 'Voting',
        label: 'Feature Voting',
        labelKey: 'navigation.voting',
        icon: HowToVoteIcon,
        path: '/voting',
        hidden: false,
        licensed: true
    },
     {
        id: 'ProductsGrid',
        label: 'Products',
        labelKey: 'navigation.products',
        icon: InventoryIcon,
        path: '/products',
        hidden: false,
        licensed: true
    },
    {
        id: 'ProductCatalog',
        label: 'Products Catalog',
        labelKey: 'navigation.productCatalog',
        icon: SettingsIcon,
        path: '/productsManagement',
        hidden: false,
        licensed: true
    },
    {
        id: 'MDMProductsGrid',
        label: 'MDM Products',
        labelKey: 'navigation.mdmProducts',
        icon: InventoryIcon,
        path: '/mdmproducts',
        hidden: false,
        licensed: true
    },
    {
        id: 'CegidProductsGrid',
        label: 'Cegid Products',
        labelKey: 'navigation.cegidProducts',
        icon: StorefrontIcon,
        path: '/cegid-products',
        hidden: false,
        licensed: true
    },
    {
        id: 'CustomersGrid',
        label: 'Customers',
        labelKey: 'navigation.customers',
        icon: PeopleIcon,
        path: '/customers',
        hidden: false,
        licensed: true
    },
    {
        id: 'OrdersGrid',
        label: 'Orders',
        labelKey: 'navigation.orders',
        icon: ShoppingCartIcon,
        path: '/orders',
        hidden: false,
        licensed: true
    },
    {
        id: 'InvoicesGrid',
        label: 'Invoices',
        labelKey: 'navigation.invoices',
        icon: ReceiptIcon,
        path: '/invoices',
        hidden: false,
        licensed: true
    },
    {
        id: 'CategoryTree',
        label: 'Categories',
        labelKey: 'navigation.categories',
        icon: CategoryIcon,
        path: '/categories',
        hidden: false,
        licensed: true
    },
    {
        id: 'StocksGrid',
        label: 'Stocks',
        labelKey: 'navigation.stocks',
        icon: Inventory2Icon,
        path: '/stocks',
        hidden: false,
        licensed: true
    },
    {
        id: 'SourcesGrid',
        label: 'Sources',
        labelKey: 'navigation.sources',
        icon: WarehouseIcon,
        path: '/sources',
        hidden: false,
        licensed: true
    },
    {
        id: 'UserProfile',
        label: 'User Profile',
        labelKey: 'navigation.userProfile',
        icon: AccountCircleIcon,
        path: '/profile',
        hidden: true,
        licensed: true
    },
    {
        id: 'CmsPageGrid',
        label: 'CMS Pages',
        labelKey: 'navigation.cmsPages',
        icon: DescriptionIcon,
        path: '/cms-pages',
        hidden: false,
        licensed: true
    },
    {
        id: 'GridTestPage',
        label: 'Grid Test',
        labelKey: 'navigation.gridTest',
        icon: BugReportIcon,
        path: '/grid-test',
        hidden: false,
        licensed: true
    }
];