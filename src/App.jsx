import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import Layout from './components/Layout';
import Login from './pages/Login';
import Toast from './components/common/Toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // If we have a user, render the protected route
  if (currentUser) {
    return children;
  }

  // Otherwise redirect to login, but save the attempted location
  return <Navigate to="/login" state={{ from: location }} replace />;
};

// PublicRoute component (for login page)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a user and we're not loading, redirect to the intended destination or dashboard
    if (currentUser && !loading) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [currentUser, loading, location.state?.from, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Only render public route if we don't have a user
  return !currentUser ? children : null;
};

function App() {
  const [mode, setMode] = useState('light');
  const [direction, setDirection] = useState('ltr');
  const theme = getTheme(mode, direction);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleDirection = () => {
    setDirection((prevDir) => (prevDir === 'ltr' ? 'rtl' : 'ltr'));
  };

  return (
    <CacheProvider value={direction === 'rtl' ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toast />
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout
                    mode={mode}
                    direction={direction}
                    onToggleMode={toggleColorMode}
                    onToggleDirection={toggleDirection}
                  />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
