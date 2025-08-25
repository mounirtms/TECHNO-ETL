import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// TypeScript interfaces for the chart data
interface BrandData {
  name: string;
  value: number;
  percentage?: string;
}

interface BrandDistributionChartProps {
  data: BrandData[];
  title?: string;
}

interface TooltipPayload {
  value: number;
  payload: BrandData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

/**
 * Brand Distribution Chart Component
 * Shows product distribution across different brands
 */
const BrandDistributionChart: React.FC<BrandDistributionChartProps> = ({ data, title = "Brand Distribution" }) => {
  // Custom tooltip for better data display
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx={{
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
          <Typography variant="body2" color="primary">
            Products: {data.value}
          </Typography>
          {data.payload.percentage && (
            <Typography variant="body2" color="text.secondary">
              {data.payload.percentage}% of total
            </Typography>
          )}
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
              color: 'text.secondary'
            }}
          >
            No brand data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages
  const total: number = data.reduce((sum: number, item: BrandData) => sum + item.value, 0);
  const dataWithPercentage: BrandData[] = data.map((item: BrandData) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  // Sort by value descending and take top 10
  const sortedData: BrandData[] = dataWithPercentage
    .sort((a: BrandData, b: BrandData) => b.value - a.value)
    .slice(0, 10);

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#2196f3"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BrandDistributionChart;
