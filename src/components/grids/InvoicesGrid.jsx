import BaseGrid from '../common/BaseGrid';
import magentoApi from '../../services/magentoApi';
import { Box, Typography, Chip, Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const columns = [
  { field: 'entity_id', headerName: 'Invoice #', width: 100 },
  { 
    field: 'order_id',
    headerName: 'Order #',
    width: 100,
  },
  {
    field: 'created_at',
    headerName: 'Date',
    width: 180,
    valueFormatter: (params) => {
      return new Date(params.value).toLocaleString();
    },
  },
  {
    field: 'state',
    headerName: 'Status',
    width: 130,
    renderCell: (params) => {
      const statusColors = {
        1: 'success', // paid
        2: 'warning', // pending
        3: 'error',   // canceled
      };
      
      const statusLabels = {
        1: 'Paid',
        2: 'Pending',
        3: 'Canceled',
      };
      
      return (
        <Chip
          label={statusLabels[params.value] || params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
        />
      );
    },
  },
  {
    field: 'grand_total',
    headerName: 'Grand Total',
    width: 130,
    type: 'number',
    valueFormatter: (params) => {
      if (params.value == null) return '';
      return `$${params.value.toFixed(2)}`;
    },
  },
  {
    field: 'billing_name',
    headerName: 'Bill To',
    width: 200,
    valueGetter: (params) => {
      const billing = params.row.billing_address || {};
      return `${billing.firstname || ''} ${billing.lastname || ''}`.trim();
    },
  },
];

const InvoiceDetailPanel = ({ row }) => {
  const items = row.items || [];
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Invoice Details #{row.increment_id}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Invoice Items
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.entity_id}>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">${Number(item.row_total).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            Billing Address
          </Typography>
          <Typography variant="body2">
            {row.billing_address?.firstname} {row.billing_address?.lastname}
          </Typography>
          <Typography variant="body2">
            {row.billing_address?.street?.join(', ')}
          </Typography>
          <Typography variant="body2">
            {row.billing_address?.city}, {row.billing_address?.region} {row.billing_address?.postcode}
          </Typography>
          <Typography variant="body2">
            {row.billing_address?.country_id}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" gutterBottom>
            Invoice Totals
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">${Number(row.subtotal).toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Shipping & Handling:</Typography>
            <Typography variant="body2">${Number(row.shipping_amount).toFixed(2)}</Typography>
          </Box>
          {Number(row.discount_amount) !== 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2">${Math.abs(Number(row.discount_amount)).toFixed(2)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Tax:</Typography>
            <Typography variant="body2">${Number(row.tax_amount).toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="subtitle2">Grand Total:</Typography>
            <Typography variant="subtitle2">${Number(row.grand_total).toFixed(2)}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function InvoicesGrid() {
  return (
    <BaseGrid
      title="Invoices"
      columns={columns}
      fetchData={magentoApi.getInvoices.bind(magentoApi)}
      detailPanel={InvoiceDetailPanel}
      initialSort={[{ field: 'created_at', sort: 'desc' }]}
    />
  );
}
