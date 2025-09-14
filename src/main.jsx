/**
 * TECHNO-ETL React Entry Point
 * Fixed context initialization and JSX usage
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

// Import contexts in correct order
import { AuthProvider } from './contexts/AuthContext.jsx';
import { PermissionProvider } from './contexts/PermissionContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { RTLProvider } from './contexts/RTLContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';

import App from './App.jsx';
import './index.css';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>
        Application Error
      </h1>
      <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px' }}>
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '12px 24px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Try Again
      </button>
    </div>
  );
}

// Main App with all providers
function AppWithProviders() {
  return (
    <React.StrictMode>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, errorInfo) => {
          console.error('React Error Boundary:', error, errorInfo);
        }}
        onReset={() => {
          // Clear any cached state
          window.location.reload();
        }}
      >
        <AuthProvider>
          <PermissionProvider>
            <LanguageProvider>
              <RTLProvider>
                <ThemeProvider>
                  <SettingsProvider>
                    <App />
                  </SettingsProvider>
                </ThemeProvider>
              </RTLProvider>
            </LanguageProvider>
          </PermissionProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Initialize application
function initializeApp() {
  console.log('🚀 Initializing TECHNO-ETL...');
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('❌ Root container not found');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(<AppWithProviders />);
    
    console.log('✅ TECHNO-ETL initialized successfully');
    
    // Remove loading screen if it exists
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.remove();
        }, 300);
      }
    }, 100);
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    
    // Fallback error display
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; text-align: center; background: #f5f5f5;">
        <div>
          <h1 style="color: #d32f2f; margin-bottom: 16px;">Initialization Error</h1>
          <p style="color: #666; margin-bottom: 24px;">Failed to start application: ${error.message}</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

// Enhanced initialization with proper timing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default browser error handling
});

console.log('📱 TECHNO-ETL entry point loaded');