import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DescriptionIcon from '@mui/icons-material/Description';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import LicenseIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DataObjectIcon from '@mui/icons-material/DataObject';

export const MENU_TREE = [
    // === CORE DASHBOARD ===
    {
        id: 'core',
        label: 'Dashboard',
        labelKey: 'navigation.core',
        icon: DashboardIcon,
        licensed: true,
        expanded: true,
        children: [
            {
                id: 'Dashboard',
                label: 'Dashboard',
                labelKey: 'navigation.dashboard',
                icon: DashboardIcon,
                path: '/dashboard',
                hidden: false,
                licensed: true,
                category: 'core'
            },
            {
                id: 'Charts',
                label: 'Analytics & Charts',
                labelKey: 'navigation.analytics',
                icon: AnalyticsIcon,
                path: '/charts',
                hidden: false,
                licensed: true,
                category: 'core'
            }
        ]
    },

    // === MDM SYSTEM ===
    {
        id: 'mdm',
        label: 'MDM',
        labelKey: 'navigation.mdm',
        icon: DataObjectIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'MDMProductsGrid',
                label: 'MDM Products',
                labelKey: 'navigation.mdmProducts',
                icon: InventoryIcon,
                path: '/mdmproducts',
                hidden: false,
                licensed: true,
                category: 'mdm'
            },
            {
                id: 'MDMStock',
                label: 'MDM Stock',
                labelKey: 'navigation.mdmStock',
                icon: Inventory2Icon,
                path: '/mdm-stock',
                hidden: false,
                licensed: true,
                category: 'mdm'
            },
            {
                id: 'MDMSources',
                label: 'MDM Sources',
                labelKey: 'navigation.mdmSources',
                icon: WarehouseIcon,
                path: '/mdm-sources',
                hidden: false,
                licensed: true,
                category: 'mdm'
            }
        ]
    },

    // === MAGENTO SYSTEM ===
    {
        id: 'magento',
        label: 'Magento',
        labelKey: 'navigation.magento',
        icon: StorefrontIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'ProductsGrid',
                label: 'Products',
                labelKey: 'navigation.products',
                icon: InventoryIcon,
                path: '/products',
                hidden: false,
                licensed: true,
                category: 'products'
            },
            {
                id: 'ProductCatalog',
                label: 'Product Catalog',
                labelKey: 'navigation.productCatalog',
                icon: SettingsIcon,
                path: '/productsManagement',
                hidden: false,
                licensed: true,
                category: 'products'
            },
            {
                id: 'CategoryTree',
                label: 'Categories',
                labelKey: 'navigation.categories',
                icon: CategoryIcon,
                path: '/categories',
                hidden: false,
                licensed: true,
                category: 'products'
            },
            {
                id: 'CategoryManagementGrid',
                label: 'Category Management',
                labelKey: 'navigation.categoryManagement',
                icon: CategoryIcon,
                path: '/category-management',
                hidden: false,
                licensed: true,
                category: 'products'
            },
            {
                id: 'StocksGrid',
                label: 'Inventory & Stocks',
                labelKey: 'navigation.stocks',
                icon: Inventory2Icon,
                path: '/stocks',
                hidden: false,
                licensed: true,
                category: 'inventory'
            },
            {
                id: 'SourcesGrid',
                label: 'Sources & Warehouses',
                labelKey: 'navigation.sources',
                icon: WarehouseIcon,
                path: '/sources',
                hidden: false,
                licensed: true,
                category: 'inventory'
            },
            {
                id: 'OrdersGrid',
                label: 'Orders',
                labelKey: 'navigation.orders',
                icon: ShoppingCartIcon,
                path: '/orders',
                hidden: false,
                licensed: true,
                category: 'sales'
            },
            {
                id: 'InvoicesGrid',
                label: 'Invoices',
                labelKey: 'navigation.invoices',
                icon: ReceiptIcon,
                path: '/invoices',
                hidden: false,
                licensed: true,
                category: 'sales'
            },
            {
                id: 'CustomersGrid',
                label: 'Customers',
                labelKey: 'navigation.customers',
                icon: PeopleIcon,
                path: '/customers',
                hidden: false,
                licensed: true,
                category: 'sales'
            },
            {
                id: 'CmsPageGrid',
                label: 'CMS Pages',
                labelKey: 'navigation.cmsPages',
                icon: DescriptionIcon,
                path: '/cms-pages',
                hidden: false,
                licensed: true,
                category: 'content'
            }
        ]
    },

    // === CEGID SYSTEM ===
    {
        id: 'cegid',
        label: 'CEGID',
        labelKey: 'navigation.cegid',
        icon: DataObjectIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'CegidProductsGrid',
                label: 'Products',
                labelKey: 'navigation.cegidProducts',
                icon: InventoryIcon,
                path: '/cegid-products',
                hidden: false,
                licensed: true,
                category: 'products'
            },
            {
                id: 'MDMStockGrid',
                label: 'MDM Stock',
                labelKey: 'navigation.mdmStock',
                icon: Inventory2Icon,
                path: '/mdm-stock',
                hidden: false,
                licensed: true,
                category: 'inventory'
            }
        ]
    },

    // === ANALYTICS & REPORTS ===
    {
        id: 'analytics',
        label: 'Analytics & Reports',
        labelKey: 'navigation.analyticsReports',
        icon: AnalyticsIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'SalesAnalytics',
                label: 'Sales Analytics',
                labelKey: 'navigation.salesAnalytics',
                icon: AnalyticsIcon,
                path: '/analytics/sales',
                hidden: false,
                licensed: true,
                category: 'analytics'
            },
            {
                id: 'InventoryAnalytics',
                label: 'Inventory Analytics',
                labelKey: 'navigation.inventoryAnalytics',
                icon: Inventory2Icon,
                path: '/analytics/inventory',
                hidden: false,
                licensed: true,
                category: 'analytics'
            }
        ]
    },

    // === SECURITY ===
    {
        id: 'locker',
        label: 'Security',
        labelKey: 'navigation.lockerStudio',
        icon: LockIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'SecureVault',
                label: 'Secure Vault',
                labelKey: 'navigation.secureVault',
                icon: SecurityIcon,
                path: '/locker/vault',
                hidden: false,
                licensed: true,
                category: 'security'
            },
            {
                id: 'AccessControl',
                label: 'Access Control',
                labelKey: 'navigation.accessControl',
                icon: AdminPanelSettingsIcon,
                path: '/locker/access',
                hidden: false,
                licensed: true,
                category: 'security'
            }
        ]
    },

    // === DEVELOPMENT & TESTING ===
    {
        id: 'development',
        label: 'Development & Testing',
        labelKey: 'navigation.development',
        icon: BugReportIcon,
        licensed: true,
        expanded: false,
        children: [
            {
                id: 'BugBounty',
                label: 'Bug Bounty',
                labelKey: 'navigation.bugBounty',
                icon: BugReportIcon,
                path: '/bug-bounty',
                hidden: false,
                licensed: true,
                category: 'quality'
            },
            {
                id: 'Voting',
                label: 'Feature Voting',
                labelKey: 'navigation.voting',
                icon: HowToVoteIcon,
                path: '/voting',
                hidden: false,
                licensed: true,
                category: 'quality'
            },
            {
                id: 'GridTestPage',
                label: 'Grid Testing',
                labelKey: 'navigation.gridTest',
                icon: BugReportIcon,
                path: '/grid-test',
                hidden: false,
                licensed: true,
                category: 'quality'
            }
        ]
    },

    // === USER MANAGEMENT ===
    {
        id: 'user',
        label: 'User',
        labelKey: 'navigation.user',
        icon: PersonIcon,
        licensed: false, // Always accessible
        expanded: false,
        children: [
            {
                id: 'UserProfile',
                label: 'User Profile',
                labelKey: 'navigation.userProfile',
                icon: AccountCircleIcon,
                path: '/profile',
                hidden: false,
                licensed: false, // Always accessible
                category: 'user'
            }
        ]
    },

    // === SYSTEM MANAGEMENT ===
    {
        id: 'system',
        label: 'Management',
        labelKey: 'navigation.system',
        icon: SettingsIcon,
        licensed: false, // Always accessible
        roleRequired: 'super_admin', // Only super admin can access
        expanded: false,
        children: [
            {
                id: 'LicenseManagement',
                label: 'License Management',
                labelKey: 'navigation.licenseManagement',
                icon: LicenseIcon,
                path: '/license-management',
                hidden: false,
                licensed: false, // Always accessible for admins
                category: 'system'
            },
            {
                id: 'LicenseStatus',
                label: 'License Status',
                labelKey: 'navigation.licenseStatus',
                icon: LicenseIcon,
                path: '/license',
                hidden: false,
                licensed: false, // Always accessible to check license
                category: 'system'
            }
        ]
    }
];

// Backward compatibility - flatten tree for legacy components
export const MENU_ITEMS = [];

function flattenTree(items) {
    let result = [];
    items.forEach(item => {
        if (item.children) {
            result = result.concat(item.children);
            result = result.concat(flattenTree(item.children));
        } else if (item.path) {
            result.push(item);
        }
    });
    return result;
}

MENU_ITEMS.push(...flattenTree(MENU_TREE));
