import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';
import magentoApi from '../../services/magentoApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'sku', headerName: 'SKU', width: 130 },
  { field: 'name', headerName: 'Name', width: 200 },
  { 
    field: 'price', 
    headerName: 'Price', 
    width: 130, 
    type: 'number',
    valueFormatter: (params) => {
      if (params.value == null) return '';
      return `$${params.value}`;
    }
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 130,
    valueFormatter: (params) => {
      const statusMap = {
        1: 'Enabled',
        2: 'Disabled'
      };
      return statusMap[params.value] || params.value;
    }
  },
  { field: 'type_id', headerName: 'Type', width: 130 },
  { 
    field: 'qty', 
    headerName: 'Stock', 
    width: 130, 
    type: 'number',
    valueGetter: (params) => params.row.extension_attributes?.stock_item?.qty
  },
];

export default function ProductsGrid() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([
    {
      field: 'created_at',
      sort: 'desc',
    },
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await magentoApi.getProducts({
          currentPage: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          sortOrders: sortModel.map(sort => ({
            field: sort.field,
            direction: sort.sort.toUpperCase()
          }))
        });
        setRows(response.items || []);
        setRowCount(response.total_count || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [paginationModel, sortModel]);

  return (
    <Paper elevation={2} sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        loading={loading}
        disableRowSelectionOnClick
        autoHeight
        density="comfortable"
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />
    </Paper>
  );
}
