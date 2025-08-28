import React from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../config/routes';

const RouteTestPage = () => {
  // List of routes to test
  const testRoutes = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD },
    { name: 'MDM Products', path: ROUTES.MDM_PRODUCTS },
    { name: 'MDM Stock', path: ROUTES.MDM_STOCK },
    { name: 'MDM Sources', path: ROUTES.MDM_SOURCES },
    { name: 'Categories', path: ROUTES.CATEGORIES },
    { name: 'Stocks', path: ROUTES.STOCKS },
    { name: 'Sources', path: ROUTES.SOURCES },
    { name: 'Invoices', path: ROUTES.INVOICES },
    { name: 'CMS Pages', path: ROUTES.CMS_PAGES },
    { name: 'License Management', path: ROUTES.LICENSE_MANAGEMENT },
    { name: 'License Status', path: ROUTES.LICENSE_STATUS },
    { name: 'Data Grids', path: '/data-grids' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Route Testing Page
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Test all routes to verify they're working correctly
      </Typography>
      
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <List>
          {testRoutes.map((route, index) => (
            <ListItem 
              key={index} 
              divider={index < testRoutes.length - 1}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemText 
                primary={route.name} 
                secondary={route.path}
              />
              <Link 
                component={RouterLink} 
                to={route.path}
                sx={{ ml: 2 }}
              >
                Visit Page
              </Link>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default RouteTestPage;