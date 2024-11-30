import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Paper, Typography } from '@mui/material';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'sku', headerName: 'SKU', width: 130 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'price', headerName: 'Price', width: 130, type: 'number' },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'type_id', headerName: 'Type', width: 130 },
  { field: 'visibility', headerName: 'Visibility', width: 130 },
];

export default function ProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace this with your actual Magento API endpoint and credentials
    const fetchProducts = async () => {
      try {
        // Example of how to fetch from Magento API
        // const response = await fetch('your-magento-api-url/V1/products', {
        //   headers: {
        //     'Authorization': 'Bearer your-access-token',
        //   },
        // });
        // const data = await response.json();
        // setProducts(data.items);

        // For now, using mock data
        setProducts([
          {
            id: 1,
            sku: 'TST-001',
            name: 'Test Product 1',
            price: 99.99,
            status: 1,
            type_id: 'simple',
            visibility: 4,
          },
          // Add more mock products as needed
        ]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom component="div">
        Products
      </Typography>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: GridToolbar,
          }}
          initialState={{
            filter: {
              filterModel: {
                items: [],
              },
            },
          }}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
        />
      </div>
    </Paper>
  );
}
