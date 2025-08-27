import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Box, Typography } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import { SearchProvider } from './contexts/SearchContext';

// Main Pages
import Home from './pages/Home';
import MagentoIntegration from './pages/MagentoIntegration';
import ETLIntegration from './pages/ETLIntegration';
import JDEIntegration from './pages/JDEIntegration';
import CegidIntegration from './pages/CegidIntegration';

// Documentation Pages
import ProjectOverview from './pages/documentation/ProjectOverview';
import TechnicalArchitecture from './pages/documentation/TechnicalArchitecture';
import ETLProcessDocumentation from './pages/documentation/ETLProcessDocumentation';
import GridSystemDocumentation from './pages/documentation/GridSystemDocumentation';
import APIDocumentation from './pages/documentation/APIDocumentation';
import DashboardSystem from './pages/documentation/DashboardSystem';
import ProductManagement from './pages/documentation/ProductManagement';
import DeploymentGuide from './pages/documentation/DeploymentGuide';
import OptimizedDeploymentGuide from './pages/documentation/OptimizedDeploymentGuide';
import BackendProductionGuide from './pages/documentation/BackendProductionGuide';
import Troubleshooting from './pages/documentation/Troubleshooting';
import ConfigurationSetup from './pages/documentation/ConfigurationSetup';
import SystemOverview from './pages/documentation/SystemOverview';
import GettingStarted from './pages/documentation/GettingStarted';
import FeaturesShowcase from './pages/documentation/FeaturesShowcase';
import SearchResults from './pages/SearchResults';
import SearchHelp from './pages/documentation/SearchHelp';
import ProjectCleanup from './pages/documentation/ProjectCleanup';
import UserSettingsGuide from './pages/documentation/UserSettingsGuide';
import LicensePage from './pages/documentation/LicensePage';
import CompleteProjectSummary from './pages/documentation/CompleteProjectSummary';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <Router basename="/docs">
          <Layout>
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/magento-integration" element={<MagentoIntegration />} />
              <Route path="/etl-integration" element={<ETLIntegration />} />
              <Route path="/jde-integration" element={<JDEIntegration />} />
              <Route path="/cegid-integration" element={<CegidIntegration />} />

              {/* Documentation Pages */}
              <Route path="/docs/project-overview" element={<ProjectOverview />} />
              <Route path="/docs/technical-architecture" element={<TechnicalArchitecture />} />
              <Route path="/docs/etl-process" element={<ETLProcessDocumentation />} />
              <Route path="/docs/grid-system" element={<GridSystemDocumentation />} />
              <Route path="/docs/api-documentation" element={<APIDocumentation />} />
              <Route path="/docs/dashboard-system" element={<DashboardSystem />} />
              <Route path="/docs/system-overview" element={<SystemOverview />} />
              <Route path="/docs/getting-started" element={<GettingStarted />} />
              <Route path="/docs/features-showcase" element={<FeaturesShowcase />} />
              <Route path="/docs/product-management" element={<ProductManagement />} />
              
              {/* Deployment Documentation */}
              <Route path="/docs/deployment-guide" element={<DeploymentGuide />} />
              <Route path="/docs/optimized-deployment" element={<OptimizedDeploymentGuide />} />
              <Route path="/docs/backend-production" element={<BackendProductionGuide />} />
              
              <Route path="/docs/troubleshooting" element={<Troubleshooting />} />
              <Route path="/docs/configuration-setup" element={<ConfigurationSetup />} />
              <Route path="/docs/search-help" element={<SearchHelp />} />
              
              {/* Project Management Documentation */}
              <Route path="/docs/project-cleanup" element={<ProjectCleanup />} />
              <Route path="/docs/user-settings-guide" element={<UserSettingsGuide />} />
              <Route path="/docs/license" element={<LicensePage />} />
              <Route path="/docs/complete-project-summary" element={<CompleteProjectSummary />} />
            </Routes>
          </Layout>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  );
};

export default App;