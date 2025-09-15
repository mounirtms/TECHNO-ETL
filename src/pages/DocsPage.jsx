/**
 * Documentation Page Component
 * Serves the interactive documentation website from the same domain
 *
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import {
  Book as BookIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DocsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Handle navigation to docs
  const handleGoToDocs = () => {
    // Navigate to the docs route on the same domain
    window.location.href = '/docs/';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          elevation: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <BookIcon
            sx={{
              fontSize: 80,
              color: 'primary.main',
              mb: 3,
            }}
          />

          <Typography variant="h4" component="h1" gutterBottom>
            TECHNO-ETL Documentation
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Access the comprehensive interactive documentation for TECHNO-ETL.
            The documentation includes API guides, component examples, and developer resources.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              You will be redirected to the documentation section of this application.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoToDocs}
            >
              Access Documentation
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="text"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Documentation includes:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Component API Reference<br />
              • Grid System Documentation<br />
              • Integration Guides<br />
              • Development Guidelines<br />
              • Deployment Instructions
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocsPage;
