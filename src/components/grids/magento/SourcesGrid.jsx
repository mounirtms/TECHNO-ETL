import React, { useState, useCallback } from 'react';
import UnifiedGrid from '../../common/UnifiedGrid';
import magentoApi from '../../../services/magentoApi';
import { toast } from 'react-toastify';
import {
  getStandardGridProps,
  getStandardToolbarConfig,
  getStandardContextMenuActions,
} from '../../../config/gridConfig';

const columns = [
  {
    field: 'source_code',
    headerName: 'Source Code',
    width: 250,
    flex: 1,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 400,
    flex: 1,
  },
  {
    field: 'enabled',
    headerName: 'Status',
    width: 120,
    valueGetter: (params) => params?.row?.enabled ? 'Enabled' : 'Disabled',
    renderCell: (params) => (
      <div style={{
        color: params?.row?.enabled ? 'green' : 'red',
        fontWeight: 'bold',
      }}>
        {params?.row?.enabled ? 'Enabled' : 'Disabled'}
      </div>
    ),
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 300,
    flex: 1,
  },
  {
    field: 'country_id',
    headerName: 'Country',
    width: 120,
  },
  {
    field: 'city',
    headerName: 'City',
    width: 150,
  },
  {
    field: 'street',
    headerName: 'Street',
    width: 200,
    flex: 1,
  },
  {
    field: 'postcode',
    headerName: 'Postcode',
    width: 120,
  },
  {
    field: 'contact_name',
    headerName: 'Contact Name',
    width: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
  },
  {
    field: 'phone',
    headerName: 'Phone',
    width: 150,
  },
  {
    field: 'latitude',
    headerName: 'Latitude',
    width: 120,
    valueGetter: (params) => params?.row?.latitude ?? 'N/A',
  },
  {
    field: 'longitude',
    headerName: 'Longitude',
    width: 120,
    valueGetter: (params) => params?.row?.longitude ?? 'N/A',
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 100,
    type: 'number',
  },
];

const SourcesGrid = ({ productId }) => {
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null); // Store error message

  const handleRefresh = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null); // Reset error on new request

      const searchCriteria = {
        filterGroups: [],
        pageSize: params?.pageSize ?? 10, // Default to 10 if undefined
        currentPage: params?.page ? params.page + 1 : 1,
      };

      if (productId) {
        searchCriteria.filterGroups.push({
          filters: [{
            field: 'product_id',
            value: productId,
            condition_type: 'eq',
          }],
        });
      }

      if (filters?.enabled !== undefined) {
        const isEnabled = filters.enabled === 'true' || filters.enabled === true;

        searchCriteria.filterGroups.push({
          filters: [{
            field: 'enabled',
            value: isEnabled,
            condition_type: 'eq',
          }],
        });
      }

      const response = await magentoApi.getSources(searchCriteria);

      if (!response) {
        throw new Error('No response received from the server.');
      }

      setData(response?.items ?? []);
      setTotalCount(response?.total_count ?? 0);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setError('Failed to load sources. Please try again.'); // Set error message
      toast.error('Error loading sources.'); // Show toast notification
    } finally {
      setLoading(false);
    }
  }, [productId, filters]);

  const gridCards = [
    {
      title: 'Total Sources',
      value: totalCount ?? 0,
      color: 'primary',
    },
    {
      title: 'Active Sources',
      value: data?.filter(source => source?.enabled)?.length ?? 0,
      color: 'success',
    },
    {
      title: 'Inactive Sources',
      value: data?.filter(source => !source?.enabled)?.length ?? 0,
      color: 'error',
    },
  ];

  return (
    <UnifiedGrid
      {...getStandardGridProps('sources', {
        gridName: 'SourcesGrid',
        columns,
        data,
        loading,
        totalCount,

        // Event handlers
        onRefresh: handleRefresh,
        onRowDoubleClick: (params) => {
          console.log('Source double-clicked for details:', params.row);
          // Handle source details view
        },
        onExport: (selectedRows) => {
          const exportData = selectedRows.length > 0
            ? data.filter(source => selectedRows.includes(source.source_code))
            : data;

          console.log('Exporting sources:', exportData);
          toast.success(`Exported ${exportData.length} sources`);
        },

        // Configuration
        toolbarConfig: getStandardToolbarConfig('sources'),
        contextMenuActions: getStandardContextMenuActions('sources', {
          view: {
            enabled: true,
            onClick: (rowData) => {
              console.log('Viewing source:', rowData);
              toast.info(`Viewing source: ${rowData.source_code}`);
            },
          },
        }),

        // Stats
        showStatsCards: true,
        gridCards,

        // Filter configuration
        currentFilter: filters,
        onFilterChange: setFilters,

        // Row configuration
        getRowId: (row) => row?.source_code ?? Math.random().toString(36).substr(2, 9),

        // Error handling
        onError: (error) => {
          console.error('Sources Grid Error:', error);
          toast.error('Error loading sources');
        },
      })}
    />
  );
};

export default SourcesGrid;
