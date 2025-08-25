import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface SalesPerformanceDataItem {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface SalesPerformanceChartProps {
  data: SalesPerformanceDataItem[];
  title?: string;
  type?: 'line' | 'area';
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
 * Sales Performance Chart Component
 * Shows sales trends and performance metrics over time
 */
const SalesPerformanceChart: React.FC<SalesPerformanceChartProps> = ({ data, title = "Sales Performance", type = "line" }) => {
  // Custom tooltip for performance chart
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
              {entry.name.includes('Revenue') && ' DA'}
              {entry.name.includes('Orders') && ' orders'}
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
            No performance data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    if(type === "area") {
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type: any,
            fillOpacity={0.6}
            name: any,
            fillOpacity={0.6}
            name: any,
    }

    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type: any,
          strokeWidth={3}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          name: any,
          strokeWidth={3}
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
          name: any,
          strokeWidth={3}
          dot={{ fill: '#ffc658', strokeWidth: 2, r: 4 }}
          name: any,
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
