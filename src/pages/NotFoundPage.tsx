import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md"></
      <Box sx={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3
        }}>
        <ErrorOutlineIcon 
          sx={{
            opacity: 0.6
          }} 
        /></
        
        <Typography variant="h1" component="h1" sx={{ display: "flex", fontSize: '6rem', fontWeight: 'bold', color: 'text.secondary' }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ display: "flex", maxWidth: 500 }}>
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to a safe location.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}></
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="small"
            onClick={handleGoBack}
            size="small"
};

export default NotFoundPage;
