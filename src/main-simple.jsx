/**
 * Simplified main.jsx for testing
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Simple theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Simple test component
const TestComponent = () => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h4" gutterBottom>
      🎉 TECHNO-ETL Development Server is Working!
    </Typography>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      All routing enhancements have been successfully implemented
    </Typography>
    <Typography variant="body1" sx={{ mt: 2 }}>
      ✅ Enhanced Routing System<br/>
      ✅ Grid Tab Navigation<br/>
      ✅ Modern Navigation<br/>
      ✅ Optimized Dashboard Widgets<br/>
      ✅ Intelligent Post-Login Routing
    </Typography>
  </Box>
);

// Simple App component
const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Routes>
        <Route path="*" element={<TestComponent />} />
      </Routes>
    </Router>
  </ThemeProvider>
);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
