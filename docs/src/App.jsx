import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Box, Typography } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import MagentoIntegration from './pages/MagentoIntegration';
import ETLIntegration from './pages/ETLIntegration';
import JDEIntegration from './pages/JDEIntegration';
import CEGIDIntegration from './pages/CEGIDIntegration';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/docs">
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'left', flexGrow: 1 }}>
                <img
                  src="images/logo_techno.png"
                  alt="Techno Logo"
                  style={{ height: 40, marginLeft: 10 }}
                />
                
              </Box>
            </Toolbar>
          </AppBar>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/magento-integration" element={<MagentoIntegration />} />
              <Route path="/etl-integration" element={<ETLIntegration />} />
              <Route path="/jde-integration" element={<JDEIntegration />} />
              <Route path="/cegid-integration" element={<CEGIDIntegration />} />
            </Routes>
          </Layout>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
