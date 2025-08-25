import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Sync as SyncIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Image as ImageIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useCustomTheme } from '../../contexts/ThemeContext';

/**
 * Quick Actions Component
 * Provides easy access to common dashboard actions
 */
const QuickActions = ({ onAction  }: { onAction: any }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { animations, density } = useCustomTheme();

  const primaryActions = [
    {
      title: 'Add Product',
      description: 'Create new product',
      icon: <AddIcon />,
      color: 'primary',
      action: () => onAction?.('add-product')
    },
    {
      title: 'Import Data',
      description: 'Upload CSV files',
      icon: <UploadIcon />,
      color: 'info',
      action: () => onAction?.('import-data')
    },
    {
      title: 'Sync Products',
      description: 'Sync with Magento',
      icon: <SyncIcon />,
      color: 'success',
      action: () => onAction?.('sync-products')
    },
    {
      title: 'View Analytics',
      description: 'Open charts page',
      icon: <AnalyticsIcon />,
      color: 'secondary',
      action: () => navigate('/charts')
    }
  ];

  const quickLinks = [
    {
      title: 'Products',
      count: '9,114',
      icon: <InventoryIcon />,
      color: 'primary',
      route: '/products'
    },
    {
      title: 'Orders',
      count: '1,247',
      icon: <ShoppingCartIcon />,
      color: 'success',
      route: '/orders'
    },
    {
      title: 'Customers',
      count: '3,892',
      icon: <PeopleIcon />,
      color: 'info',
      route: '/customers'
    },
    {
      title: 'Categories',
      count: '156',
      icon: <CategoryIcon />,
      color: 'warning',
      route: '/categories'
    }
  ];

  const recentActions = [
    {
      title: 'Bulk Media Upload',
      description: 'Upload product images',
      icon: <ImageIcon />,
      action: () => onAction?.('bulk-media-upload')
    },
    {
      title: 'Export Report',
      description: 'Download data export',
      icon: <DownloadIcon />,
      action: () => onAction?.('export-report')
    },
    {
      title: 'System Settings',
      description: 'Configure system',
      icon: <SettingsIcon />,
      action: () => onAction?.('settings')
    },
    {
      title: 'Performance Report',
      description: 'View detailed analytics',
      icon: <AssessmentIcon />,
      action: () => navigate('/charts')
    }
  ];

  return (
    <Box>
      {/* Primary Actions */}
      <Card sx={{ borderRadius: density === 'compact' ? 2 : 3, mb: density === 'compact' ? 2 : 3 }}>
        <CardContent sx={{ p: density === 'compact' ? 2 : 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          
          <Grid container spacing={2}>
            {primaryActions.map((action: any: any, index: any: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Button
                  fullWidth
                  variant: any,
                  onClick={action.action}
                  sx: any,
                    borderRadius: density === 'compact' ? 1 : 2,
                    flexDirection: 'column',
                    gap: 1,
                    borderColor: `${action.color}.light`,
                    color: `${action.color}.main`,
                    '&:hover': animations ? {
                      borderColor: `${action.color}.main`,
                      bgcolor: `${action.color}.light`,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    } : {
                      borderColor: `${action.color}.main`,
                      bgcolor: `${action.color}.light`
                    },
                    transition: animations ? 'all 0.3s ease' : 'none'
                  }}
                >
                  <Avatar
                    sx: any,
                      bgcolor: `${action.color}.main`,
                      width: 32,
                      height: 32
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Navigation
          </Typography>
          
          <Grid container spacing={2}>
            {quickLinks.map((link: any: any, index: any: any) => (
              <Grid size={{ xs: 6, sm: 3 }} key={index}>
                <Card
                  sx: any,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${theme.palette[link.color].light}30`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                      border: `1px solid ${theme.palette[link.color].main}50`
                    }
                  }}
                  onClick={() => navigate(link.route)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar
                      sx: any,
                        bgcolor: `${link.color}.main`,
                        width: 40,
                        height: 40,
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      {link.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} color={`${link.color}.main`}>
                      {link.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {link.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            More Actions
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recentActions.map((action: any: any, index: any: any) => (
              <Box key={index}>
                <Button
                  fullWidth
                  variant: any,
                  onClick={action.action}
                  sx: any,
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'left',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Avatar
                    sx: any,
                      color: 'text.secondary',
                      width: 36,
                      height: 36
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Button>
                {index < recentActions.length - 1 && <Divider sx={{ my: 0.5 }} />}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuickActions;
