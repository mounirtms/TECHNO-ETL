import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Switch, FormControlLabel, Select, MenuItem,
  FormControl, InputLabel, Button, Alert, Snackbar, Grid, Card,
  CardContent, CardHeader, Divider, Chip, Accordion, AccordionSummary,
  AccordionDetails, TextField, IconButton, Tooltip
} from '@mui/material';
import {
  Settings, GridView, Speed, Visibility, Download, Upload,
  RestoreFromTrash, PlayArrow, Pause, ExpandMore, BugReport,
  Analytics, Memory, Timer
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import UnifiedGrid from '../components/common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../config/gridConfig';
import { createProductionGridConfig } from '../config/productionGridConfig';
import ProfessionalVotingGrid from '../components/grids/ProfessionalVotingGrid';
import VotingGrid from '../components/grids/VotingGrid';

const GridTestPage = () => {
  const theme = useTheme();
  
  // Available grid types for testing
  const gridTypes = {
    mdm: {
      name: 'MDM Products',
      sampleData: [
        { id: 1, sku: 'MDM001', name: 'Sample Product 1', price: 99.99, quantity: 50, status: 'active' },
        { id: 2, sku: 'MDM002', name: 'Sample Product 2', price: 149.99, quantity: 25, status: 'inactive' },
        { id: 3, sku: 'MDM003', name: 'Sample Product 3', price: 199.99, quantity: 75, status: 'active' }
      ],
      columns: [
        { field: 'sku', headerName: 'SKU', width: 150 },
        { field: 'name', headerName: 'Product Name', width: 200 },
        { field: 'price', headerName: 'Price', width: 120, type: 'number' },
        { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number' },
        { field: 'status', headerName: 'Status', width: 100 }
      ]
    },
    magentoProducts: {
      name: 'Magento Products',
      sampleData: [
        { id: 1, sku: 'MAG001', name: 'Magento Product 1', price: 79.99, stock: 100, type: 'simple' },
        { id: 2, sku: 'MAG002', name: 'Magento Product 2', price: 129.99, stock: 50, type: 'configurable' },
        { id: 3, sku: 'MAG003', name: 'Magento Product 3', price: 59.99, stock: 200, type: 'simple' }
      ],
      columns: [
        { field: 'sku', headerName: 'SKU', width: 150 },
        { field: 'name', headerName: 'Product Name', width: 250 },
        { field: 'price', headerName: 'Price', width: 120, type: 'number' },
        { field: 'stock', headerName: 'Stock', width: 100, type: 'number' },
        { field: 'type', headerName: 'Type', width: 120 }
      ]
    },
    customers: {
      name: 'Customers',
      sampleData: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', orders: 5, totalSpent: 499.99 },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', orders: 3, totalSpent: 299.99 },
        { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', orders: 8, totalSpent: 799.99 }
      ],
      columns: [
        { field: 'firstName', headerName: 'First Name', width: 150 },
        { field: 'lastName', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'orders', headerName: 'Orders', width: 100, type: 'number' },
        { field: 'totalSpent', headerName: 'Total Spent', width: 120, type: 'number' }
      ]
    },
    orders: {
      name: 'Orders',
      sampleData: [
        { id: 1, incrementId: 'ORD001', status: 'complete', customerName: 'John Doe', grandTotal: 199.99, items: 3 },
        { id: 2, incrementId: 'ORD002', status: 'pending', customerName: 'Jane Smith', grandTotal: 149.99, items: 2 },
        { id: 3, incrementId: 'ORD003', status: 'processing', customerName: 'Bob Johnson', grandTotal: 299.99, items: 5 }
      ],
      columns: [
        { field: 'incrementId', headerName: 'Order #', width: 120 },
        { field: 'status', headerName: 'Status', width: 120 },
        { field: 'customerName', headerName: 'Customer', width: 180 },
        { field: 'grandTotal', headerName: 'Total', width: 120, type: 'number' },
        { field: 'items', headerName: 'Items', width: 80, type: 'number' }
      ]
    }
  };

  // Test configuration state
  const [selectedGridType, setSelectedGridType] = useState('mdm');
  const [gridConfig, setGridConfig] = useState({
    showStatsCards: false,
    enableVirtualization: true,
    enableSearch: true,
    enableToolbar: true,
    enablePagination: true,
    enableSelection: true,
    enableStats: false,
    pageSize: 25,
    density: 'standard'
  });

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    dataLoadTime: 0,
    totalOperations: 0,
    memoryUsage: 0
  });

  // Test state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Handle configuration changes
  const handleConfigChange = useCallback((key, value) => {
    setGridConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Export configuration
  const handleExportConfig = useCallback(() => {
    try {
      const config = {
        gridType: selectedGridType,
        configuration: gridConfig,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grid-config-${selectedGridType}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Export failed:', error);
      setShowError(true);
    }
  }, [selectedGridType, gridConfig]);

  // Import configuration
  const handleImportConfig = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.gridType && config.configuration) {
          setSelectedGridType(config.gridType);
          setGridConfig(config.configuration);
          setShowSuccess(true);
        } else {
          throw new Error('Invalid configuration format');
        }
      } catch (error) {
        console.error('Import failed:', error);
        setShowError(true);
      }
    };
    reader.readAsText(file);
  }, []);

  // Reset to defaults
  const handleResetDefaults = useCallback(() => {
    setGridConfig({
      showStatsCards: false,
      enableVirtualization: true,
      enableSearch: true,
      enableToolbar: true,
      enablePagination: true,
      enableSelection: true,
      enableStats: false,
      pageSize: 25,
      density: 'standard'
    });
  }, []);

  // Run performance test
  const handleRunPerformanceTest = useCallback(async () => {
    setIsRunningTest(true);
    const startTime = performance.now();
    
    try {
      // Simulate performance testing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const newMetrics = {
        renderTime: renderTime.toFixed(2),
        dataLoadTime: (Math.random() * 100).toFixed(2),
        totalOperations: performanceMetrics.totalOperations + 1,
        memoryUsage: (Math.random() * 50 + 10).toFixed(2)
      };
      
      setPerformanceMetrics(newMetrics);
      
      const testResult = {
        timestamp: new Date().toISOString(),
        gridType: selectedGridType,
        config: { ...gridConfig },
        metrics: newMetrics,
        status: 'success'
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Performance test failed:', error);
      setShowError(true);
    } finally {
      setIsRunningTest(false);
    }
  }, [selectedGridType, gridConfig, performanceMetrics.totalOperations]);

  // Get current grid data and columns
  const currentGridData = gridTypes[selectedGridType];
  const productionConfig = createProductionGridConfig(selectedGridType, {
    features: gridConfig,
    performance: {
      DEFAULT_PAGE_SIZE: gridConfig.pageSize
    }
  });

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Grid Testing System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test and configure grid components with real-time preview
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings />
                  <Typography variant="h6">Grid Configuration</Typography>
                </Box>
              }
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Export Config">
                    <IconButton onClick={handleExportConfig} size="small">
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Import Config">
                    <IconButton component="label" size="small">
                      <Upload />
                      <input
                        type="file"
                        accept=".json"
                        hidden
                        onChange={handleImportConfig}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset to Defaults">
                    <IconButton onClick={handleResetDefaults} size="small">
                      <RestoreFromTrash />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <CardContent>
              {/* Grid Type Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Grid Type</InputLabel>
                <Select
                  value={selectedGridType}
                  onChange={(e) => setSelectedGridType(e.target.value)}
                  label="Grid Type"
                >
                  {Object.entries(gridTypes).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GridView fontSize="small" />
                        {config.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Configuration Options */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Grid Features
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.showStatsCards}
                          onChange={(e) => handleConfigChange('showStatsCards', e.target.checked)}
                        />
                      }
                      label="Show Stats Cards"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.enableVirtualization}
                          onChange={(e) => handleConfigChange('enableVirtualization', e.target.checked)}
                        />
                      }
                      label="Enable Virtualization"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.enableSearch}
                          onChange={(e) => handleConfigChange('enableSearch', e.target.checked)}
                        />
                      }
                      label="Enable Search"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.enableToolbar}
                          onChange={(e) => handleConfigChange('enableToolbar', e.target.checked)}
                        />
                      }
                      label="Enable Toolbar"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.enablePagination}
                          onChange={(e) => handleConfigChange('enablePagination', e.target.checked)}
                        />
                      }
                      label="Enable Pagination"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={gridConfig.enableSelection}
                          onChange={(e) => handleConfigChange('enableSelection', e.target.checked)}
                        />
                      }
                      label="Enable Selection"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Performance Settings */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Performance Settings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Page Size"
                      type="number"
                      value={gridConfig.pageSize}
                      onChange={(e) => handleConfigChange('pageSize', parseInt(e.target.value) || 25)}
                      size="small"
                    />
                    <FormControl size="small">
                      <InputLabel>Density</InputLabel>
                      <Select
                        value={gridConfig.density}
                        onChange={(e) => handleConfigChange('density', e.target.value)}
                        label="Density"
                      >
                        <MenuItem value="compact">Compact</MenuItem>
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="comfortable">Comfortable</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Performance Testing */}
              <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  variant="contained"
                  startIcon={isRunningTest ? <Pause /> : <PlayArrow />}
                  onClick={handleRunPerformanceTest}
                  disabled={isRunningTest}
                  fullWidth
                >
                  {isRunningTest ? 'Running Test...' : 'Run Performance Test'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card sx={{ mt: 2 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics />
                  <Typography variant="h6">Performance Metrics</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {performanceMetrics.renderTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Render Time (ms)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {performanceMetrics.memoryUsage}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Memory (MB)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {performanceMetrics.totalOperations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Tests
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {performanceMetrics.dataLoadTime}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Load Time (ms)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Grid Preview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 'calc(100vh - 200px)' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GridView />
                  <Typography variant="h6">
                    {currentGridData.name} Preview
                  </Typography>
                  <Chip 
                    label={selectedGridType.toUpperCase()} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
              }
            />
            <CardContent sx={{ height: 'calc(100% - 80px)', p: 1 }}>
              <UnifiedGrid
                {...getStandardGridProps(selectedGridType, {
                  data: currentGridData.sampleData,
                  columns: currentGridData.columns,
                  gridName: `Test${selectedGridType}Grid`,
                  loading: isRunningTest,
                  totalCount: currentGridData.sampleData.length,

                  // Configuration from test panel
                  enableStats: gridConfig.showStatsCards,
                  enableToolbar: gridConfig.enableToolbar,
                  enablePagination: gridConfig.enablePagination,
                  enableSelection: gridConfig.enableSelection,

                  // Custom configuration
                  customConfig: {
                    features: {
                      enableVirtualization: gridConfig.enableVirtualization,
                      enableSearch: gridConfig.enableSearch
                    },
                    performance: {
                      DEFAULT_PAGE_SIZE: gridConfig.pageSize
                    },
                    theme: {
                      density: gridConfig.density
                    }
                  },

                  // Event handlers for testing
                  onRowClick: (params) => console.log('Row clicked:', params),
                  onSelectionChange: (selection) => console.log('Selection changed:', selection),
                  onSortChange: (sort) => console.log('Sort changed:', sort),
                  onFilterChange: (filter) => console.log('Filter changed:', filter),
                  onRefresh: () => console.log('Refresh triggered')
                })}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Notifications */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Operation completed successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Operation failed. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GridTestPage;
