import React from 'react';
import { format } from 'date-fns';
import { Chip } from '@mui/material';
import { StatusCell } from '../components/common/BaseGrid';

// Constants
export const CURRENCY = 'DZD';
export const LOCALE = 'fr-DZ';
export const DATE_FORMAT = 'PPp';

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
    valueFormatter: (params) => 
        params.value ? format(new Date(params.value), DATE_FORMAT) : '',
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

// Main Column Generator
export const generateColumns = (firstRecord, childColumns = []) => {
    if (!firstRecord) return childColumns;
    
    const existingFields = new Set(childColumns.map(col => col.field));
    const generatedColumns = [];

    // Process record fields
    Object.entries(firstRecord).forEach(([key, value]) => {
        // Skip if column already exists or value is complex
        if (existingFields.has(key) || 
            Array.isArray(value) || 
            (typeof value === 'object' && value !== null)) {
            return;
        }

        let baseColumn = {
            field: key,
            headerName: key.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            width: 150,
            filterable: true,
            hideable: true,  // Allow column to be hidden/shown
            hide: true      // Hidden by default
        };

        // Apply specific column types
        if (isDate(value)) {
            baseColumn = { 
                ...baseColumn, 
                ...getDateColumn(key),
                hide: true,
                type: 'date'
            };
        } else if (isCurrency(key, value)) {
            baseColumn = { 
                ...baseColumn, 
                ...getCurrencyColumn(key),
                hide: true,
                type: 'money'
            };
        } else if (isBoolean(value)) {
            baseColumn = { 
                ...baseColumn, 
                ...getBooleanColumn(key),
                hide: true,
                type: 'boolean'
            };
        } else if (isStatus(key, value)) {
            baseColumn = { 
                ...baseColumn, 
                ...getStatusColumn(key),
                hide: true,
                type: 'status'
            };
        } else if (isNumeric(value)) {
            baseColumn = { 
                ...baseColumn, 
                type: 'number',
                width: 120,
                hide: true
            };
        }

        generatedColumns.push(baseColumn);
    });

    return generatedColumns;
};

// Helper function to merge and deduplicate columns
export const mergeColumns = (visibleColumns, generatedColumns) => {
    // Create a map of existing columns by field
    const columnMap = new Map(
        visibleColumns.map(col => [col.field, { ...col, hide: false }])
    );
    
    // Add generated columns only if they don't exist
    generatedColumns.forEach(col => {
        if (!columnMap.has(col.field)) {
            columnMap.set(col.field, {
                ...col,
                hide: true,
                hideable: true
            });
        }
    });

    return Array.from(columnMap.values());
};
