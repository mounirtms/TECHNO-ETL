import { useState } from 'react';
import { Box } from '@mui/material';
import BaseGrid from '../common/BaseGrid';
import CegidToolbar from './CegidToolbar';
import cegidApi from '../../services/cegidService';
import { toast } from 'react-toastify';
const CegidGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);




    const handleSearch = async (searchParams) => {
        setLoading(true);
        setError(null);
        try {
            const results = await cegidApi.searchProducts(searchParams);
            setProducts(results || []); // Ensure we always set an array
        } catch (error) {
            console.error('Search failed:', error);
            setError(error);
            setProducts([]); // Reset to empty array on error
            toast.error('Failed to search products');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: 'reference', headerName: 'Reference', width: 150 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'price', headerName: 'Price', width: 130 },
        { field: 'store', headerName: 'Store', width: 100 }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <CegidToolbar
                onSearch={handleSearch}
                loading={loading}
            />
            <BaseGrid
            gridName="CegidProducts"
            data={products} // Make sure this is always an array
            columns={columns}
            loading={loading}
            getRowId={(row) => row?.reference || `row-${Math.random()}`}
            // Add error boundary
            onError={(error) => {
                console.error('Grid Error:', error);
                toast.error('Error loading grid data');
            }}
        />
        </Box>
    );

    /* const columns = [
         { field: 'itemCode', headerName: 'Item Code', width: 150 },
         { field: 'description', headerName: 'Description', flex: 1 },
         { field: 'price', headerName: 'Price', width: 120 },
         { field: 'stock', headerName: 'Stock', width: 100 },
         { field: 'store', headerName: 'Store', width: 100 },
         { field: 'status', headerName: 'Status', width: 120 }
     ];
 
    const handleSearch = useCallback(async () => {
         setLoading(true);
         try {
             const products = await getProductsFromCegid();
             setData(products);
             toast.success('Products loaded successfully');
         } catch (error) {
             console.error('Search error:', error);
             toast.error('Error loading products');
             setData([]);
         } finally {
             setLoading(false);
         }
     }, []);
 
     return (
         <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Paper sx={{ p: 2 }}>
                 <Typography variant="h6" gutterBottom>
                     Cegid Product Search
                 </Typography>
                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                     <TextField
                         label="Barcode"
                         value={barcode}
                         onChange={(e) => setBarcode(e.target.value)}
                         size="small"
                         placeholder="Enter barcode..."
                         sx={{ minWidth: 200 }}
                     />
                     <Button
                         variant="contained"
                         onClick={handleSearch}
                         disabled={loading}
                     >
                         {loading ? 'Loading...' : 'Load Products'}
                     </Button>
                 </Box>
             </Paper>
 
             <BaseGrid
                 gridName="CegidProductsGrid"
                 columns={columns}
                 data={data}
                 loading={loading}
                 onRefresh={handleSearch}
             />
         </Box>
     );
     */
};

export default CegidGrid;