/**
 * Optimized Layout Constants
 * Centralized configuration for consistent layout dimensions
 * Updated to match useLayoutResponsive hook values
 */

// Sidebar/Drawer Dimensions (synchronized with useLayoutResponsive)
export const DRAWER_WIDTH = 280;  // Full sidebar width
export const COLLAPSED_WIDTH = 64;  // Collapsed/minimized sidebar width

// Layout Heights (synchronized with layout system)
export const HEADER_HEIGHT = 64;  // Main header height
export const FOOTER_HEIGHT = 48;  // Footer height
export const TAB_HEIGHT = 48;     // Tab panel header height
export const DASHBOARD_TAB_HEIGHT = 80; // Legacy dashboard tabs

// Z-Index Values
export const STATS_CARD_ZINDEX = 1200;
export const SIDEBAR_ZINDEX = 1200;
export const HEADER_ZINDEX = 1100;
export const FOOTER_ZINDEX = 1000;

// Animation & Transitions
export const TRANSITION_DURATION = 300; // Standard transition duration
export const STATS_CARD_HEIGHT = 80;

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