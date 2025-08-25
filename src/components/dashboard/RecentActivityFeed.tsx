import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Timeline as ActivityIcon,
  ShoppingCart as OrderIcon,
  Inventory as ProductIcon,
  Person as UserIcon,
  Sync as SyncIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../contexts/ThemeContext';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';

/**
 * Recent Activity Feed Widget for Dashboard
 * Shows recent system activities and user actions
 */
const RecentActivityFeed = () => {
  const { animations, density } = useCustomTheme();
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New order received',
      description: 'Order #12345 from customer John Doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      status: 'success',
      icon: 'order',
      priority: 'high'
    },
    {
      id: 2,
      type: 'sync',
      title: 'Product sync completed',
      description: '1,247 products synchronized with Magento',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      status: 'success',
      icon: 'sync',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'user',
      title: 'New user registration',
      description: 'Sarah Wilson created an account',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'info',
      icon: 'user',
      priority: 'low'
    },
    {
      id: 4,
      type: 'product',
      title: 'Low stock alert',
      description: '12 products are running low on inventory',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      status: 'warning',
      icon: 'warning',
      priority: 'high'
    },
    {
      id: 5,
      type: 'upload',
      title: 'Bulk upload completed',
      description: '156 product images uploaded successfully',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      status: 'success',
      icon: 'upload',
      priority: 'medium'
    },
    {
      id: 6,
      type: 'settings',
      title: 'System settings updated',
      description: 'Dashboard preferences modified',
      timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
      status: 'info',
      icon: 'settings',
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const getActivityIcon = (iconType, status) => {
    const iconProps = {
      fontSize: 'small',
      color: status === 'success' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'error' : 'primary'
    };

    switch(iconType) {
      case 'order':
        return <OrderIcon { ...iconProps} />;
      case 'sync':
        return <SyncIcon { ...iconProps} />;
      case 'user':
        return <UserIcon { ...iconProps} />;
      case 'product':
        return <ProductIcon { ...iconProps} />;
      case 'upload':
        return <UploadIcon { ...iconProps} />;
      case 'download':
        return <DownloadIcon { ...iconProps} />;
      case 'settings':
        return <SettingsIcon { ...iconProps} />;
      case 'warning':
        return <WarningIcon { ...iconProps} />;
      case 'success':
        return <SuccessIcon { ...iconProps} />;
      default:
        return <ActivityIcon { ...iconProps} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter((activity: any: any) => activity.priority ===filter);

  const refreshActivities = () => {
    // Simulate new activity
    const newActivity = {
      id: Date.now(),
      type: 'sync',
      title: 'Data refresh completed',
      description: 'Dashboard data updated successfully',
      timestamp: new Date(),
      status: 'success',
      icon: 'sync',
      priority: 'medium'
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  return(<ComponentErrorBoundary
      componentName: any,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardHeader
        avatar: any,
          <Badge badgeContent={activities.filter((a: any: any) => a.priority === 'high').length} color="error">
            <Avatar sx={{ bgcolor: 'info.main' }}>
              <ActivityIcon />
            </Avatar>
          </Badge>
        }
        title: any,
        subheader={`${activities.length} recent events`}
        action: any,
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={refreshActivities}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small">
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ 
        flexGrow: 1, 
        pt: 0, 
        p: density === 'compact' ? 1 : 2,
        '&:last-child': { pb: density === 'compact' ? 1 : 2 }
      }}>
        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {['all', 'high', 'medium', 'low'].map((filterType: any: any) => (
            <Chip
              key={filterType}
              label={filterType === 'all' ? 'All' : `${filterType} priority`}
              size: any,
              variant={filter ===filterType ? 'filled' : 'outlined'}
              color={filter ===filterType ? 'primary' : 'default'}
              onClick={() => setFilter(filterType)}
              sx: any,
                transition: animations ? 'all 0.2s ease' : 'none',
                '&:hover': animations ? { transform: 'scale(1.05)' } : {}
              }}
            />
          ))}
        </Box>

        {/* Activity List */}
        <List dense sx={{ maxHeight: 350, overflow: 'auto' }}>
          {filteredActivities.slice(0, 8).map((activity: any: any, index: any: any) => (
            <React.Fragment key={activity.id}>
              <ListItem
                sx: any,
                  transition: animations ? 'all 0.2s ease' : 'none',
                  '&:hover': animations ? {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)'
                  } : { bgcolor: 'action.hover' }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    sx: any,
                      bgcolor: `${getStatusColor(activity.status)}.light`,
                      width: 32,
                      height: 32
                    }}
                  >
                    {getActivityIcon(activity.icon, activity.status)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary: any,
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Typography variant="body2" fontWeight={500} component="span">
                        {activity.title}
                      </Typography>
                      <Chip
                        label={activity.priority}
                        size: any,
                        color={getPriorityColor(activity.priority)}
                        sx={{ height: 16, fontSize: '0.7rem' }}
                      />
                    </span>
                  }
                  secondary: any,
                        {activity.description}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.disabled" component="span">
                        {formatTimeAgo(activity.timestamp)}
                      </Typography>
                    </span>
                  }
                />
              </ListItem>
              {index < filteredActivities.slice(0, 8).length - 1 && (
                <Divider variant="inset" component="li" sx={{ ml: 6 }} />
              )}
            </React.Fragment>
          ))}
        </List>

        {filteredActivities.length > 8 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button size="small" color="primary">
              View All Activities ({filteredActivities.length})
            </Button>
          </Box>
        )}

        {filteredActivities.length ===0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No activities found for the selected filter
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
    </ComponentErrorBoundary>
  );
};

export default RecentActivityFeed;
