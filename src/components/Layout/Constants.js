// Icon imports removed - they are now in MenuTree.js

// Drawer (Sidebar) Widths
export const DRAWER_WIDTH = 240;  // Full sidebar width
export const COLLAPSED_WIDTH = 64;  // Collapsed/minimized sidebar width

// Header and Footer Heights
export const HEADER_HEIGHT = 55;
export const FOOTER_HEIGHT = 26;
export const TAB_HEADER_HEIGHT = 48;
export const DASHBOARD_TAB_HEIGHT = 80;
export const STATS_CARD_ZINDEX = 1200;
export const STATS_CARD_HEIGHT = 80;
export const TRANSITION_DURATION = 225;

// Grid Layout Heights - Calculated for perfect fit
export const GRID_CONTAINER_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`;
export const GRID_CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${TAB_HEADER_HEIGHT}px - 16px)`; // 16px for padding
export const DASHBOARD_CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${TAB_HEADER_HEIGHT}px)`;

// Grid specific heights for maximum space utilization
export const MAX_GRID_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px - ${TAB_HEADER_HEIGHT}px - 32px)`; // 32px for container padding

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