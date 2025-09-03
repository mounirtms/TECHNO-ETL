import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

/**
 * Sales Performance Chart Component
 * Shows sales trends and performance metrics over time
 */
const SalesPerformanceChart = ({ data, title = 'Sales Performance', type = 'line' }) => {
  // Custom tooltip for performance chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Revenue') && ' DA'}
              {entry.name.includes('Orders') && ' orders'}
            </Typography>
          ))}
        </Box>
      );
    }

    return null;
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
            No performance data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    if (type === 'area') {
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stackId="2"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
            name="Orders"
          />
        </AreaChart>
      );
    }

    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={3}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#82ca9d"
          strokeWidth={3}
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
          name="Orders"
        />
        <Line
          type="monotone"
          dataKey="customers"
          stroke="#ffc658"
          strokeWidth={3}
          dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
          name="New Customers"
        />
      </LineChart>
    );
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesPerformanceChart;
