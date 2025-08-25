import React, { memo } from 'react';
import { format } from 'date-fns';
import { Chip } from '@mui/material';
import { StatusCell } from '../components/common/StatusCell';
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';

// Row Number Column
export const rowNumberColumn = {
    field: 'rowNumber',
    headerName: '#',
    disableColumnMenu: true,
    width: 30,
    sortable: false,
    filterable: false,
    pinned: 'left'
};


// Constants
export const CURRENCY = 'DZD';
export const LOCALE = 'fr-DZ';
export const DATE_FORMAT = 'PPp';

// Custom Order statuses
export const STATUS_COLORS = {
    // Custom Order statuses
    'processing': 'info',
    'Commande_a_livrer': 'info',
    'pending': 'warning',
    'Commande_a_recuperer': 'warning',
    'completed': 'success',
    'canceled': 'error',
    'closed': 'default',
    'fraud': 'error',
    'Conf_CMD_1': 'warning',
    'Commande_en_livraison_prestataire': 'info',
    'Livraison_Confirmee': 'success',
    'CMD_Done': 'success',

    // Other existing statuses remain unchanged
    shipped: 'info',
    active: 'success',
    inactive: 'error',
    subscribed: 'info',
    not_subscribed: 'default',
    enabled: 'success',
    disabled: 'error',
    in_stock: 'success',
    out_of_stock: 'error',
    paid: 'success',
    overdue: 'error',
    refunded: 'info',
    true: 'success',
    false: 'error'
};

// Custom Order Statuses
export const ORDER_STATUSES = [
    { value: 'processing', label: 'Processing' },
    { value: 'Commande_a_livrer', label: 'Order to Deliver' },
    { value: 'pending', label: 'Pending' },
    { value: 'Commande_a_recuperer', label: 'Order to Pickup' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'closed', label: 'Closed' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'Conf_CMD_1', label: 'Confirmation Pending' },
    { value: 'Commande_en_livraison_prestataire', label: 'Delivery in Progress' },
    { value: 'Livraison_Confirmee', label: 'Delivery Confirmed' },
    { value: 'CMD_Done', label: 'Order Completed' }
];

// Status color mapping for custom classes
export const STATUS_CLASSES = {
    'processing': 'inProgress',
    'Commande_a_livrer': 'inProgress',
    'pending': 'pending',
    'Commande_a_recuperer': 'pending',
    'completed': 'delivered',
    'canceled': 'canceled',
    'closed': 'closed',
    'fraud': 'fraud',
    'Conf_CMD_1': 'confirmationPending',
    'Commande_en_livraison_prestataire': 'deliveryInProgress',
    'Livraison_Confirmee': 'deliveryConfirmed',
    'CMD_Done': 'orderCompleted'
};

// Column Type Checks
const isDate = (value: any) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) &&
        typeof value === 'string' &&
        (value.match(/^\d{4}-\d{2}-\d{2}/) ||
            value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
};

const isCurrency = (key: any, value: any) => {
    return isNumeric(value) &&
        (key.includes('price') ||
            key.includes('total') ||
            key.includes('amount') ||
            key.includes('cost') ||
            key.includes('revenue'));
};

const isNumeric = (value: any) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

const isBoolean = (value: any) => {
    return typeof value === 'boolean';
};

const isStatus = (key: any, value as any) => {
    return (typeof value === 'string' || typeof value === 'boolean') &&
        (key.includes('status') ||
            key.includes('state') ||
            key.includes('active') ||
            key.includes('enabled'));
};

// Column Generators
export const getDateColumn = (field: any, options: any = {}) => ({
    field,
    type: 'date',
    valueFormatter: (params: any) =>
        params.value ? format(new Date(params.value), DATE_FORMAT) : '',
    width: 180,
    ...options
});

export const getCurrencyColumn = (field: any, options: any = {}) => ({
    field,
    type: 'number',
    valueFormatter: (params: any) =>
        params.value ? new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: CURRENCY
        }).format(params.value) : '',
    width: 130,
    ...options
});

export const getStatusColumn = (field = 'status', options: any = {}) => ({
    field,
    headerName: options?.headerName || 'Status',
    width: options?.width || 150,
    renderCell: (params: any) => {
        const value = params.value;
        const statusClass = STATUS_CLASSES[value as keyof typeof STATUS_CLASSES] || value;

        return StatusCell({
            value,
            statusColors: options?.statusColors || STATUS_COLORS,
            className: statusClass
        });
    },
    type: 'singleSelect',
    valueOptions: options?.filterOptions || ORDER_STATUSES,
    ...options
});

export const getBooleanColumn = (field: any, options: any = {}) => ({
    field,
    type: 'boolean',
    width: 120,
    renderCell: (params: any) => StatusCell({
        value: params.value ? 'true' : 'false',
        statusColors: STATUS_COLORS
    }),
    ...options
});

export const getTreeColumn = (field: any, options: any = {}) => ({
    field,
    flex: 1,
    renderCell: options?.renderCell,
    ...options
});

// Cache management for grid data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Import all data files statically to avoid dynamic import warnings
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';
import cmsPagesData from '../assets/data/cmsPages.json';
import cmsBlocksData from '../assets/data/cmsBlocks.json';

// Data mapping for static imports
const DATA_MAP = {
    'customers': customersData,
    'products': productsData,
    'orders': ordersData,
    'invoices': invoicesData,
    'category': categoryData,
    'categories': categoryData,
    'cmspages': cmsPagesData,
    'cmsblocks': cmsBlocksData,
    'cms': cmsPagesData
};

export const getLocalData = async (gridName: any) => {
    try {
        const cachedData = localStorage.getItem(`grid_${gridName}_data`);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }
        // Use static imports instead of dynamic imports
        const dataKey = gridName.toLowerCase();
        const data = DATA_MAP[dataKey as keyof typeof DATA_MAP];
        return data || [];
    } catch (error) {
        console.error(`Error getting local data for ${gridName}:`, error);
        return [];
    }
};

export const setLocalData = (gridName: any, data as any) => {
    try {
        localStorage.setItem(`grid_${gridName}_data`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.error(`Error caching data for ${gridName}:`, error);
    }
};

// Default grid columns storage
const defaultGridColumns: any = {};

export const saveDefaultColumns = (gridName: any, columns: any) => {
    defaultGridColumns[gridName] = [...columns];
};

export const getDefaultColumns = (gridName: any) => {
    return defaultGridColumns[gridName] || [];
};

export const resetToDefaultColumns = (gridName as any) => {
    const defaultColumns = getDefaultColumns(gridName);
    saveGridSettings(gridName, defaultColumns);
    return defaultColumns;
};

// Enhanced column processing for existing columns
export const enhanceColumns = (columns: any = [], options: any = {}) => {
    const {
        enableI18n = false,
        translate = (key: any, fallback: any) => fallback,
        enableSorting = true,
        enableFiltering = true
    } = options;

    // Ensure columns is an array
    if (!Array.isArray(columns)) {
        console.warn('enhanceColumns: columns parameter must be an array, received:', typeof columns);
        return [];
    }

    return columns.map((column as any) => {
        if (!column || typeof column !== 'object') {
            console.warn('enhanceColumns: Invalid column object:', column);
            return column;
        }

        const enhancedColumn = { ...column };

        // Apply translations if enabled
        if (enableI18n && translate && column?.headerName) {
            const translationKey = `grid.columns.${column?.field}`;
            enhancedColumn.headerName = translate(translationKey, column?.headerName);
        }

        // Apply sorting and filtering settings
        if (enableSorting !== undefined) {
            enhancedColumn.sortable = enableSorting;
        }
        if (enableFiltering !== undefined) {
            enhancedColumn.filterable = enableFiltering;
        }

        return enhancedColumn;
    });
};

// Enhanced column generation with better type detection
export const generateColumns = (firstRecord: any = {}, childColumns: any = [], gridName?: string) => {
    if (!firstRecord || typeof firstRecord !== 'object') {
        return childColumns;
    }
    // Build autoColumns and objectColumns, but ensure objectColumns override autoColumns for object fields
    const objectFieldSet = new Set(Object.keys(firstRecord).filter(key => typeof firstRecord[key] === 'object' && firstRecord[key] !== null));

    const autoColumns = Object.keys(firstRecord).map(field => {
        // If this is an object field, skip it here (will be handled by objectColumns)
        if (objectFieldSet.has(field)) return null;
        const value = firstRecord[field];
        const baseColumn = {
            field,
            headerName: field.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            width: 150,
            sortable: true,
            filterable: true
        };

        if (isDate(value)) {
            return getDateColumn(field);
        } else if (isCurrency(field, value)) {
            return getCurrencyColumn(field);
        } else if (isStatus(field, value)) {
            return getStatusColumn(field);
        } else if (typeof value === 'boolean') {
            return getBooleanColumn(field);
        }

        return baseColumn;
    }).filter(Boolean);

    // Object columns: always override for object fields
    const objectColumns = Array.from(objectFieldSet).map(key => ({
        field: key,
        headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        width: 120,
        renderCell: (params: any) => {
            const value = params.value;
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
                if (value instanceof Date) {
                    return value.toLocaleString();
                }
                return React.createElement(
                    'button',
                    {
                        style: { color: '#1976d2', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 },
                        onClick: (e as any) => {
                            e.stopPropagation();
                            const dialog = document.createElement('dialog');
                            dialog.style.padding = '20px';
                            dialog.style.maxWidth = '600px';
                            dialog.innerHTML = `<pre style="white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;">${
                                JSON.stringify(value, null, 2)
                            }</pre><button style="margin-top:10px;float:right;">Close</button>`;
                            document.body.appendChild(dialog);
                            const closeBtn = dialog.querySelector('button');
                            if (closeBtn) {
                                closeBtn.onclick = () => { dialog.close(); dialog.remove(); };
                            }
                            dialog.showModal();
                        }
                    },
                    '[View]'
                );
            }
            return String(value);
        }
    }));

    // Filter out null values and merge columns
    const validAutoColumns = autoColumns.filter(col => col !== null);
    const validObjectColumns = objectColumns.filter(col => col !== null);
    const mergedColumns = mergeColumns(childColumns, [...validAutoColumns, ...validObjectColumns]);

    // Save as default columns for this grid
    if (gridName) {
        saveDefaultColumns(gridName, mergedColumns);
    }

    // Ensure we always return an array
    return Array.isArray(mergedColumns) ? mergedColumns : childColumns;
};

// Enhanced column settings management
export const applySavedColumnSettings = async (gridName: any, columns: any) => {
    if (!gridName || !columns || !Array.isArray(columns)) {
        return columns;
    }

    try {
        // Get saved settings from local storage first
        const savedSettingsStr = localStorage.getItem(`grid_${gridName}_settings`);
        if (savedSettingsStr) {
            const savedSettings = JSON.parse(savedSettingsStr);
            return columns.map((column as any) => ({
                ...column,
                hide: !savedSettings[column?.field]?.visible,
                width: savedSettings[column?.field]?.width || column?.width || 150,
                index: savedSettings[column?.field]?.index || columns.findIndex((col as any) => col?.field === column?.field)
            })).sort((a: any, b as any) => (a.index || 0) - (b.index || 0));
        }

        // If no local storage settings, try to get from database
        const dbSettings = await getGridSettings(gridName);
        if (dbSettings && typeof dbSettings === 'object') {
            return columns.map((column as any) => ({
                ...column,
                hide: !dbSettings[column?.field]?.visible,
                width: dbSettings[column?.field]?.width || column?.width || 150,
                index: dbSettings[column?.field]?.index || columns.findIndex((col as any) => col?.field === column?.field)
            })).sort((a: any, b as any) => (a.index || 0) - (b.index || 0));
        }

        // If no settings found, return original columns with default settings
        return columns.map((column: any, index: number) => ({
            ...column,
            hide: false,
            width: column?.width || 150,
            index
        }));
    } catch (error) {
        console.error('Error applying saved column settings:', error);
        return columns.map((column: any, index: number) => ({
            ...column,
            hide: false,
            width: column?.width || 150,
            index
        }));
    }
};

// Utility function to save column settings specifically
export const saveColumnSettings = async (gridName: any, columns: any) => {
    if (!gridName || !columns || !Array.isArray(columns)) return false;

    try {
        // Save to local storage
        localStorage.setItem(`${gridName}-columns`, JSON.stringify(columns));

        // Save to database if available
        if (typeof database !== 'undefined') {
            const settingsRef = ref(database, `gridSettings/${gridName}/columns`);
            await set(settingsRef, columns);
        }

        return true;
    } catch (error) {
        console.error('Error saving column settings:', error);
        return false;
    }
};

// Utility function to save grid settings
export const saveGridSettings = async (gridName: any, settings as any) => {
    if (!gridName || !settings) return;

    try {
        // Save to local storage
        localStorage.setItem(`grid_${gridName}_settings`, JSON.stringify(settings));

        // Save to database
        const settingsRef = ref(database, `gridSettings/${gridName}`);
        await set(settingsRef, settings);

        return true;
    } catch (error) {
        console.error('Error saving grid settings:', error);
        return false;
    }
};

// Utility function to get grid settings
export const getGridSettings = async (gridName as any) => {
    try {
        // First try to get from localStorage
        const localSettings = localStorage.getItem(`${gridName}-columns`);
        if (localSettings) {
            return JSON.parse(localSettings);
        }

        // If not in localStorage, try Firebase
        const settingsRef = ref(database, `gridSettings/${gridName}`);
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
            const settings = snapshot.val();
            // Cache in localStorage for future use
            localStorage.setItem(`${gridName}-columns`, JSON.stringify(settings));
            return settings;
        }
    } catch (error) {
        console.error('Error retrieving grid settings:', error);
    }
    return null;
};

// Merging dynamic columns with user columns
export const mergeColumns = (userColumns: any, dynamicColumns as any) => {
    const columnMap = new Map();

    // Ensure userColumns and dynamicColumns are arrays
    const safeUserColumns = Array.isArray(userColumns) ? userColumns : [];
    const safeDynamicColumns = Array.isArray(dynamicColumns) ? dynamicColumns : [];

    // Add user columns to the column map
    safeUserColumns.forEach((col as any) => {
        if (col && col?.field) {
            columnMap.set(col?.field, { ...col, hide: false });
        }
    });

    // Add dynamic columns if they don't exist in user columns
    safeDynamicColumns.forEach((col as any) => {
        if (!columnMap.has(col?.field)) {
            columnMap.set(col?.field, { ...col, hide: true });  // Set hide: true for dynamic columns by default
        }
    });

    return Array.from(columnMap.values());
};
