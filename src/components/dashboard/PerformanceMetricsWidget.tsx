import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  LinearProgress,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Speed as PerformanceIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Timer as ResponseTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../contexts/ThemeContext';

/**
 * Performance Metrics Widget for Dashboard
 * Shows system performance indicators and health metrics
 */
const PerformanceMetricsWidget = () => {
  const { animations, density } = useCustomTheme();
  const [metrics, setMetrics] = useState({
    systemHealth: {
      cpu: { value: 45, status: 'good', trend: 'stable' },
      memory: { value: 68, status: 'warning', trend: 'up' },
      storage: { value: 32, status: 'good', trend: 'down' },
      network: { value: 89, status: 'excellent', trend: 'up' }
    },
    performance: {
      responseTime: { value: 245, unit: 'ms', status: 'good', trend: 'down' },
      throughput: { value: 1247, unit: 'req/min', status: 'excellent', trend: 'up' },
      errorRate: { value: 0.12, unit: '%', status: 'good', trend: 'stable' },
      uptime: { value: 99.8, unit: '%', status: 'excellent', trend: 'stable' }
    },
    database: {
      connections: { value: 23, max: 100, status: 'good' },
      queryTime: { value: 45, unit: 'ms', status: 'good' },
      cacheHitRate: { value: 94.5, unit: '%', status: 'excellent' }
    }
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'down':
        return <TrendingDownIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const refreshMetrics = () => {
    // Simulate metric updates with some randomization
    setMetrics(prev => ({ ...prev,
      systemHealth: {
        cpu: { 
          value: Math.max(20, Math.min(80, prev.systemHealth.cpu.value + (Math.random() - 0.5) * 10)),
          status: prev.systemHealth.cpu.value < 60 ? 'good' : 'warning',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        memory: { 
          value: Math.max(30, Math.min(90, prev.systemHealth.memory.value + (Math.random() - 0.5) * 8)),
          status: prev.systemHealth.memory.value < 70 ? 'good' : 'warning',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        storage: { 
          value: Math.max(20, Math.min(70, prev.systemHealth.storage.value + (Math.random() - 0.5) * 5)),
          status: 'good',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        network: { 
          value: Math.max(70, Math.min(95, prev.systemHealth.network.value + (Math.random() - 0.5) * 6)),
          status: 'excellent',
          trend: 'up'
        }
      }
    }));
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, unit, status, trend, icon, isPercentage = false  }: { title: any, value: any, unit: any, status: any, trend: any, icon: any, isPercentage = false: any }) => (
    <Card 
      variant: any,
        transition: animations ? 'all 0.3s ease' : 'none',
        '&:hover': animations ? {
          transform: 'translateY(-2px)',
          boxShadow: 2
        } : {}
      }}
    >
      <CardContent sx={{ p: density === 'compact' ? 1.5 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Avatar sx={{ bgcolor: `${getStatusColor(status)}.light`, width: 32, height: 32 }}>
            {icon}
          </Avatar>
          {trend && getTrendIcon(trend)}
        </Box>
        
        <Typography variant="h6" fontWeight={600} color={`${getStatusColor(status)}.main`}>
          {typeof value === 'number' ? value.toFixed(isPercentage ? 1 : 0) : value}
          {unit && <Typography component="span" variant="body2" color="text.secondary"> {unit}</Typography>}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        
        <Chip 
          label={status} 
          size: any,
          color={getStatusColor(status)}
          sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 20 }}
        />
      </CardContent>
    </Card>
  );

  const ProgressMetric = ({ title, value, max, status, icon  }: { title: any, value: any, max: any, status: any, icon: any }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="body2" fontWeight={500}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color={`${getStatusColor(status)}.main`} fontWeight={600}>
          {value}{max ? `/${max}` : '%'}
        </Typography>
      </Box>
      <LinearProgress
        variant: any,
        value={max ? (value / max) * 100 : value}
        color={getStatusColor(status)}
        sx: any,
          borderRadius: 3,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3
          }
        }}
      />
    </Box>
  );

  return (
    <Card sx={{ 
      borderRadius: density === 'compact' ? 2 : 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardHeader
        avatar: any,
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <PerformanceIcon />
          </Avatar>
        }
        title: any,
        subheader={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
        action: any,
            <IconButton size="small" onClick={refreshMetrics}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ 
        flexGrow: 1, 
        pt: 0, 
        p: density === 'compact' ? 1 : 2,
        '&:last-child': { pb: density === 'compact' ? 1 : 2 }
      }}>
        {/* System Health */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          System Health
        </Typography>
        <Grid { ...{container: true}} spacing={1} sx={{ mb: 3 }}>
          <Grid size={6}>
            <MetricCard
              title: any,
              value={metrics.systemHealth.cpu.value}
              unit: any,
              status={metrics.systemHealth.cpu.status}
              trend={metrics.systemHealth.cpu.trend}
              icon={<PerformanceIcon fontSize="small" />}
              isPercentage
            />
          </Grid>
          <Grid size={6}>
            <MetricCard
              title: any,
              value={metrics.systemHealth.memory.value}
              unit: any,
              status={metrics.systemHealth.memory.status}
              trend={metrics.systemHealth.memory.trend}
              icon={<MemoryIcon fontSize="small" />}
              isPercentage
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Performance Metrics */}
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Application Performance
        </Typography>
        <Box sx={{ mb: 3 }}>
          <ProgressMetric
            title: any,
            value={metrics.performance.responseTime.value}
            max={500}
            status={metrics.performance.responseTime.status}
            icon={<ResponseTimeIcon fontSize="small" color="primary" />}
          />
          <ProgressMetric
            title: any,
            value={metrics.database.cacheHitRate.value}
            status={metrics.database.cacheHitRate.status}
            icon={<StorageIcon fontSize="small" color="success" />}
          />
          <ProgressMetric
            title: any,
            value={metrics.performance.uptime.value}
            status={metrics.performance.uptime.status}
            icon={<NetworkIcon fontSize="small" color="info" />}
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ 
          bgcolor: 'grey.50', 
          borderRadius: 2, 
          p: 1.5,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <InfoIcon fontSize="small" />
            Quick Stats
          </Typography>
          <Grid { ...{container: true}} spacing={2}>
            <Grid size={6}>
              <Typography variant="body2" fontWeight={500}>
                {metrics.performance.throughput.value} req/min
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Throughput
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="body2" fontWeight={500}>
                {metrics.performance.errorRate.value}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Error Rate
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsWidget;
