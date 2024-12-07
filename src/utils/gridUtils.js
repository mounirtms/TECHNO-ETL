import React from 'react';
import { Chip } from '@mui/material';
import { StatusCell } from '../components/common/BaseGrid';

const isDate = (value) => {
    const date = new Date(value);
    return value && !isNaN(date) && 
        typeof value === 'string' && 
        value.match(/^\d{4}-\d{2}-\d{2}/);
};

const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

const isCurrency = (key, value) => {
    return isNumeric(value) && 
        (key.includes('price') || 
         key.includes('total') || 
         key.includes('amount') ||
         key.includes('cost'));
};

const isBoolean = (value) => {
    return typeof value === 'boolean';
};

const isStatus = (key, value) => {
    return typeof value === 'string' && 
        (key.includes('status') || key.includes('state'));
};

export const STATUS_COLORS = {
    // Order statuses
    processing: 'warning',
    shipped: 'info',
    complete: 'success',
    completed: 'success',
    cancelled: 'error',
    
    // Customer statuses
    active: 'success',
    inactive: 'error',
    subscribed: 'info',
    not_subscribed: 'default',
    
    // Product statuses
    enabled: 'success',
    disabled: 'error',
    in_stock: 'success',
    out_of_stock: 'error',
    
    // Invoice statuses
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    refunded: 'info'
};

export const getStatusColumn = (field = 'status', options = {}) => ({
    field,
    headerName: options.headerName || 'Status',
    width: options.width || 130,
    renderCell: (params) => StatusCell({ value: params.value, statusColors: options.statusColors }),
    filterOptions: options.filterOptions || [],
    ...options
});

export const generateColumns = (firstRecord, childColumns = []) => {
    if (!firstRecord) return childColumns;
    const uniqueColumns = new Set();
    const generatedColumns = [];

    childColumns.forEach(col => uniqueColumns.add(col.field));
    Object.keys(firstRecord).forEach(key => {
     
        const value = firstRecord[key];

        // Skip keys where the value is an array or an object
        if (Array.isArray(value) || typeof value === 'object' || !uniqueColumns.has(key)) {
            return; // Skip this iteration
        }
     
        let baseColumn = {
            field: key,
            hide: true,
            headerName: key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            width: 150,
            filterable: true
        };
 

        if (isDate(value)) {
            baseColumn = {
                ...baseColumn,
                type: 'date',
                valueFormatter: (params) => 
                    format(new Date(params.value), 'PPp')
            };
        }

        if (isCurrency(key, value)) {
            baseColumn = {
                ...baseColumn,
                type: 'number',
                valueFormatter: (params) => 
                    new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD'
                    }).format(params.value)
            };
        }

        if (isNumeric(value)) {
            baseColumn = {
                ...baseColumn,
                type: 'number'
            };
        }

        if (isBoolean(value)) {
            baseColumn = {
                ...baseColumn,
                type: 'boolean',
                width: 120
            };
        }

        if (isStatus(key, value)) {
            baseColumn = {
                ...baseColumn,
                renderCell: (params) => StatusCell({ value: params.value }),
                width: 130
            };
        }

        generatedColumns.push(baseColumn);
    });
  
   
    return  generatedColumns;
};
