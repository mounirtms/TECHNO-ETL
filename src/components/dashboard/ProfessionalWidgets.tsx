/**
 * Professional Dashboard Widgets
 * Enhanced widgets with modern design and animations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Stack,
  Divider,
  Button,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Refresh,
  OpenInNew,
  Analytics,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Speed,
  CheckCircle,
  Warning,
  Error,
  Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

// Professional color palette
const COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    error: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
  }
};

/**
 * Enhanced Metric Card with animations and trends
 */
export const ProfessionalMetricCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  color = 'primary',
  loading = false,
  subtitle,
  trend,
  onClick,
  actions
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate trend percentage
  const trendPercentage = previousValue 
    ? ((value - previousValue) / previousValue * 100).toFixed(1)
    : 0;
  
  const isPositiveTrend = trendPercentage >= 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          height: '100%',
          background: COLORS.gradient[color] || COLORS.gradient.primary,
          color: 'white',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isHovered 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'transparent',
            transition: 'background 0.3s ease'
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                width: 48,
                height: 48
              }}
            >
              <Icon />
            </Avatar>
            
            {actions && (
              <IconButton size="small" sx={{ color: 'white' }}>
                <MoreVert />
              </IconButton>
            )}
          </Box>

          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
            {title}
          </Typography>

          {loading ? (
            <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          )}

          {subtitle && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
              {subtitle}
            </Typography>
          )}

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isPositiveTrend ? (
                <TrendingUp sx={{ color: '#4caf50', fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: '#f44336', fontSize: 20 }} />
              )}
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {Math.abs(trendPercentage)}% {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Professional Chart Widget with enhanced styling
 */
export const ProfessionalChartWidget = ({
  title,
  data,
  chartType = 'line',
  loading = false,
  height = 300,
  showLegend = true,
  color = 'primary',
  onRefresh,
  onExpand
}) => {
  const theme = useTheme();

  const renderChart = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
          <CircularProgress />
        </Box>
      );
    }

    const chartProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[color]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[color]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS[color]}
              fill={`url(#gradient-${color})`}
              strokeWidth={3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            {showLegend && <Legend />}
            <Bar dataKey="value" fill={COLORS[color]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...chartProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={COLORS[color]}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        );

      default: // line
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip 
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
              }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS[color]}
              strokeWidth={3}
              dot={{ fill: COLORS[color], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS[color], strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
            {onExpand && (
              <Tooltip title="Expand">
                <IconButton size="small" onClick={onExpand}>
                  <OpenInNew />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </CardContent>

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Professional Progress Widget
 */
export const ProfessionalProgressWidget = ({
  title,
  items,
  loading = false
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          {title}
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={8} sx={{ mt: 1 }} />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={3}>
            {items.map((item, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.value}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: item.color || COLORS.gradient.primary
                    }
                  }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Professional Status Widget
 */
export const ProfessionalStatusWidget = ({
  title,
  items,
  loading = false
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle sx={{ color: COLORS.success }} />;
      case 'warning': return <Warning sx={{ color: COLORS.warning }} />;
      case 'error': return <Error sx={{ color: COLORS.error }} />;
      default: return <Info sx={{ color: COLORS.info }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.info;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          {title}
        </Typography>

        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="70%" />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {items.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getStatusIcon(item.status)}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </Box>
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(item.status), 0.1),
                      color: getStatusColor(item.status),
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
