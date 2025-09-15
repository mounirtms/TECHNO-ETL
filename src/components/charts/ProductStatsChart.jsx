import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Product Statistics Chart Component
 * Shows distribution of products by status, type, and attributes
 */
const ProductStatsChart = ({ data, title = 'Product Statistics' }) => {
  // Default colors for different chart segments
  const COLORS = {
    enabled: '#4caf50',
    disabled: '#f44336',
    simple: '#2196f3',
    configurable: '#ff9800',
    grouped: '#9c27b0',
    virtual: '#607d8b',
    trending: '#4caf50',
    best_seller: '#ff9800',
    a_la_une: '#e91e63',
    normal: '#9e9e9e',
  };

  // Custom tooltip for better data display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {data.payload.name}
          </Typography>
          <Typography variant="body2" color="primary">
            Count: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {((data.value / data.payload.total) * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }

    return null;
  };

  // Custom label function
  const renderLabel = (entry) => {
    const percent = ((entry.value / entry.total) * 100).toFixed(1);

    return `${percent}%`;
  };

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              color: 'text.secondary',
            }}
          >
            No data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithTotal.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name.toLowerCase()] || COLORS.normal}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
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
