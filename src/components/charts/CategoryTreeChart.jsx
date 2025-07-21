import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Category Tree Chart Component
 * Shows category hierarchy and product distribution using treemap
 */
const CategoryTreeChart = ({ data, title = "Category Distribution" }) => {
  // Custom tooltip for treemap
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.name}
          </Typography>
          <Typography variant="body2" color="primary">
            Products: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Level: {data.level}
          </Typography>
          {data.parent && (
            <Typography variant="body2" color="text.secondary">
              Parent: {data.parent}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Custom content renderer for treemap cells
  const CustomContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
    if (depth === 1) {
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: colors[Math.floor(index / root.children.length * 6)],
              stroke: '#fff',
              strokeWidth: 2 / (depth + 1e-10),
              strokeOpacity: 1 / (depth + 1e-10),
            }}
          />
          {width > 60 && height > 30 && (
            <text
              x={x + width / 2}
              y={y + height / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={Math.min(width / 8, height / 4, 14)}
              fontWeight="bold"
            >
              {name}
            </text>
          )}
          {width > 80 && height > 50 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 16}
              textAnchor="middle"
              fill="#fff"
              fontSize={Math.min(width / 12, height / 6, 10)}
            >
              {payload.value} products
            </text>
          )}
        </g>
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
            No category data available
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Filter out categories with no products and sort by value
  const filteredData = data
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 20); // Show top 20 categories

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={filteredData}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomContent colors={colors} />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryTreeChart;
