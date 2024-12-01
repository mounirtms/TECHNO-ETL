import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import orders from '../../assets/data/orders.json';

const OrdersGrid = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulate loading data
        const loadData = () => {
            setData(orders);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'processing':
                return 'warning';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'pending':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: '100%', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Orders
            </Typography>
            
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((order) => (
                                    <TableRow hover key={order.id}>
                                        <TableCell>#{order.increment_id}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{order.customer_name}</TableCell>
                                        <TableCell>${order.grand_total}</TableCell>
                                        <TableCell>{order.total_items}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Order">
                                                <IconButton size="small" color="primary">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Print Order">
                                                <IconButton size="small">
                                                    <LocalPrintshopIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reorder">
                                                <IconButton size="small" color="secondary">
                                                    <ShoppingCartIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default OrdersGrid;
