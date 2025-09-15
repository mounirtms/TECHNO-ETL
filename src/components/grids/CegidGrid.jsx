import { useState } from 'react';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';

// Unified Grid System
import UnifiedGrid from '../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../config/gridConfig';

// Cegid Components and Services
import cegidApi from '../../services/cegidService';
const CegidGrid = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useState({ reference: '', store: '218' });

  const handleSearch = async (params = searchParams) => {
    setLoading(true);
    try {
      const results = await cegidApi.searchProducts(params);

      setProducts(results || []); // Ensure we always set an array
      toast.success(`Found ${results?.length || 0} products`);
    } catch (error) {
      console.error('Search failed:', error);
      setProducts([]); // Reset to empty array on error
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    handleSearch();
  };

  const columns = [
    { field: 'reference', headerName: 'Reference', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'price', headerName: 'Price', width: 130 },
    { field: 'store', headerName: 'Store', width: 100 },
  ];

  return (
    <UnifiedGrid
      {...getStandardGridProps('cegid', {
        gridName: 'CegidProducts',
        columns,
        data: products,
        loading,

        // Event handlers
        onRefresh: handleSearch,
        onRowDoubleClick: (params) => {
          console.log('Viewing Cegid product:', params.row);
          toast.info(`Viewing product: ${params.row.reference}`);
        },
        onExport: (selectedRows) => {
          const exportData = selectedRows.length > 0
            ? products.filter(product => selectedRows.includes(product.reference))
            : products;

          console.log('Exporting Cegid products:', exportData);
          toast.success(`Exported ${exportData.length} products`);
        },

        // Configuration
        toolbarConfig: getStandardToolbarConfig('cegid', {
          showSearch: true,
          customSearchFields: [
            {
              name: 'reference',
              label: 'Reference',
              value: searchParams.reference,
              onChange: (value) => setSearchParams(prev => ({ ...prev, reference: value })),
            },
            {
              name: 'store',
              label: 'Store',
              value: searchParams.store,
              onChange: (value) => setSearchParams(prev => ({ ...prev, store: value })),
            },
          ],
          onCustomSearch: handleSearch,
        }),

        // Search configuration
        onSearch: (searchTerm) => {
          console.log('🔍 Cegid Grid Search:', searchTerm);
          // Update search params and trigger search
          setSearchParams(prev => ({ ...prev, reference: searchTerm }));
          handleSearch({ ...searchParams, reference: searchTerm });
        },
        searchableFields: ['reference', 'designation', 'codeBarre'],

        // Floating actions
        floatingActions: {
          export: {
            enabled: true,
            priority: 1,
          },
          refresh: {
            enabled: true,
            priority: 2,
          },
        },

        // Row configuration
        getRowId: (row) => row?.reference || `row-${Math.random()}`,

        // Error handling
        onError: (error) => {
          console.error('Grid Error:', error);
          toast.error('Error loading grid data');
        },
      })}
    />
  );
};

export default CegidGrid;
