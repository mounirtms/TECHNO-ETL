// Currency configuration
export const CURRENCY = {
    code: 'DZD',
    locale: 'ar-DZ'
};

// Date format configuration
export const DATE_FORMAT = {
    locale: 'ar-DZ',
    options: { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
};

// Default grid settings
export const defaultGridSettings = {
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    defaultSort: {
        field: 'created_at',
        sort: 'desc'
    }
};

// Common column definitions
export const commonColumns = {
    createdAt: {
        field: 'created_at',
        headerName: 'Created At',
        width: 180,
        valueFormatter: (params) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleString(DATE_FORMAT.locale, DATE_FORMAT.options);
        }
    },
    updatedAt: {
        field: 'updated_at',
        headerName: 'Updated At',
        width: 180,
        valueFormatter: (params) => {
            if (!params.value) return '';
            return new Date(params.value).toLocaleString(DATE_FORMAT.locale, DATE_FORMAT.options);
        }
    },
    status: {
        field: 'status',
        headerName: 'Status',
        width: 130,
        valueFormatter: (params) => params.value?.toUpperCase() || ''
    },
    price: {
        width: 130,
        type: 'number',
        valueFormatter: (params) => {
            if (typeof params.value !== 'number') return params.value;
            return new Intl.NumberFormat(CURRENCY.locale, {
                style: 'currency',
                currency: CURRENCY.code
            }).format(params.value);
        }
    }
};

// Filter options
export const orderStatusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'complete', label: 'Complete' },
    { value: 'canceled', label: 'Canceled' }
];

export const customerStatusFilters = [
    { value: 'all', label: 'All Customers' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
];

export const productStatusFilters = [
    { value: 'all', label: 'All Products' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
];

// Stats card configurations
export const statsCardConfigs = {
    orders: {
        cards: [
            {
                id: 'total-orders',
                title: 'Total Orders',
                icon: 'ShoppingCart',
                color: 'primary'
            },
            {
                id: 'pending-orders',
                title: 'Pending Orders',
                icon: 'Pending',
                color: 'warning'
            },
            {
                id: 'completed-orders',
                title: 'Completed Orders',
                icon: 'CheckCircle',
                color: 'success'
            },
            {
                id: 'revenue',
                title: 'Total Revenue',
                icon: 'AttachMoney',
                color: 'info',
                format: 'currency'
            }
        ]
    },
    customers: {
        cards: [
            {
                id: 'total-customers',
                title: 'Total Customers',
                icon: 'People',
                color: 'primary'
            },
            {
                id: 'active-customers',
                title: 'Active Customers',
                icon: 'PersonAdd',
                color: 'success'
            },
            {
                id: 'inactive-customers',
                title: 'Inactive Customers',
                icon: 'PersonOff',
                color: 'error'
            },
            {
                id: 'new-customers',
                title: 'New This Month',
                icon: 'TrendingUp',
                color: 'info'
            }
        ]
    },
    products: {
        cards: [
            {
                id: 'total-products',
                title: 'Total Products',
                icon: 'Inventory',
                color: 'primary'
            },
            {
                id: 'in-stock',
                title: 'In Stock',
                icon: 'CheckCircle',
                color: 'success'
            },
            {
                id: 'low-stock',
                title: 'Low Stock',
                icon: 'Warning',
                color: 'warning'
            },
            {
                id: 'out-of-stock',
                title: 'Out of Stock',
                icon: 'Error',
                color: 'error'
            }
        ]
    }
};