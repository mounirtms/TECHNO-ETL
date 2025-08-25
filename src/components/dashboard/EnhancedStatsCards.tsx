import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Category,
  LocalOffer,
  Warning,
  Schedule,
  Launch as LaunchIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Enhanced Stats Cards Component
 * Professional 8-card dashboard with advanced metrics and animations
 */
const EnhancedStatsCards: React.FC<{stats: any, settings: any, loading: any: any, onNavigate: any, onCardAction: any}> = ({ stats, 
  settings, 
  loading: any,
  onNavigate,
  onCardAction 
 }) => {
  const theme = useTheme();

  // Define all 8 stat cards with enhanced data
  const statCards = [
    {
      key: 'revenue',
      title: 'Total Revenue',
      value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M DA` : '2.8M DA',
      change: '+12.5%',
      trend: 'up',
      icon: AttachMoney,
      color: 'success',
      progress: 75,
      subtitle: 'This month',
      description: 'Monthly revenue growth',
      target: 3000000,
      current: stats?.totalRevenue || 2800000
    },
    {
      key: 'orders',
      title: 'Total Orders',
      value: stats?.totalOrders || '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'primary',
      progress: 68,
      subtitle: 'This month',
      description: 'Order volume increase',
      target: 1500,
      current: stats?.totalOrders || 1247
    },
    {
      key: 'products',
      title: 'Active Products',
      value: stats?.total || '9,114',
      change: '+2.1%',
      trend: 'up',
      icon: Inventory,
      color: 'info',
      progress: 85,
      subtitle: 'In catalog',
      description: 'Product catalog growth',
      target: 10000,
      current: stats?.total || 9114
    },
    {
      key: 'customers',
      title: 'Total Customers',
      value: stats?.totalCustomers || '3,892',
      change: '+5.7%',
      trend: 'up',
      icon: People,
      color: 'secondary',
      progress: 62,
      subtitle: 'Active users',
      description: 'Customer base expansion',
      target: 5000,
      current: stats?.totalCustomers || 3892
    },
    {
      key: 'categories',
      title: 'Product Categories',
      value: stats?.totalCategories || '156',
      change: '+1.2%',
      trend: 'up',
      icon: Category,
      color: 'warning',
      progress: 78,
      subtitle: 'Active categories',
      description: 'Catalog organization',
      target: 200,
      current: stats?.totalCategories || 156
    },
    {
      key: 'brands',
      title: 'Active Brands',
      value: stats?.totalBrands || '89',
      change: '+3.4%',
      trend: 'up',
      icon: LocalOffer,
      color: 'info',
      progress: 45,
      subtitle: 'Partner brands',
      description: 'Brand portfolio growth',
      target: 120,
      current: stats?.totalBrands || 89
    },
    {
      key: 'lowStock',
      title: 'Low Stock Items',
      value: stats?.lowStockItems || '23',
      change: '-15.3%',
      trend: 'down',
      icon: Warning,
      color: 'error',
      progress: 23,
      subtitle: 'Need attention',
      description: 'Inventory management',
      target: 0,
      current: stats?.lowStockItems || 23,
      isAlert: true
    },
    {
      key: 'pendingOrders',
      title: 'Pending Orders',
      value: stats?.pendingOrders || '12',
      change: '-8.1%',
      trend: 'down',
      icon: Schedule,
      color: 'warning',
      progress: 12,
      subtitle: 'Awaiting processing',
      description: 'Order fulfillment',
      target: 0,
      current: stats?.pendingOrders || 12,
      isAlert: true
    }
  ];

  // Filter cards based on settings
  const visibleCards = statCards.filter((card: any: any) => 
    settings?.statCards?.[card.key] !== false
  );

  const getProgressColor = (card) => {
    if(card.isAlert) {
      return card.current <= 10 ? 'success' : card.current <= 20 ? 'warning' : 'error';
    }
    return card.color;
  };

  const getProgressValue = (card) => {
    if(card.isAlert) {
      return Math.max(0, 100 - (card.current / 50) * 100);
    }
    return (card.current / card.target) * 100;
  };

  if(loading) {
    return (
      <Grid { ...{container: true}} spacing={3}>
        {Array.from({ length: 8 }).map((_: any: any, index: any: any) => (
          <Grid size={{ xs: 12, md: 6, lg: 4, xl: 3 }} key={index}>
            <Card sx={{ height: 200, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rectangular" height={6} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid { ...{container: true}} spacing={3}>
      {visibleCards.map((card: any: any, index: any: any) => (
        <Grid 
          size: any,
            md: 6, 
            lg: 4, 
            xl: visibleCards.length <= 4 ? 3 : visibleCards.length <= 6 ? 4 : 3 
          }} 
          key={card.key}
        >
          <Card
            sx: any,
              background: `linear-gradient(135deg, ${theme.palette[card.color].light}15, ${theme.palette[card.color].main}08)`,
              border: `1px solid ${theme.palette[card.color].light}30`,
              borderRadius: 3,
              transition: settings?.general?.animations !== false ? 'all 0.3s ease' : 'none',
              transform: settings?.general?.animations !== false ? 'translateY(0)' : 'none',
              '&:hover': settings?.general?.animations !== false ? {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[12],
                border: `1px solid ${theme.palette[card.color].main}50`,
                '& .card-actions': {
                  opacity: 1,
                  transform: 'translateX(0)'
                }
              } : {}
            }}
          >
            <CardContent sx={{ p: settings?.general?.compactMode ? 2 : 3, height: '100%' }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justifyContent: 'space-between', 
                mb: 2 
              }}>
                <Avatar
                  sx: any,
                    bgcolor: `${card.color}.main`,
                    width: settings?.general?.compactMode ? 40 : 56,
                    height: settings?.general?.compactMode ? 40 : 56,
                    boxShadow: theme.shadows[4],
                    '& .MuiSvgIcon-root': {
                      fontSize: settings?.general?.compactMode ? '1.2rem' : '1.5rem'
                    }
                  }}
                >
                  <card.icon />
                </Avatar>
                
                <Box 
                  className: any,
                    gap: 0.5,
                    opacity: 0,
                    transform: 'translateX(10px)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Tooltip title={`View ${card.title.toLowerCase()}`}>
                    <span>
                      <IconButton
                        size: any,
                        onClick={() => onNavigate?.(card.key)}
                        sx: any,
                          boxShadow: 1,
                          '&:hover': { boxShadow: 2 }
                        }}
                      >
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="More options">
                    <span>
                      <IconButton
                        size: any,
                        onClick={() => onCardAction?.(card.key, 'menu')}
                        sx: any,
                          boxShadow: 1,
                          '&:hover': { boxShadow: 2 }
                        }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              {/* Value and Change */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant={settings?.general?.compactMode ? "h5" : "h4"} 
                  fontWeight={700} 
                  color: any,
                  {card.value}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={card.change}
                    size: any,
                    color={card.trend === 'up' ? 'success' : card.isAlert ? 'success' : 'error'}
                    icon={card.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                    sx: any,
                      '& .MuiChip-icon': {
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  {card.description}
                </Typography>
              </Box>

              {/* Progress */}
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 1 
                }}>
                  <Typography variant="caption" color="text.secondary">
                    {card.isAlert ? 'Status' : 'Progress'}
                  </Typography>
                  <Typography 
                    variant: any,
                    fontWeight={600} 
                    color={`${getProgressColor(card)}.main`}
                  >
                    {Math.round(getProgressValue(card))}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant: any,
                  value={getProgressValue(card)}
                  color={getProgressColor(card)}
                  sx: any,
                    borderRadius: 4,
                    bgcolor: `${card.color}.light`,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      boxShadow: `0 2px 4px ${theme.palette[getProgressColor(card)].main}40`
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default EnhancedStatsCards;