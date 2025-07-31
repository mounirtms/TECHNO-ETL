import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Box, Typography } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import MagentoIntegration from './pages/MagentoIntegration';
import ETLIntegration from './pages/ETLIntegration';
import JDEIntegration from './pages/JDEIntegration';
import CegidIntegration from './pages/CegidIntegration';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/docs">
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Techno Stationery Integrations Documentation 
              </Typography>
            </Toolbar>
          </AppBar>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/magento-integration" element={<MagentoIntegration />} />
              <Route path="/etl-integration" element={<ETLIntegration />} />
              <Route path="/jde-integration" element={<JDEIntegration />} />
              <Route path="/cegid-integration" element={<CegidIntegration />} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
