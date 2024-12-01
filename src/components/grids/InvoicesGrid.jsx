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
import DownloadIcon from '@mui/icons-material/Download';
import invoices from '../../assets/data/invoices.json';

const InvoicesGrid = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulate loading data
        const loadData = () => {
            setData(invoices);
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
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            case 'cancelled':
                return 'default';
            default:
                return 'info';
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
                Invoices
            </Typography>
            
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Invoice #</TableCell>
                                <TableCell>Order #</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((invoice) => (
                                    <TableRow hover key={invoice.id}>
                                        <TableCell>#{invoice.increment_id}</TableCell>
                                        <TableCell>#{invoice.order_id}</TableCell>
                                        <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{invoice.customer_name}</TableCell>
                                        <TableCell>${invoice.grand_total}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={invoice.status}
                                                color={getStatusColor(invoice.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Invoice">
                                                <IconButton size="small" color="primary">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Print Invoice">
                                                <IconButton size="small">
                                                    <LocalPrintshopIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Download PDF">
                                                <IconButton size="small" color="secondary">
                                                    <DownloadIcon fontSize="small" />
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

export default InvoicesGrid;
