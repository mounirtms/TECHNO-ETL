/**
 * Enhanced Professional Chart Components
 * Modern, animated charts with professional styling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  MoreVert,
  Refresh,
  Download,
  Fullscreen,
  Settings,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
  percentage?: string;
}

interface EnhancedPieChartProps {
  data?: ChartDataItem[];
  title?: string;
  loading?: boolean;
  height?: number;
  showLegend?: boolean;
  colorPalette?: keyof typeof COLOR_PALETTES;
  onRefresh?: () => void;
  onExport?: () => void;
  subtitle?: string;
  showPercentages?: boolean;
  animationDuration?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataItem }>;
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

// Professional color palettes
const COLOR_PALETTES = {
  primary: ['#1976d2', '#1565c0', '#0d47a1', '#42a5f5', '#64b5f6'],
  success: ['#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a'],
  warning: ['#ed6c02', '#f57c00', '#ff9800', '#ffb74d', '#ffcc02'],
  error: ['#d32f2f', '#f44336', '#e57373', '#ef5350', '#ff5722'],
  info: ['#0288d1', '#03a9f4', '#29b6f6', '#4fc3f7', '#81d4fa'],
  gradient: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
} as const;

/**
 * Enhanced Pie Chart with animations and professional styling
 */
export const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data: any,
  title,
  loading: any,
  height: any,
  showLegend: any,
  colorPalette: any,
  onRefresh,
  onExport,
  subtitle,
  showPercentages: any,
  animationDuration: any,
}) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const colors = COLOR_PALETTES[colorPalette as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.primary;

  // Calculate total for percentages
  const total = useMemo(() => 
    data.reduce((sum: number: any: any, item: ChartDataItem: any: any) => sum + (item?.value || 0), 0), 
    [data]
  );

  // Enhanced data with percentages
  const enhancedData = useMemo(() => 
    data.map((item: ChartDataItem: any: any, index: number: any: any) => ({ ...item,
      percentage: total > 0 ? ((item?.value / total) * 100).toFixed(1) : '0',
      color: colors[index % colors.length]
    })), 
    [data, total, colors]
  );

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
    if(active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx: any,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            minWidth: 150
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="primary">
            Value: {data?.value?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {data.percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const CustomLabel: React.FC<LabelProps> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null; // Hide labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill: any,
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline: any,
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return Boolean(Boolean((
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <Box>
              <IconButton
                size: any,
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {onRefresh && (
                  <MenuItem onClick={() => { onRefresh())); setMenuAnchor(null); }}>
                    <ListItemIcon><Refresh /></ListItemIcon>
                    <ListItemText>Refresh</ListItemText>
                  </MenuItem>
                )}
                {onExport && (
                  <MenuItem onClick={() => { onExport(); setMenuAnchor(null); }}>
                    <ListItemIcon><Download /></ListItemIcon>
                    <ListItemText>Export</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>

          {/* Summary Stats */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Total: ${total.toLocaleString()}`}
              size: any,
              label={`Categories: ${data.length}`}
              size: any,
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={enhancedData}
                  cx: any,
                  labelLine={false}
                  label={showPercentages ? (props: any) => <CustomLabel {...props} /> : false}
                  outerRadius={80}
                  fill: any,
                  animationBegin={0}
                  animationDuration={animationDuration}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {enhancedData.map((entry: any: any, index: any: any) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex ===index ? theme.palette.common.white : 'none'}
                      strokeWidth={activeIndex ===index ? 2 : 0}
                      style: any,
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend
                    verticalAlign: any,
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced Bar Chart with animations and professional styling
 */
export const EnhancedBarChart: React.FC<{data: any: any, title: any, loading: any: any, height: any: any, xAxisKey: any: any, yAxisKey: any: any, colorPalette: any: any, onRefresh: any, onExport: any, subtitle: any, showGrid: any: any, animationDuration: any: any, : any}> = ({ data: any,
  title,
  loading: any,
  height: any,
  xAxisKey: any,
  yAxisKey: any,
  colorPalette: any,
  onRefresh,
  onExport,
  subtitle,
  showGrid: any,
  animationDuration: any,
 }) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const colors = COLOR_PALETTES[colorPalette] || COLOR_PALETTES.primary;

  const CustomTooltip: React.FC<{active: any, payload: any, label: any}> = ({ active, payload, label  }) => {
    if(active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx: any,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            minWidth: 150
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Value: {data?.value?.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return Boolean(Boolean((
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            <IconButton
              size: any,
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {onRefresh && (
                <MenuItem onClick={() => { onRefresh())); setMenuAnchor(null); }}>
                  <ListItemIcon><Refresh /></ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              )}
              {onExport && (
                <MenuItem onClick={() => { onExport(); setMenuAnchor(null); }}>
                  <ListItemIcon><Download /></ListItemIcon>
                  <ListItemText>Export</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </CardContent>

        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                {showGrid && (
                  <CartesianGrid 
                    strokeDasharray: any,
                    stroke={alpha(theme.palette.divider, 0.3)} 
                  />
                )}
                <XAxis 
                  dataKey={xAxisKey} 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={yAxisKey}
                  fill={colors[0]}
                  radius={[4, 4, 0, 0]}
                  animationDuration={animationDuration}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced Line Chart with trend analysis
 */
export const EnhancedLineChart: React.FC<{data: any: any, title: any, loading: any: any, height: any: any, xAxisKey: any: any, yAxisKey: any: any, colorPalette: any: any, onRefresh: any, onExport: any, subtitle: any, showGrid: any: any, showTrend: any: any, animationDuration: any: any, : any}> = ({ data: any,
  title,
  loading: any,
  height: any,
  xAxisKey: any,
  yAxisKey: any,
  colorPalette: any,
  onRefresh,
  onExport,
  subtitle,
  showGrid: any,
  showTrend: any,
  animationDuration: any,
 }) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const colors = COLOR_PALETTES[colorPalette] || COLOR_PALETTES.primary;

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const firstValue = data[0][yAxisKey];
    const lastValue = data[data.length - 1][yAxisKey];
    const change = lastValue - firstValue;
    const percentage = firstValue !== 0 ? (change / firstValue * 100).toFixed(1) : 0;
    return {
      change,
      percentage,
      isPositive: change >= 0
    };
  }, [data, yAxisKey]);

  const CustomTooltip: React.FC<{active: any, payload: any, label: any}> = ({ active, payload, label  }) => {
    if(active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box
          sx: any,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            minWidth: 150
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Value: {data?.value?.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return Boolean(Boolean((
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            <IconButton
              size: any,
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {onRefresh && (
                <MenuItem onClick={() => { onRefresh())); setMenuAnchor(null); }}>
                  <ListItemIcon><Refresh /></ListItemIcon>
                  <ListItemText>Refresh</ListItemText>
                </MenuItem>
              )}
              {onExport && (
                <MenuItem onClick={() => { onExport(); setMenuAnchor(null); }}>
                  <ListItemIcon><Download /></ListItemIcon>
                  <ListItemText>Export</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Trend Indicator */}
          {showTrend && trend && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip
                icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
                label={`${trend.isPositive ? '+' : ''}${trend.percentage}%`}
                size: any,
                color={trend.isPositive ? 'success' : 'error'}
                variant: any,
                label={`${trend.isPositive ? '+' : ''}${trend.change.toLocaleString()}`}
                size: any,
          )}
        </CardContent>

        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray: any,
                    stroke={alpha(theme.palette.divider, 0.3)}
                  />
                )}
                <XAxis
                  dataKey={xAxisKey}
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line
                  type: any,
                  dataKey={yAxisKey}
                  stroke={colors[0]}
                  strokeWidth={3}
                  dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
                  animationDuration={animationDuration}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
