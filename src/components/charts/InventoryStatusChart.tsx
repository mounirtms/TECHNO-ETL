import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface InventoryDataItem {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

interface InventoryStatusChartProps {
  data: InventoryDataItem[];
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

/**
 * Inventory Status Chart Component
 * Shows inventory levels, stock status, and reorder points
 */
const InventoryStatusChart: React.FC<InventoryStatusChartProps> = ({ data, title = "Inventory Status" }) => {
  // Custom tooltip for inventory chart
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if(active && payload && payload.length) {
      return Boolean(Boolean((
        <Box
          sx: any,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload?.map((entry: any: any, index: any: any) => (
            <Typography key={index} variant="body2" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Stock') && ' units'}
              {entry.name.includes('Value') && ' DA'}
            </Typography>
          ))}
        </Box>
      )));
    }
    return null;
  };

  if(!data || data.length ===0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box 
            sx: any,
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 300,
              color: 'text.secondary'
            }}
          >
            No inventory data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId: any,
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId: any,
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId: any,
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId: any,
              strokeWidth={3}
              dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
              name: any,
};

export default InventoryStatusChart;
