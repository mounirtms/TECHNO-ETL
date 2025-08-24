/**
 * TECHNO-ETL React Entry Point
 * Simple and reliable initialization
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// Enhanced error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }
      }, [
        React.createElement('h1', { 
          key: 'title',
          style: { color: '#d32f2f', marginBottom: '16px' } 
        }, 'Application Error'),
        React.createElement('p', { 
          key: 'message',
          style: { color: '#666', marginBottom: '24px' } 
        }, `Error: ${this.state.error?.message || 'Unknown error'}`),
        React.createElement('button', {
          key: 'button',
          onClick: () => window.location.reload(),
          style: {
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }
        }, 'Refresh Page')
      ]);
    }

    return this.props.children;
  }
}

// Initialize app with proper context nesting
function initApp() {
  console.log('🚀 Initializing TECHNO-ETL with fixed contexts...');
  
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root container not found');
    return;
  }



  try {
    const root = createRoot(container);
    
    // Simple initialization - all providers are handled in UnifiedProvider within App
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, null,
          React.createElement(App)
        )
      )
    );
    
    console.log('✅ TECHNO-ETL initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; text-align: center;">
        <div>
          <h1 style="color: #d32f2f;">Initialization Error</h1>
          <p>Failed to start: ${error.message}</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}

// Enhanced initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

console.log('📱 React context system initialized');
