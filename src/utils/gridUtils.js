import { format } from 'date-fns';

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

export const generateColumns = (firstRecord, currency = 'DZD') => {
    if (!firstRecord) return [];

    return Object.keys(firstRecord).map(key => {
        const value = firstRecord[key];
        const baseColumn = {
            field: key,
            headerName: key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            width: 150,
            filterable: true
        };

        // Skip complex objects and arrays for default view
        if (typeof value === 'object' && value !== null) {
            return {
                ...baseColumn,
                width: 120,
                renderCell: () => '...',
                filterable: false
            };
        }

        if (isDate(value)) {
            return {
                ...baseColumn,
                type: 'date',
                valueFormatter: (params) => 
                    format(new Date(params.value), 'PPp')
            };
        }

        if (isCurrency(key, value)) {
            return {
                ...baseColumn,
                type: 'number',
                valueFormatter: (params) => 
                    new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: currency
                    }).format(params.value)
            };
        }

        if (isNumeric(value)) {
            return {
                ...baseColumn,
                type: 'number'
            };
        }

        if (isBoolean(value)) {
            return {
                ...baseColumn,
                type: 'boolean',
                width: 120
            };
        }

        if (isStatus(key, value)) {
            return {
                ...baseColumn,
                width: 130
            };
        }

        return baseColumn;
    });
};
