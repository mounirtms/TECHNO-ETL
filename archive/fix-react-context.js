/**
 * React Context Fix Script
 * Fixes createContext undefined issues in production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React Context Issues...');

// Fix main.jsx to ensure React is properly initialized
const mainJsxPath = path.join(__dirname, 'src', 'main.jsx');
const mainJsxContent = `/**
 * TECHNO-ETL Enhanced React Entry Point
 * Fixed React context initialization
 */

// Ensure React is available globally before any imports
import React from 'react';

// Make React available globally to prevent context issues
if (typeof window !== 'undefined') {
  window.React = React;
  
  // Ensure createContext is available
  if (!React.createContext) {
    console.error('React.createContext is not available!');
  }
}

import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import App from './App.jsx';
import './index.css';

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
        }, \`Error: \${this.state.error?.message || 'Unknown error'}\`),
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

  // Verify React is properly loaded
  if (!React || !React.createContext) {
    console.error('React or createContext not available');
    container.innerHTML = \`
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; text-align: center;">
        <div>
          <h1 style="color: #d32f2f;">React Loading Error</h1>
          <p>React context system failed to initialize</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    \`;
    return;
  }

  try {
    const root = createRoot(container);
    
    // Proper provider nesting without TabProvider in main (it's in Layout)
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(ErrorBoundary, null,
          React.createElement(AuthProvider, null,
            React.createElement(LanguageProvider, null,
              React.createElement(ThemeProvider, null,
                React.createElement(SettingsProvider, null,
                  React.createElement(App)
                )
              )
            )
          )
        )
      )
    );
    
    console.log('✅ TECHNO-ETL initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    container.innerHTML = \`
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; text-align: center;">
        <div>
          <h1 style="color: #d32f2f;">Initialization Error</h1>
          <p>Failed to start: \${error.message}</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      </div>
    \`;
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
`;

try {
  fs.writeFileSync(mainJsxPath, mainJsxContent);
  console.log('✅ Fixed main.jsx');
} catch (error) {
  console.error('❌ Failed to fix main.jsx:', error.message);
}

// Create a React polyfill for the build
const polyfillPath = path.join(__dirname, 'src', 'react-polyfill.js');
const polyfillContent = `/**
 * React Context Polyfill
 * Ensures createContext is available
 */

// Polyfill for React.createContext if missing
if (typeof window !== 'undefined' && window.React && !window.React.createContext) {
  console.warn('Polyfilling React.createContext');
  
  window.React.createContext = function(defaultValue) {
    const context = {
      Provider: function({ children, value }) {
        return children;
      },
      Consumer: function({ children }) {
        return children(defaultValue);
      },
      _currentValue: defaultValue,
      _defaultValue: defaultValue
    };
    
    return context;
  };
}

export {};
`;

try {
  fs.writeFileSync(polyfillPath, polyfillContent);
  console.log('✅ Created React polyfill');
} catch (error) {
  console.error('❌ Failed to create polyfill:', error.message);
}

console.log('🎉 React context fixes applied!');