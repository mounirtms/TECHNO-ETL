import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  override override override componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  override override override render() {
    if(this.state.hasError) {
      return (
        <Box
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 2,
            border: '1px dashed red',
            borderRadius: 1,
          }}
        >
          <ErrorIcon color="error" sx={{ display: "flex", fontSize: 48 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography variant="body2" sx={{ display: "flex", mb: 2 }}>
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
