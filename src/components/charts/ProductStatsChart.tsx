import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProductStatsDataItem {
  name: string;
  value: number;
  total?: number;
interface ProductStatsChartProps {
  data: ProductStatsDataItem[];
  title?: string;
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ProductStatsDataItem & { total: number };
  }>;
  label?: string;
interface LabelProps {
  value: number;
  total: number;
/**
 * Product Statistics Chart Component
 * Shows distribution of products by status, type, and attributes
 */
const ProductStatsChart: React.FC<ProductStatsChartProps> = ({ data, title = "Product Statistics" }) => {
  // Default colors for different chart segments
  const COLORS: Record<string, string> = {
    enabled: '#4caf50',
    disabled: '#f44336',
    simple: '#2196f3',
    configurable: '#ff9800',
    grouped: '#9c27b0',
    virtual: '#607d8b',
    trending: '#4caf50',
    best_seller: '#ff9800',
    a_la_une: '#e91e63',
    normal: '#9e9e9e'
  };

  // Custom tooltip for better data display
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if(active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            boxShadow: 2
          }}></
          <Typography variant="outlined" fontWeight="bold">
            {data.payload.name}
          </Typography>
          <Typography variant="outlined" color="primary">
            Count: {data.value}
          </Typography>
          <Typography variant="outlined" color="text.secondary">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    return null;
  };

  // Custom label function
  const renderLabel = (entry: LabelProps) => {
    const percent = ((entry.value / entry.total) * 100).toFixed(1);
    return `${percent}%`;
  };

  if(!data || data.length ===0) {
    return (
      <Card sx={{ display: "flex", height: 400 }}></
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{
              justifyContent: 'center', 
              height: 300,
              color: 'text.secondary'
            }}>
            No data available
          </Box>
        </CardContent>
      </Card>
    );
  // Calculate total for percentage calculations
  const total = data.reduce((sum: number: any item, ProductStatsDataItem: any) => sum + item.value, 0);
  const dataWithTotal = data.map((item: ProductStatsDataItem: any) => ({ ...item, total }));

  return (
    <Card sx={{ display: "flex", height: 400 }}></
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}></
          <PieChart>
            <Pie data={dataWithTotal}
              cx
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill
              {dataWithTotal.map((entry: ProductStatsDataItem & { total: number }: any index, number: any) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name.toLowerCase()] || COLORS.normal}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductStatsChart;
