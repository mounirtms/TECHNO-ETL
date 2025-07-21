import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  MoreVert as MoreIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Dashboard Overview Component
 * Displays key metrics and KPIs in a clean, professional layout
 */
const DashboardOverview = ({ stats, onNavigate }) => {
  const theme = useTheme();

  const metricCards = [
    {
      title: 'Total Revenue',
      value: '2,847,500 DA',
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: 'success',
      progress: 75,
      subtitle: 'This month'
    },
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: <ShoppingCart />,
      color: 'primary',
      progress: 68,
      subtitle: 'This month'
    },
    {
      title: 'Active Products',
      value: stats?.total || '9,114',
      change: '+2.1%',
      trend: 'up',
      icon: <Inventory />,
      color: 'info',
      progress: 85,
      subtitle: 'In catalog'
    },
    {
      title: 'Customers',
      value: '3,892',
      change: '-1.2%',
      trend: 'down',
      icon: <People />,
      color: 'warning',
      progress: 45,
      subtitle: 'Active users'
    }
  ];

  const quickStats = [
    { label: 'Pending Orders', value: '23', color: 'warning' },
    { label: 'Low Stock Items', value: '12', color: 'error' },
    { label: 'New Customers', value: '45', color: 'success' },
    { label: 'Returns', value: '8', color: 'info' }
  ];

  return (
    <Box>
      {/* Main Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${theme.palette[metric.color].light}15, ${theme.palette[metric.color].main}08)`,
                border: `1px solid ${theme.palette[metric.color].light}30`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  border: `1px solid ${theme.palette[metric.color].main}50`
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${metric.color}.main`,
                      width: 48,
                      height: 48,
                      boxShadow: theme.shadows[3]
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={metric.change}
                      size="small"
                      color={metric.trend === 'up' ? 'success' : 'error'}
                      icon={metric.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                      sx={{ fontWeight: 600 }}
                    />
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onNavigate?.(metric.title.toLowerCase())}>
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  {metric.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {metric.title}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color={`${metric.color}.main`}>
                      {metric.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    color={metric.color}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: `${metric.color}.light`,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Quick Overview
            </Typography>
            <IconButton size="small">
              <MoreIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={3}>
            {quickStats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={`${stat.color}.main`}
                    gutterBottom
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Today's Highlights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                📈 Sales increased by 12.5% compared to yesterday
              </Typography>
              <Chip label="Good" color="success" size="small" />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                🛒 23 new orders received in the last 24 hours
              </Typography>
              <Chip label="Active" color="primary" size="small" />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ⚠️ 12 products are running low on stock
              </Typography>
              <Chip label="Attention" color="warning" size="small" />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                👥 45 new customer registrations this week
              </Typography>
              <Chip label="Growing" color="info" size="small" />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardOverview;
