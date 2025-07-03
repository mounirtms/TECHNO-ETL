import React from 'react';
import { format } from 'date-fns';
import { Chip } from '@mui/material';
import { StatusCell } from '../components/common/StatusCell';
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { column } from 'stylis'; 

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
const isDate = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !isNaN(date) &&
        typeof value === 'string' &&
        (value.match(/^\d{4}-\d{2}-\d{2}/) ||
            value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
};

const isCurrency = (key, value) => {
    return isNumeric(value) &&
        (key.includes('price') ||
            key.includes('total') ||
            key.includes('amount') ||
            key.includes('cost') ||
            key.includes('revenue'));
};

const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

const isBoolean = (value) => {
    return typeof value === 'boolean';
};

const isStatus = (key, value) => {
    return (typeof value === 'string' || typeof value === 'boolean') &&
        (key.includes('status') ||
            key.includes('state') ||
            key.includes('active') ||
            key.includes('enabled'));
};

// Column Generators
export const getDateColumn = (field, options = {}) => ({
    field,
    type: 'date',
    valueFormatter: (date) =>
        date ? format(new Date(date), DATE_FORMAT) : '',
    width: 180,
    ...options
});

export const getCurrencyColumn = (field, options = {}) => ({
    field,
    type: 'number',
    valueFormatter: (params) =>
        params.value ? new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: CURRENCY
        }).format(params.value) : '',
    width: 130,
    ...options
});

export const getStatusColumn = (field = 'status', options = {}) => ({
    field,
    headerName: options.headerName || 'Status',
    width: options.width || 150,
    renderCell: (params) => {
        const value = params.value;
        const statusClass = STATUS_CLASSES[value] || value;
        const statusColor = STATUS_COLORS[value] || 'default';

        return StatusCell({
            value,
            statusColors: options.statusColors || STATUS_COLORS,
            className: statusClass
        });
    },
    type: 'singleSelect',
    valueOptions: options.filterOptions || ORDER_STATUSES,
    ...options
});

export const getBooleanColumn = (field, options = {}) => ({
    field,
    type: 'boolean',
    width: 120,
    renderCell: (params) => StatusCell({
        value: params.value ? 'true' : 'false',
        statusColors: STATUS_COLORS
    }),
    ...options
});

export const getTreeColumn = (field, options = {}) => ({
    field,
    flex: 1,
    renderCell: options.renderCell,
    ...options
});

// Cache management for grid data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getLocalData = (gridName) => {
    try {
        const cachedData = localStorage.getItem(`grid_${gridName}_data`);
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data;
            }
        }
        // If cache is expired or not found, return default data from assets
        return require(`../assets/data/${gridName.toLowerCase()}.json`);
    } catch (error) {
        console.error(`Error getting local data for ${gridName}:`, error);
        return [];
    }
};

export const setLocalData = (gridName, data) => {
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
const defaultGridColumns = {};

export const saveDefaultColumns = (gridName, columns) => {
    defaultGridColumns[gridName] = [...columns];
};

export const getDefaultColumns = (gridName) => {
    return defaultGridColumns[gridName] || [];
};

export const resetToDefaultColumns = (gridName) => {
    const defaultColumns = getDefaultColumns(gridName);
    saveGridSettings(gridName, defaultColumns);
    return defaultColumns;
};

// Enhanced column generation with better type detection
export const generateColumns = (firstRecord = {}, childColumns = []) => {
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
        renderCell: (params) => {
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
                        onClick: (e) => {
                            e.stopPropagation();
                            const dialog = document.createElement('dialog');
                            dialog.style.padding = '20px';
                            dialog.style.maxWidth = '600px';
                            dialog.innerHTML = `<pre style="white-space:pre-wrap;word-break:break-all;max-height:60vh;overflow:auto;">${
                                JSON.stringify(value, null, 2)
                            }</pre><button style="margin-top:10px;float:right;">Close</button>`;
                            document.body.appendChild(dialog);
                            const closeBtn = dialog.querySelector('button');
                            closeBtn.onclick = () => { dialog.close(); dialog.remove(); };
                            dialog.showModal();
                        }
                    },
                    '[View]'
                );
            }
            return String(value);
        }
    }));

    // Merge and deduplicate columns, objectColumns take precedence for object fields
    const mergedColumns = mergeColumns(childColumns, [...autoColumns, ...objectColumns]);

    // Save as default columns for this grid
    if (childColumns.length > 0) {
        const gridName = childColumns[0]?.gridName;
        if (gridName) {
            saveDefaultColumns(gridName, mergedColumns);
        }
    }

    return mergedColumns;
};

// Enhanced column settings management
export const applySavedColumnSettings = async (gridName, columns) => {
    if (!gridName || !columns || !Array.isArray(columns)) {
        return columns;
    }

    try {
        // Get saved settings from local storage first
        const savedSettingsStr = localStorage.getItem(`grid_${gridName}_settings`);
        if (savedSettingsStr) {
            const savedSettings = JSON.parse(savedSettingsStr);
            return columns.map(column => ({
                ...column,
                hide: !savedSettings[column.field]?.visible,
                width: savedSettings[column.field]?.width || column.width || 150,
                index: savedSettings[column.field]?.index || columns.findIndex(col => col.field === column.field)
            })).sort((a, b) => (a.index || 0) - (b.index || 0));
        }

        // If no local storage settings, try to get from database
        const dbSettings = await getGridSettings(gridName);
        if (dbSettings && typeof dbSettings === 'object') {
            return columns.map(column => ({
                ...column,
                hide: !dbSettings[column.field]?.visible,
                width: dbSettings[column.field]?.width || column.width || 150,
                index: dbSettings[column.field]?.index || columns.findIndex(col => col.field === column.field)
            })).sort((a, b) => (a.index || 0) - (b.index || 0));
        }

        // If no settings found, return original columns with default settings
        return columns.map((column, index) => ({
            ...column,
            hide: false,
            width: column.width || 150,
            index
        }));
    } catch (error) {
        console.error('Error applying saved column settings:', error);
        return columns.map((column, index) => ({
            ...column,
            hide: false,
            width: column.width || 150,
            index
        }));
    }
};

// Utility function to save grid settings
export const saveGridSettings = async (gridName, settings) => {
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
export const getGridSettings = async (gridName) => {
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
export const mergeColumns = (userColumns, dynamicColumns) => {
    const columnMap = new Map();

    // Add user columns to the column map
    userColumns.forEach(col => {
        columnMap.set(col.field, { ...col, hide: false });
    });

    // Add dynamic columns if they don't exist in user columns
    dynamicColumns.forEach(col => {
        if (!columnMap.has(col.field)) {
            columnMap.set(col.field, { ...col, hide: true });  // Set hide: true for dynamic columns by default
        }
    });

    return Array.from(columnMap.values());
};
