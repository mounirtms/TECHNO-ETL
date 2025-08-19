import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 2,
            border: '1px dashed red',
            borderRadius: 1,
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {this.props.name ? `The ${this.props.name} component has crashed.` : 'A component has crashed.'}
          </Typography>
          <Button variant="outlined" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
