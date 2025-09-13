// Icon imports removed - they are now in MenuTree.js

// Drawer (Sidebar) Widths
export const DRAWER_WIDTH = 240;  // Full sidebar width
export const COLLAPSED_WIDTH = 64;  // Collapsed/minimized sidebar width

// Header and Footer Heights
export const HEADER_HEIGHT = 50;
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

// MENU_TREE has been moved to MenuTree.js to avoid duplication
// Import MENU_TREE from './MenuTree' if needed in this file
