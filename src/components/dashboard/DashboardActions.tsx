/**
 * Dashboard Actions Component
 * Handles sync operations and action buttons for the dashboard
 */

import React, { useState } from 'react';
import {
    Box, Button, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText,
    Divider, Chip, CircularProgress, Alert
} from '@mui/material';
import {
    Refresh, SyncAlt, Settings, BarChart as BarChartIcon,
    PieChart as PieChartIcon, TableChart, ShowChart
} from '@mui/icons-material';
import { toast } from 'react-toastify';

/**
 * Dashboard Actions Component
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Function} props.getPrices - Get prices handler
 * @param {Function} props.syncAllStocks - Sync stocks handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.chartType - Current chart type
 * @param {Function} props.onChartTypeChange - Chart type change handler
 * @param {Object} props.visibleCharts - Visible charts configuration
 * @param {Function} props.onVisibleChartsChange - Visible charts change handler
 * @returns {JSX.Element} Dashboard actions component
 */
const DashboardActions: React.FC<{onRefresh getPrices syncAllStocks loading chartType onChartTypeChange visibleCharts onVisibleChartsChange: any}> = ({ onRefresh,
    getPrices,
    syncAllStocks,
    loading,
    chartType,
    onChartTypeChange,
    visibleCharts,
    onVisibleChartsChange
 }) => {
    const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
    const [syncLoading, setSyncLoading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);

    const handleSettingsClick = (event) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const handleSettingsClose = () => {
        setSettingsAnchorEl(null);
    };

    const handleChartTypeChange = (type) => {
        onChartTypeChange(type);
        handleSettingsClose();
    };

    const handleToggleChart = (chartKey) => {
        onVisibleChartsChange({ ...visibleCharts,
            [chartKey]: !visibleCharts[chartKey]
        });
    };

    const handleSyncPrices = async () => {
        setPriceLoading(true);
        try {
            await getPrices();
            toast.success('✅ Prices synced successfully from MDM');
        } catch(error: any) {
            console.error('Price sync error:', error);
            toast.error('❌ Failed to sync prices: ' + (error.message || 'Unknown error'));
        } finally {
            setPriceLoading(false);
        }
    };

    const handleSyncStocks = async () => {
        setSyncLoading(true);
        try {
            await syncAllStocks();
            toast.success('✅ Stock levels synced successfully from MDM');
        } catch(error: any) {
            console.error('Stock sync error:', error);
            toast.error('❌ Failed to sync stocks: ' + (error.message || 'Unknown error'));
        } finally {
            setSyncLoading(false);
        }
    };

    return Boolean((
        <Box sx={{
            display: "flex",
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
        }}>
            {/* Refresh Button */}
            <Tooltip title="Refresh Dashboard Data">
                <Button
                    variant="body2"
                    startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={onRefresh}
                    disabled={loading}
                    size="small"
            {/* Sync Prices Button */}
            <Tooltip title="Sync Prices from MDM Database">
                <Button
                    variant="body2"
                    startIcon={priceLoading ? <CircularProgress size={16} /> : <SyncAlt />}
                    onClick={handleSyncPrices}
                    disabled={loading || priceLoading}
                    size="small"
            {/* Sync Stocks Button */}
            <Tooltip title="Sync Stock Levels from MDM Database">
                <Button
                    variant="body2"
                    startIcon={syncLoading ? <CircularProgress size={16} /> : <SyncAlt />}
                    onClick={handleSyncStocks}
                    disabled={loading || syncLoading}
                    size="small"
            {/* Settings Menu */}
            <Tooltip title="Dashboard Settings">
                <Button
                    variant="body2"
                    startIcon={<Settings />}
                    onClick={handleSettingsClick}
                    size="small"
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={handleSettingsClose}
                PaperProps
                    sx: { minWidth: 200 }
                }}
            >
                {/* Chart Type Selection */}
                <MenuItem disabled>
                    <ListItemText primary="Chart Type" />
                </MenuItem>
                <MenuItem
                    onClick={() => handleChartTypeChange('line')}
                    selected={chartType === 'line'}
                >
                    <ListItemIcon>
                        <ShowChart />
                    </ListItemIcon>
                    <ListItemText primary="Line Chart" />
                </MenuItem>
                <MenuItem
                    onClick={() => handleChartTypeChange('bar')}
                    selected={chartType === 'bar'}
                >
                    <ListItemIcon>
                        <BarChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Bar Chart" />
                </MenuItem>

                <Divider />

                {/* Visible Charts Toggle */}
                <MenuItem disabled>
                    <ListItemText primary="Visible Charts" />
                </MenuItem>
                <MenuItem onClick={() => handleToggleChart('orders')}>
                    <ListItemIcon>
                        <TableChart />
                    </ListItemIcon>
                    <ListItemText primary="Orders Chart" />
                    <Chip
                        size="small"
                        label={visibleCharts.orders ? 'ON' : 'OFF'}
                        color={visibleCharts.orders ? 'success' : 'default'}
                        variant="body2"
                <MenuItem onClick={() => handleToggleChart('customers')}>
                    <ListItemIcon>
                        <ShowChart />
                    </ListItemIcon>
                    <ListItemText primary="Customers Chart" />
                    <Chip
                        size="small"
                        label={visibleCharts.customers ? 'ON' : 'OFF'}
                        color={visibleCharts.customers ? 'success' : 'default'}
                        variant="body2"
                <MenuItem onClick={() => handleToggleChart('products')}>
                    <ListItemIcon>
                        <PieChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Products Chart" />
                    <Chip
                        size="small"
                        label={visibleCharts.products ? 'ON' : 'OFF'}
                        color={visibleCharts.products ? 'success' : 'default'}
                        variant="body2"
            {/* Status Indicators */}
            {(syncLoading || priceLoading) && (
                <Alert severity="info" sx={{ display: "flex", ml: 2 }}>
                    {syncLoading && 'Syncing stock levels...'}
                    {priceLoading && 'Syncing prices...'}
                </Alert>
            )}
        </Box>
    )))));
};

export default DashboardActions;
