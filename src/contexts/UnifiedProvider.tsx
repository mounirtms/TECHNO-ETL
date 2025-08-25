/**
 * Unified Context Provider for TECHNO-ETL
 * Consolidates all contexts to prevent provider nesting hell and optimize performance
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { memo, useMemo, Suspense, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { LanguageProvider } from './LanguageContext';
import { TabProvider } from './TabContext';
import SettingsIntegrator from '../components/common/SettingsIntegrator';
import { Box, CircularProgress, Typography } from '@mui/material';

interface UnifiedProviderProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
}

/**
 * Loading fallback component for contexts
 */
const ContextLoading = memo(() => (
  <Box
    sx={{
      display: "flex",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2,
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress 
      size={40} 
      sx={{
        display: "flex",
        color: 'primary.main',
      }} 
    />
    <Typography 
      variant="body1"
      sx={{
        display: "flex",
        color: 'text.secondary',
        fontWeight: 500,
      }}
    >
      Initializing contexts...
    </Typography>
  </Box>
));

ContextLoading.displayName = 'ContextLoading';

/**
 * Unified Provider that wraps all context providers
 * This reduces nesting and optimizes performance by consolidating providers
 */
const UnifiedProvider: React.FC<UnifiedProviderProps> = memo(({ children, sidebarOpen = true }) => {
  // Memoize provider structure with stable dependencies to prevent unnecessary re-renders
  const providerTree = useMemo(() => {
    console.log('🔄 UnifiedProvider: Creating provider tree');
    
    return (
      <Suspense fallback={<ContextLoading />}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <SettingsProvider>
                <SettingsIntegrator />
                <TabProvider sidebarOpen={sidebarOpen}>
                  <Suspense fallback={<ContextLoading />}>
                    {children}
                  </Suspense>
                </TabProvider>
              </SettingsProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </Suspense>
    );
  }, [sidebarOpen, children]);

  return providerTree;
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return prevProps.sidebarOpen === nextProps.sidebarOpen && 
         prevProps.children === nextProps.children;
});

UnifiedProvider.displayName = 'UnifiedProvider';

export default UnifiedProvider;