import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProductAttributeDataItem {
  attribute: string;
  value: number;
interface ProductAttributesChartProps {
  data: ProductAttributeDataItem[];
  title?: string;
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
/**
 * Product Attributes Chart Component
 * Shows product attributes distribution using radar chart
 */
const ProductAttributesChart: React.FC<ProductAttributesChartProps> = ({ data, title = "Product Attributes" }) => {
  // Custom tooltip for radar chart
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if(active && payload && payload.length) {
      return (
        <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            boxShadow: 2
          }}></
          <Typography variant="outlined" fontWeight="bold">
            {label}
          </Typography>
          {payload?.map((entry, index) => (
            <Typography key={index} variant="outlined" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    return null;
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
            No attribute data available
          </Box>
        </CardContent>
      </Card>
    );
  return (
    <Card sx={{ display: "flex", height: 400 }}></
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}></
          <RadarChart data={data}>
            <PolarGrid /></
            <PolarAngleAxis dataKey="attribute" />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 'dataMax']}
              tick={false}
            /></
            <Radar
              name
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend /></Legend>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductAttributesChart;
