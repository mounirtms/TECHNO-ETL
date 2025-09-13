# Magento Grid Settings Integration

This document describes the enhanced Magento grid integration with user settings, providing consistent behavior across all Magento grid components.

## Overview

The Magento grid settings integration provides:

- **Settings-aware API calls** - API parameters automatically respect user preferences
- **Consistent error handling** - Unified error handling with user-configured behavior
- **Pagination preferences** - User-defined page sizes and pagination behavior
- **Display density** - Compact, standard, or comfortable grid density
- **Performance optimization** - Virtualization and caching based on user settings
- **Filter persistence** - Save and restore filter states across sessions

## Components

### Core Utilities

#### `magentoGridSettingsManager.js`
Central utility for managing Magento grid settings integration.

```javascript
import {
  getMagentoGridConfig,
  getMagentoApiParams,
  applySettingsToGridProps,
  handleMagentoGridError
} from '../../../utils/magentoGridSettingsManager';

// Get grid configuration with user settings applied
const gridConfig = getMagentoGridConfig('magentoProducts', userSettings);

// Get API parameters with user settings
const apiParams = getMagentoApiParams('magentoProducts', userSettings, {
  currentPage: 1,
  additionalFilters: []
});

// Apply settings to grid props
const enhancedProps = applySettingsToGridProps(baseProps, 'magentoProducts', userSettings);

// Handle errors with user preferences
handleMagentoGridError(error, 'Load Products', userSettings);
```

#### `useMagentoGridSettings.js`
React hook for easy settings integration in grid components.

```javascript
import { useMagentoGridSettings } from '../../../hooks/useMagentoGridSettings';

const MyGrid = () => {
  const {
    paginationSettings,
    densitySettings,
    performanceSettings,
    getApiParams,
    handleError,
    savePreferences
  } = useMagentoGridSettings('magentoProducts', {});

  // Use in API calls
  const fetchData = async () => {
    try {
      const params = getApiParams({ currentPage: 1 });
      const response = await magentoApi.getProductsWithSettings('magentoProducts', params);
      // Handle response...
    } catch (error) {
      handleError(error, 'Load Products');
    }
  };
};
```

### Enhanced Components

#### `MagentoGridSettingsProvider.jsx`
Context provider for consistent settings across Magento grids.

```javascript
import { MagentoGridSettingsProvider } from './MagentoGridSettingsProvider';

const App = () => (
  <MagentoGridSettingsProvider gridType="magentoProducts">
    <ProductsGrid />
  </MagentoGridSettingsProvider>
);
```

#### `MagentoGridErrorBoundary.jsx`
Error boundary with settings-aware error handling.

```javascript
import MagentoGridErrorBoundary from './MagentoGridErrorBoundary';

const GridWrapper = () => (
  <MagentoGridErrorBoundary 
    gridType="magentoProducts"
    userSettings={settings}
    onRetry={handleRetry}
  >
    <ProductsGrid />
  </MagentoGridErrorBoundary>
);
```

## Grid Types

The following grid types are supported:

- `magentoProducts` - Products grid with SKU-based sorting
- `magentoOrders` - Orders grid with date-based sorting
- `magentoCustomers` - Customers grid with creation date sorting
- `magentoInvoices` - Invoices grid with date-based sorting
- `magentoCmsPages` - CMS pages grid with title-based sorting

## Settings Structure

### User Settings Schema

```javascript
{
  preferences: {
    density: 'compact' | 'standard' | 'comfortable',
    theme: 'light' | 'dark' | 'system',
    language: 'en' | 'fr' | 'es' | ...,
    defaultPageSize: number,
    showDetailedErrors: boolean
  },
  performance: {
    enableVirtualization: boolean,
    virtualizationThreshold: number,
    cacheEnabled: boolean,
    autoRefresh: boolean,
    refreshInterval: number
  },
  gridSettings: {
    showStatsCards: boolean,
    persistFilters: boolean,
    [gridType + 'Settings']: {
      pageSize: number,
      sortModel: array,
      filterModel: object,
      columnVisibilityModel: object
    }
  },
  notifications: {
    showErrors: boolean
  },
  apiSettings: {
    magento: {
      timeout: number,
      retryAttempts: number
    }
  }
}
```

### Grid-Specific Defaults

Each grid type has specific default configurations:

```javascript
// Products Grid
{
  pagination: { defaultPageSize: 50 },
  sorting: { defaultSort: { field: 'sku', direction: 'ASC' } }
}

// Orders Grid
{
  pagination: { defaultPageSize: 25 },
  sorting: { defaultSort: { field: 'created_at', direction: 'DESC' } }
}

// Customers Grid
{
  pagination: { defaultPageSize: 25 },
  sorting: { defaultSort: { field: 'created_at', direction: 'DESC' } }
}
```

## API Integration

### Enhanced API Methods

The Magento API service now includes settings-aware methods:

```javascript
// Settings-aware API calls
await magentoApi.getProductsWithSettings('magentoProducts', params);
await magentoApi.getOrdersWithSettings('magentoOrders', params);
await magentoApi.getCustomersWithSettings('magentoCustomers', params);
await magentoApi.getInvoicesWithSettings('magentoInvoices', params);
await magentoApi.getCmsPagesWithSettings('magentoCmsPages', params);

// Generic settings-aware call
await magentoApi.callWithSettings('get', '/endpoint', 'gridType', params, data);
```

### API Settings Propagation

Settings are automatically applied to API calls:

```javascript
// Set global settings for API service
import { setMagentoApiSettings } from '../../../services/magentoApi';

useEffect(() => {
  setMagentoApiSettings(userSettings);
}, [userSettings]);
```

## Error Handling

### Consistent Error Handling

All Magento grids use consistent error handling:

```javascript
try {
  const response = await magentoApi.getProductsWithSettings('magentoProducts', params);
  // Handle success...
} catch (error) {
  handleError(error, 'Load Products'); // Uses user settings for error display
}
```

### Error Configuration

Error handling respects user preferences:

```javascript
{
  showToastErrors: true,        // Show toast notifications
  showDetailedErrors: false,    // Show detailed error messages
  retryOnError: false,          // Automatically retry failed requests
  maxRetries: 3,                // Maximum retry attempts
  retryDelay: 1000             // Delay between retries (ms)
}
```

## Usage Examples

### Basic Grid Implementation

```javascript
import React, { useState, useCallback, useEffect } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import { useMagentoGridSettings } from '../../../hooks/useMagentoGridSettings';
import magentoApi from '../../../services/magentoApi';

const MyMagentoGrid = () => {
  const { settings } = useSettings();
  const {
    paginationSettings,
    getApiParams,
    handleError
  } = useMagentoGridSettings('magentoProducts', {});

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: paginationSettings.defaultPageSize
  });

  // Apply settings to API service
  useEffect(() => {
    import('../../../services/magentoApi').then(({ setMagentoApiSettings }) => {
      setMagentoApiSettings(settings);
    });
  }, [settings]);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const apiParams = getApiParams({
        pageSize: paginationModel.pageSize,
        currentPage: paginationModel.page + 1,
        ...params
      });

      const response = await magentoApi.getProductsWithSettings('magentoProducts', apiParams);
      setData(response.data?.items || []);
    } catch (error) {
      handleError(error, 'Load Products');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, getApiParams, handleError]);

  // ... rest of component
};
```

### Advanced Grid with Error Boundary

```javascript
import MagentoGridErrorBoundary from './MagentoGridErrorBoundary';
import { withMagentoGridSettings } from './MagentoGridSettingsProvider';

const AdvancedGrid = () => {
  // Grid implementation...
};

// Wrap with settings and error boundary
export default withMagentoGridSettings(
  ({ userSettings, ...props }) => (
    <MagentoGridErrorBoundary 
      gridType="magentoProducts"
      userSettings={userSettings}
    >
      <AdvancedGrid {...props} />
    </MagentoGridErrorBoundary>
  ),
  'magentoProducts'
);
```

## Testing

### Unit Tests

```javascript
import { getMagentoGridConfig, getMagentoApiParams } from '../magentoGridSettingsManager';

describe('Magento Grid Settings', () => {
  it('should apply user settings to grid configuration', () => {
    const config = getMagentoGridConfig('magentoProducts', userSettings);
    expect(config.density).toBe(userSettings.preferences.density);
  });

  it('should generate correct API parameters', () => {
    const params = getMagentoApiParams('magentoProducts', userSettings);
    expect(params.pageSize).toBe(userSettings.performance.defaultPageSize);
  });
});
```

### Integration Tests

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsProvider } from '../../../contexts/SettingsContext';
import ProductsGrid from '../ProductsGrid';

describe('ProductsGrid Integration', () => {
  it('should respect user pagination settings', async () => {
    const mockSettings = {
      performance: { defaultPageSize: 50 }
    };

    render(
      <SettingsProvider value={{ settings: mockSettings }}>
        <ProductsGrid />
      </SettingsProvider>
    );

    await waitFor(() => {
      // Verify pagination reflects user settings
    });
  });
});
```

## Migration Guide

### Updating Existing Grids

1. **Add Settings Integration**:
   ```javascript
   import { useMagentoGridSettings } from '../../../hooks/useMagentoGridSettings';
   
   const {
     paginationSettings,
     getApiParams,
     handleError
   } = useMagentoGridSettings('gridType', {});
   ```

2. **Update API Calls**:
   ```javascript
   // Before
   const response = await magentoApi.getProducts(params);
   
   // After
   const apiParams = getApiParams(params);
   const response = await magentoApi.getProductsWithSettings('magentoProducts', apiParams);
   ```

3. **Update Error Handling**:
   ```javascript
   // Before
   catch (error) {
     console.error('Error:', error);
     toast.error('Failed to load data');
   }
   
   // After
   catch (error) {
     handleError(error, 'Load Products');
   }
   ```

4. **Apply Settings to API Service**:
   ```javascript
   useEffect(() => {
     import('../../../services/magentoApi').then(({ setMagentoApiSettings }) => {
       setMagentoApiSettings(settings);
     });
   }, [settings]);
   ```

## Best Practices

1. **Always use settings-aware API methods** for consistent behavior
2. **Apply user settings to API service** in component effects
3. **Use consistent error handling** across all grid components
4. **Respect user preferences** for pagination, density, and display options
5. **Test settings integration** with unit and integration tests
6. **Document grid-specific configurations** for maintainability

## Troubleshooting

### Common Issues

1. **Settings not applied**: Ensure `setMagentoApiSettings` is called with current settings
2. **API errors**: Check that grid type matches available settings configurations
3. **Performance issues**: Verify virtualization settings are properly applied
4. **Filter persistence**: Ensure grid state management includes filter model persistence

### Debug Information

Enable debug logging:

```javascript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Grid Config:', getMagentoGridConfig(gridType, settings));
  console.log('API Params:', getMagentoApiParams(gridType, settings));
}
```