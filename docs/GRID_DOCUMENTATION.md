# Enhanced Grid System Documentation

## Overview

The Enhanced Grid System provides a comprehensive, feature-rich data grid solution with advanced caching, internationalization (i18n), RTL support, and extensive customization options.

## Components

### 1. EnhancedBaseGrid

The main grid component that combines all features into a single, powerful interface.

#### Basic Usage

```jsx
import EnhancedBaseGrid from '../components/grids/EnhancedBaseGrid';

const MyGrid = () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 }
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  return (
    <EnhancedBaseGrid
      gridName="users"
      columns={columns}
      data={data}
      onRefresh={() => console.log('Refreshing...')}
    />
  );
};
```

#### Advanced Configuration

```jsx
const AdvancedGrid = () => {
  return (
    <EnhancedBaseGrid
      gridName="products"
      columns={columns}
      data={data}
      
      // Feature toggles
      enableCache={true}
      enableI18n={true}
      enableRTL={true}
      enableSelection={true}
      
      // Toolbar configuration
      toolbarConfig={{
        showRefresh: true,
        showAdd: true,
        showEdit: true,
        showDelete: true,
        showExport: true,
        showSearch: true,
        showFilters: true,
        showSettings: true
      }}
      
      // Custom actions
      customActions={[
        {
          label: 'Custom Action',
          icon: <CustomIcon />,
          onClick: () => console.log('Custom action'),
          tooltip: 'Perform custom action'
        }
      ]}
      
      // Context menu actions
      contextMenuActions={{
        edit: { enabled: true },
        delete: { enabled: true },
        duplicate: { enabled: true },
        customAction: {
          icon: CustomIcon,
          label: 'Custom Action',
          onClick: (rowData) => console.log('Custom action on row:', rowData)
        }
      }}
      
      // Floating actions
      floatingActions={{
        add: { enabled: true },
        edit: { enabled: (selectedRows) => selectedRows.length === 1 },
        delete: { enabled: (selectedRows) => selectedRows.length > 0 }
      }}
      floatingPosition="bottom-right"
      floatingVariant="speedDial"
      
      // Event handlers
      onAdd={() => console.log('Add new item')}
      onEdit={(rowData) => console.log('Edit item:', rowData)}
      onDelete={(selectedRows) => console.log('Delete items:', selectedRows)}
      onExport={(selectedRows) => console.log('Export items:', selectedRows)}
      onSync={() => console.log('Sync data')}
      onSelectionChange={(selection) => console.log('Selection changed:', selection)}
      onRowDoubleClick={(params) => console.log('Row double clicked:', params)}
    />
  );
};
```

## Toolbar Configuration

The toolbar is divided into logical sections for better organization:

### Section 1: Refresh
- **Refresh Button**: Refreshes the grid data and clears cache

### Section 2: Action Buttons
- **Add**: Creates new items
- **Edit**: Edits selected items
- **Delete**: Deletes selected items
- **Sync**: Synchronizes data
- **Custom Actions**: User-defined actions

### Section 3: Search and Filters
- **Search Field**: Real-time search functionality
- **Filter Toggle**: Shows/hides filter panel

### Section 4: Selection Info
- **Selection Chip**: Shows count of selected items

### Section 5: Settings and More
- **Export/Import**: Data export and import functionality
- **Settings**: Grid configuration options
- **More Menu**: Additional options

### Toolbar Configuration Options

```jsx
const toolbarConfig = {
  // Basic actions
  showRefresh: true,
  showAdd: false,
  showEdit: false,
  showDelete: false,
  
  // Data operations
  showExport: true,
  showImport: false,
  showSync: false,
  
  // UI controls
  showSearch: true,
  showFilters: true,
  showSettings: true,
  showSelection: true
};
```

### Adding Custom Action Buttons

```jsx
const customActions = [
  {
    label: 'Bulk Update',
    icon: <UpdateIcon />,
    onClick: (selectedRows) => {
      // Handle bulk update
      console.log('Bulk updating:', selectedRows);
    },
    tooltip: 'Update selected items',
    variant: 'contained',
    color: 'primary',
    disabled: false
  },
  {
    label: 'Archive',
    icon: <ArchiveIcon />,
    onClick: (selectedRows) => {
      // Handle archive
      console.log('Archiving:', selectedRows);
    },
    tooltip: 'Archive selected items',
    variant: 'outlined',
    color: 'warning',
    disabled: (selectedRows) => selectedRows.length === 0
  }
];
```

## Context Menu Configuration

The context menu provides right-click functionality for grid rows:

### Default Actions
- **Edit**: Edit the selected row
- **Delete**: Delete the selected row
- **Duplicate**: Duplicate the selected row
- **View**: View row details
- **Export**: Export the row data
- **Copy/Cut/Paste**: Clipboard operations

### Custom Context Menu Actions

```jsx
const contextMenuActions = {
  // Override default actions
  edit: { 
    enabled: (rowData) => rowData.status !== 'locked',
    onClick: (rowData, rowId) => {
      console.log('Editing row:', rowData);
    }
  },
  
  // Add custom actions
  approve: {
    icon: CheckIcon,
    label: 'Approve',
    enabled: (rowData) => rowData.status === 'pending',
    onClick: (rowData, rowId) => {
      console.log('Approving:', rowData);
    }
  },
  
  reject: {
    icon: CloseIcon,
    label: 'Reject',
    color: 'error',
    enabled: (rowData) => rowData.status === 'pending',
    onClick: (rowData, rowId) => {
      console.log('Rejecting:', rowData);
    }
  }
};
```

## Floating Action Buttons

Floating action buttons provide quick access to common actions:

### Speed Dial Variant (Default)

```jsx
<EnhancedBaseGrid
  floatingActions={{
    add: { enabled: true },
    edit: { enabled: (selectedRows) => selectedRows.length === 1 },
    delete: { enabled: (selectedRows) => selectedRows.length > 0 },
    export: { enabled: true },
    sync: { enabled: true }
  }}
  floatingPosition="bottom-right"
  floatingVariant="speedDial"
/>
```

### Individual FABs Variant

```jsx
<EnhancedBaseGrid
  floatingActions={{
    add: { enabled: true, priority: 1 },
    refresh: { enabled: true, priority: 2 }
  }}
  floatingPosition="bottom-right"
  floatingVariant="individual"
/>
```

### Custom Floating Actions

```jsx
const floatingActions = {
  customAction: {
    icon: CustomIcon,
    label: 'Custom Action',
    color: 'secondary',
    enabled: true,
    priority: 1,
    onClick: (selectedRows) => {
      console.log('Custom floating action:', selectedRows);
    }
  }
};
```

## Internationalization (i18n)

The grid system supports multiple languages with automatic RTL detection:

### Language Configuration

```jsx
// In your i18n configuration
const resources = {
  en: {
    translation: {
      grid: {
        common: {
          loading: 'Loading...',
          noData: 'No data available',
          refresh: 'Refresh',
          // ... more translations
        },
        toolbar: {
          refresh: 'Refresh Data',
          add: 'Add New',
          edit: 'Edit Selected',
          // ... more translations
        }
      }
    }
  },
  ar: {
    translation: {
      grid: {
        common: {
          loading: 'جاري التحميل...',
          noData: 'لا توجد بيانات متاحة',
          refresh: 'تحديث',
          // ... more translations
        }
      }
    }
  }
};
```

### RTL Support

The grid automatically detects RTL languages and adjusts:
- Layout direction
- Icon positioning
- Menu positioning
- Text alignment

```jsx
<EnhancedBaseGrid
  enableI18n={true}
  enableRTL={true}
  // Grid will automatically detect language direction
/>
```

## Caching System

The grid includes an intelligent caching system:

### Cache Configuration

```jsx
<EnhancedBaseGrid
  enableCache={true}
  gridName="products" // Required for cache identification
/>
```

### Cache Management

```jsx
const gridRef = useRef();

// Clear cache
gridRef.current?.clearCache();

// Invalidate specific cache patterns
gridRef.current?.invalidateCache('products');

// Get cache statistics
const stats = gridRef.current?.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Memory usage:', stats.memoryUsage);
```

## Performance Optimization

### Virtualization

```jsx
<EnhancedBaseGrid
  enableVirtualization={true}
  // Automatically handles large datasets
/>
```

### Lazy Loading

```jsx
const LazyGrid = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = useCallback(async (params) => {
    setLoading(true);
    try {
      const newData = await fetchData(params);
      setData(prev => [...prev, ...newData]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <EnhancedBaseGrid
      data={data}
      loading={loading}
      onPaginationModelChange={handleLoadMore}
    />
  );
};
```

## Event Handlers

### Row Events

```jsx
<EnhancedBaseGrid
  onRowClick={(params, event) => {
    console.log('Row clicked:', params.row);
  }}
  
  onRowDoubleClick={(params, event) => {
    console.log('Row double clicked:', params.row);
    // Default: opens details dialog
  }}
  
  onCellClick={(params, event) => {
    console.log('Cell clicked:', params.field, params.value);
  }}
/>
```

### Selection Events

```jsx
<EnhancedBaseGrid
  onSelectionChange={(selectedRows) => {
    console.log('Selection changed:', selectedRows);
  }}
/>
```

### Data Events

```jsx
<EnhancedBaseGrid
  onRefresh={() => {
    console.log('Refreshing data...');
    // Fetch new data
  }}
  
  onExport={(selectedRows) => {
    console.log('Exporting:', selectedRows);
    // Export logic
  }}
  
  onImport={(file) => {
    console.log('Importing:', file);
    // Import logic
  }}
/>
```

## Best Practices

1. **Always provide a unique gridName** for proper caching and state persistence
2. **Use memoization** for columns and data when possible
3. **Implement proper error handling** with onError prop
4. **Provide meaningful translations** for i18n support
5. **Test with RTL languages** if supporting international users
6. **Monitor cache performance** in production environments
7. **Use virtualization** for large datasets (>1000 rows)
8. **Implement proper loading states** for better UX

## Migration Guide

### From Old BaseGrid

```jsx
// Old BaseGrid
<BaseGrid
  gridName="products"
  columns={columns}
  data={data}
  loading={loading}
  onRefresh={onRefresh}
  toolbarProps={{ canAdd: true, canEdit: true }}
/>

// New EnhancedBaseGrid
<EnhancedBaseGrid
  gridName="products"
  columns={columns}
  data={data}
  loading={loading}
  onRefresh={onRefresh}
  toolbarConfig={{ showAdd: true, showEdit: true }}
  enableCache={true}
  enableI18n={true}
/>
```

## Migration Guide

### From Old BaseGrid to EnhancedBaseGrid

The new EnhancedBaseGrid provides significant improvements while maintaining backward compatibility. Here's how to migrate:

#### 1. Basic Migration

```jsx
// Old BaseGrid
import BaseGrid from '../components/common/BaseGrid';

<BaseGrid
  gridName="products"
  columns={columns}
  data={data}
  loading={loading}
  onRefresh={onRefresh}
  toolbarProps={{ canAdd: true, canEdit: true }}
  onSelectionChange={setSelectedRows}
/>

// New EnhancedBaseGrid
import EnhancedBaseGrid from '../components/grids/EnhancedBaseGrid';

<EnhancedBaseGrid
  gridName="products"
  columns={columns}
  data={data}
  loading={loading}
  onRefresh={onRefresh}
  toolbarConfig={{ showAdd: true, showEdit: true }}
  onSelectionChange={setSelectedRows}
  // New features
  enableCache={true}
  enableI18n={true}
  enableRTL={true}
/>
```

#### 2. Prop Changes

| Old Prop | New Prop | Notes |
|----------|----------|-------|
| `toolbarProps.canAdd` | `toolbarConfig.showAdd` | More descriptive naming |
| `toolbarProps.canEdit` | `toolbarConfig.showEdit` | Consistent with other show* props |
| `toolbarProps.canDelete` | `toolbarConfig.showDelete` | Better organization |
| `childFilterModel` | `filterModel` | Simplified naming |
| `showCardView` | `showCardView` | No change |
| `gridCards` | `gridCards` | No change |

#### 3. New Features Available

```jsx
<EnhancedBaseGrid
  // Caching system
  enableCache={true}

  // Internationalization
  enableI18n={true}
  enableRTL={true}

  // Context menu
  contextMenuActions={{
    edit: { enabled: true },
    delete: { enabled: true },
    customAction: {
      icon: CustomIcon,
      label: 'Custom Action',
      onClick: (rowData) => console.log(rowData)
    }
  }}

  // Floating actions
  floatingActions={{
    add: { enabled: true },
    edit: { enabled: (selectedRows) => selectedRows.length === 1 }
  }}

  // Performance optimization
  enableVirtualization={true}

  // Enhanced toolbar
  customActions={[
    {
      label: 'Bulk Action',
      icon: <BulkIcon />,
      onClick: (selectedRows) => handleBulkAction(selectedRows)
    }
  ]}
/>
```

#### 4. Breaking Changes

1. **Toolbar Configuration**: `toolbarProps` is now `toolbarConfig` with different structure
2. **Event Handlers**: Some event signatures have changed for consistency
3. **Styling**: CSS classes may have changed due to new component structure

#### 5. Step-by-Step Migration

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install react-i18next i18next i18next-browser-languagedetector
   ```

2. **Update Imports**:
   ```jsx
   // Replace
   import BaseGrid from '../components/common/BaseGrid';

   // With
   import EnhancedBaseGrid from '../components/grids/EnhancedBaseGrid';
   ```

3. **Update Props**:
   ```jsx
   // Update toolbar configuration
   const toolbarConfig = {
     showRefresh: true,
     showAdd: canAdd,
     showEdit: canEdit,
     showDelete: canDelete,
     showExport: true,
     showSearch: true,
     showFilters: true,
     showSettings: true
   };
   ```

4. **Add New Features Gradually**:
   ```jsx
   // Start with basic migration
   <EnhancedBaseGrid {...existingProps} />

   // Then add caching
   <EnhancedBaseGrid {...existingProps} enableCache={true} />

   // Then add i18n
   <EnhancedBaseGrid {...existingProps} enableCache={true} enableI18n={true} />

   // Finally add advanced features
   <EnhancedBaseGrid
     {...existingProps}
     enableCache={true}
     enableI18n={true}
     contextMenuActions={contextMenuActions}
     floatingActions={floatingActions}
   />
   ```

5. **Test Thoroughly**: Use the test suite to validate functionality

## Troubleshooting

### Common Issues

1. **Cache not working**: Ensure gridName is provided and unique
2. **Translations not showing**: Check i18n configuration and translation keys
3. **RTL layout issues**: Verify enableRTL is true and language is properly detected
4. **Performance issues**: Enable virtualization for large datasets
5. **Context menu not appearing**: Ensure contextMenuActions are configured

### Debug Mode

```jsx
<EnhancedBaseGrid
  // Enable debug logging
  onError={(error) => console.error('Grid error:', error)}
  // Monitor cache stats
  ref={gridRef}
/>

// Check cache stats
useEffect(() => {
  const stats = gridRef.current?.getCacheStats();
  console.log('Cache stats:', stats);
}, []);
```

### Performance Monitoring

```jsx
const GridWithMonitoring = () => {
  const gridRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = gridRef.current?.getPerformanceMetrics?.();
      if (metrics) {
        console.log('Performance metrics:', metrics);

        // Alert if memory usage is high
        if (metrics.memoryUsageMB > 50) {
          console.warn('High memory usage detected:', metrics.memoryUsageMB, 'MB');
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <EnhancedBaseGrid ref={gridRef} {...props} />;
};
```
