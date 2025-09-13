import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  useTheme 
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

const SimpleDashboard = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      icon: <InventoryIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Orders',
      value: '567',
      icon: <ShoppingCartIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Total Customers',
      value: '890',
      icon: <PeopleIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'Revenue',
      value: '$12,345',
      icon: <TrendingUpIcon />,
      color: theme.palette.warning.main
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Welcome to TECHNO-ETL
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your data management platform is ready. Navigate using the sidebar to access different modules.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SimpleDashboard;