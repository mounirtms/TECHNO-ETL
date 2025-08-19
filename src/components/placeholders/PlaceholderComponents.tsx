import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { 
    Analytics as AnalyticsIcon, 
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Inventory as InventoryIcon,
    Warehouse as WarehouseIcon
} from '@mui/icons-material';

// Generic placeholder component
const PlaceholderComponent = ({ title, description, icon: Icon, color = "primary" }) => (
    <Box p={3}>
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Icon color={color} sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color={color}>
                        {title}
                    </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    This module is currently under development and will be available soon.
                </Alert>
                
                <Typography variant="body1" color="text.secondary">
                    {description}
                </Typography>
                
                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                        Coming Features:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Real-time data visualization
                        • Advanced filtering and search
                        • Export capabilities
                        • Integration with existing systems
                        • User permission management
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    </Box>
);

// Sales Analytics Component
export const SalesAnalytics = () => (
    <PlaceholderComponent
        title="Sales Analytics"
        description="Comprehensive sales analytics dashboard with real-time insights, revenue tracking, and performance metrics."
        icon={AnalyticsIcon}
        color="success"
    />
);

// Inventory Analytics Component
export const InventoryAnalytics = () => (
    <PlaceholderComponent
        title="Inventory Analytics"
        description="Advanced inventory analytics with stock level monitoring, demand forecasting, and optimization recommendations."
        icon={InventoryIcon}
        color="warning"
    />
);

// Secure Vault Component
export const SecureVault = () => (
    <PlaceholderComponent
        title="Secure Vault"
        description="Encrypted document and data storage with advanced security features and access controls."
        icon={SecurityIcon}
        color="error"
    />
);

// Access Control Component
export const AccessControl = () => (
    <PlaceholderComponent
        title="Access Control"
        description="Comprehensive user access management system with role-based permissions and security monitoring."
        icon={AdminIcon}
        color="primary"
    />
);

// MDM Stock Component
export const MDMStock = () => (
    <PlaceholderComponent
        title="MDM Stock Management"
        description="Master Data Management for stock levels across all channels with real-time synchronization."
        icon={InventoryIcon}
        color="info"
    />
);

// MDM Sources Component
export const MDMSources = () => (
    <PlaceholderComponent
        title="MDM Sources"
        description="Master Data Management for data sources and warehouse management with integration capabilities."
        icon={WarehouseIcon}
        color="secondary"
    />
);
