#!/usr/bin/env node

/**
 * Runtime Error Fix Script for TECHNO-ETL
 * Fixes common runtime issues that prevent pages from loading
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting runtime error fixes...');

// Fix 1: Ensure all dynamic imports have proper error handling
const fixDynamicImports = () => {
  console.log('📦 Fixing dynamic imports...');
  
  const routerPath = 'src/router/EnhancedRouter.jsx';
  if (fs.existsSync(routerPath)) {
    let content = fs.readFileSync(routerPath, 'utf8');
    
    // Add error handling to lazy imports
    const lazyImports = [
      'const Dashboard = lazy(() => import(\'../pages/Dashboard\'));',
      'const ChartsPage = lazy(() => import(\'../pages/ChartsPage\'));',
      'const ProductManagementPage = lazy(() => import(\'../pages/ProductManagementPage\'));',
      'const TaskPage = lazy(() => import(\'../pages/VotingPage\'));',
      'const InventoryPage = lazy(() => import(\'../pages/InventoryPage\'));',
      'const OrdersPage = lazy(() => import(\'../pages/OrdersPage\'));',
      'const CustomersPage = lazy(() => import(\'../pages/CustomersPage\'));',
      'const SettingsPage = lazy(() => import(\'../pages/SettingsPage\'));',
      'const ReportsPage = lazy(() => import(\'../pages/ReportsPage\'));',
      'const AnalyticsPage = lazy(() => import(\'../pages/AnalyticsPage\'));',
      'const NotFoundPage = lazy(() => import(\'../pages/NotFoundPage\'));',
      'const GridTestPage = lazy(() => import(\'../pages/GridTestPage\'));',
      'const DataGridsPage = lazy(() => import(\'../pages/DataGridsPage\'));'
    ];
    
    const fixedImports = [
      'const Dashboard = lazy(() => import(\'../pages/Dashboard\').catch(() => ({ default: () => <div>Dashboard loading error</div> })));',
      'const ChartsPage = lazy(() => import(\'../pages/ChartsPage\').catch(() => ({ default: () => <div>Charts loading error</div> })));',
      'const ProductManagementPage = lazy(() => import(\'../pages/ProductManagementPage\').catch(() => ({ default: () => <div>Products loading error</div> })));',
      'const TaskPage = lazy(() => import(\'../pages/VotingPage\').catch(() => ({ default: () => <div>Tasks loading error</div> })));',
      'const InventoryPage = lazy(() => import(\'../pages/InventoryPage\').catch(() => ({ default: () => <div>Inventory loading error</div> })));',
      'const OrdersPage = lazy(() => import(\'../pages/OrdersPage\').catch(() => ({ default: () => <div>Orders loading error</div> })));',
      'const CustomersPage = lazy(() => import(\'../pages/CustomersPage\').catch(() => ({ default: () => <div>Customers loading error</div> })));',
      'const SettingsPage = lazy(() => import(\'../pages/SettingsPage\').catch(() => ({ default: () => <div>Settings loading error</div> })));',
      'const ReportsPage = lazy(() => import(\'../pages/ReportsPage\').catch(() => ({ default: () => <div>Reports loading error</div> })));',
      'const AnalyticsPage = lazy(() => import(\'../pages/AnalyticsPage\').catch(() => ({ default: () => <div>Analytics loading error</div> })));',
      'const NotFoundPage = lazy(() => import(\'../pages/NotFoundPage\').catch(() => ({ default: () => <div>Page not found</div> })));',
      'const GridTestPage = lazy(() => import(\'../pages/GridTestPage\').catch(() => ({ default: () => <div>Grid test loading error</div> })));',
      'const DataGridsPage = lazy(() => import(\'../pages/DataGridsPage\').catch(() => ({ default: () => <div>Data grids loading error</div> })));'
    ];
    
    lazyImports.forEach((oldImport, index) => {
      content = content.replace(oldImport, fixedImports[index]);
    });
    
    fs.writeFileSync(routerPath, content);
    console.log('✅ Fixed dynamic imports in router');
  }
};

// Fix 2: Fix AuthContext require statements
const fixAuthContext = () => {
  console.log('🔐 Fixing AuthContext...');
  
  const authPath = 'src/contexts/AuthContext.jsx';
  if (fs.existsSync(authPath)) {
    let content = fs.readFileSync(authPath, 'utf8');
    
    // Replace require with dynamic import
    content = content.replace(
      /const { saveUserSettings } = require\('\.\.\/utils\/unifiedSettingsManager'\);/g,
      'const { saveUserSettings } = await import(\'../utils/unifiedSettingsManager\');'
    );
    
    fs.writeFileSync(authPath, content);
    console.log('✅ Fixed AuthContext require statements');
  }
};

// Fix 3: Ensure all pages have proper default exports
const fixPageExports = () => {
  console.log('📄 Checking page exports...');
  
  const pagesDir = 'src/pages';
  const pages = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx'));
  
  pages.forEach(page => {
    const pagePath = path.join(pagesDir, page);
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check if page has default export
    if (!content.includes('export default')) {
      console.log(`⚠️  ${page} missing default export`);
    } else {
      console.log(`✅ ${page} has default export`);
    }
  });
};

// Fix 4: Create a simple error fallback component
const createErrorFallback = () => {
  console.log('🛡️  Creating error fallback component...');
  
  const fallbackPath = 'src/components/common/ErrorFallback.jsx';
  const fallbackDir = path.dirname(fallbackPath);
  
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  
  const fallbackContent = `import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const ErrorFallback = ({ error, resetError, componentName = 'Component' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        p: 3,
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        {componentName} Error
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {error?.message || 'Something went wrong loading this component.'}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => window.location.reload()}
        sx={{ mt: 1 }}
      >
        Refresh Page
      </Button>
    </Box>
  );
};

export default ErrorFallback;`;
  
  fs.writeFileSync(fallbackPath, fallbackContent);
  console.log('✅ Created error fallback component');
};

// Fix 5: Update vite config for better error handling
const fixViteConfig = () => {
  console.log('⚡ Checking Vite config...');
  
  const viteConfigPath = 'vite.config.js';
  if (fs.existsSync(viteConfigPath)) {
    let content = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Ensure proper error handling in build
    if (!content.includes('onwarn')) {
      const buildSection = content.match(/build:\s*{[^}]*}/);
      if (buildSection) {
        const newBuildSection = buildSection[0].replace(
          /build:\s*{/,
          `build: {
        onwarn(warning, warn) {
          // Suppress certain warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'SOURCEMAP_ERROR') return;
          warn(warning);
        },`
        );
        content = content.replace(buildSection[0], newBuildSection);
        fs.writeFileSync(viteConfigPath, content);
        console.log('✅ Updated Vite config for better error handling');
      }
    }
  }
};

// Fix 6: Clear problematic cache
const clearCache = () => {
  console.log('🧹 Clearing cache...');
  
  const cacheDirs = [
    'node_modules/.vite',
    'dist',
    '.vite'
  ];
  
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Cleared ${dir}`);
    }
  });
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 TECHNO-ETL Runtime Error Fix');
    console.log('================================');
    
    fixAuthContext();
    fixDynamicImports();
    fixPageExports();
    createErrorFallback();
    fixViteConfig();
    clearCache();
    
    console.log('');
    console.log('✅ All fixes applied successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart the development server: npm run dev');
    console.log('2. Clear browser cache and refresh');
    console.log('3. Check browser console for any remaining errors');
    
  } catch (error) {
    console.error('❌ Fix script failed:', error);
    process.exit(1);
  }
};

main();