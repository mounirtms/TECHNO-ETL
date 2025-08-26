import {
    Dashboard, 
    Inventory, 
    ShoppingCart, 
    People, 
    BarChart, 
    Assessment, 
    HowToVote, 
    Settings, 
    Warehouse, 
    Category, 
    BugReport, 
    Security, 
    Api, 
    Storage
} from '@mui/icons-material';

export const MENU_TREE = [
    {
        id: 'core',
        label: 'Core Modules',
        icon: Dashboard,
        children: [
            { id: 'dashboard', label: 'Dashboard', icon: Dashboard, path: '/dashboard' },
            { id: 'products', label: 'Products', icon: Inventory, path: '/products' },
            { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/orders' },
            { id: 'customers', label: 'Customers', icon: People, path: '/customers' },
        ]
    },
    {
        id: 'system',
        label: 'System & Reports',
        icon: Settings,
        children: [
            { id: 'reports', label: 'Reports', icon: Assessment, path: '/reports' },
            { id: 'charts', label: 'Charts', icon: BarChart, path: '/charts' },
            { id: 'voting', label: 'Voting', icon: HowToVote, path: '/voting' },
            { id: 'bug-bounty', label: 'Bug Bounty', icon: BugReport, path: '/bug-bounty' },
        ]
    },
    {
        id: 'advanced',
        label: 'Advanced',
        icon: Security,
        children: [
            { id: 'license', label: 'License', icon: Security, path: '/license' },
            { id: 'api-settings', label: 'API Settings', icon: Api, path: '/settings/api' },
            { id: 'database', label: 'Database', icon: Storage, path: '/settings/database' },
        ]
    }
];