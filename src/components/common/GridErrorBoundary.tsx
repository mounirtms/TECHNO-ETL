import React from 'react';
import { Alert, Box, Button, Typography, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class GridErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  override componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error for debugging
    console.error(`Grid Error in ${this.props.gridName}:`, error, errorInfo);
    
    // Call parent error handler if provided
    if(this.props.onError) {
      this.props.onError(error, errorInfo);
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state?.retryCount + 1
    });
    
    // Call retry handler if provided
    if(this.props.onRetry) {
      this.props.onRetry();
  };

  override render() {
    if(this.state.hasError) {
      return (
        <Paper elevation={2} 
          sx={{
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}></
          <ErrorOutline sx={{ display: "flex", fontSize: 48, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Grid Error Occurred
          </Typography>
          
          <Typography variant="outlined" color="text.secondary" paragraph>
            {this.props.gridName && `Grid: ${this.props.gridName}`}
          </Typography>
          
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ display: "flex", mt: 2, mb: 2, textAlign: 'left', width: '100%' }}></
              <Alert severity="error" sx={{ display: "flex", textAlign: 'left' }}>
                <Typography variant="caption" component="div">
                  <strong>Error:</strong> {this.state.error?.message}
                </Typography>
                {this.state.errorInfo?.componentStack && (
                  <Typography variant="caption" component="pre" sx={{ display: "flex", mt: 1, fontSize: '0.7rem' }}>
                    {this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}></
            <Button 
              variant="outlined"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              disabled={this.state?.retryCount >= 3}
            >
              {this.state?.retryCount >= 3 ? 'Max Retries Reached' : 'Retry'}
            </Button>
            
            {this.props.fallbackComponent && (
              <Button variant="outlined"
                onClick={() => this.setState({ hasError: false })}
              >
                Use Fallback
              </Button>
            )}
          </Box>
          
          {this.state?.retryCount > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", mt: 1 }}>
              Retry attempts: {this.state?.retryCount}/3
            </Typography>
          )}
        </Paper>
      );
    // If there's a fallback component and we've exceeded retries, show it
    if(this.state?.retryCount >= 3 && this.props.fallbackComponent) {
      return this.props.fallbackComponent;
    return this.props.children;
export default GridErrorBoundary;
