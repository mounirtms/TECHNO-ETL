/**
 * Context Bundling Fix Script
 * Fixes React createContext bundling issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Context Bundling Issues...');

// 1. Create a React context wrapper to ensure proper initialization
const contextWrapperPath = path.join(__dirname, 'src', 'utils', 'contextWrapper.js');
const contextWrapperContent = `/**
 * React Context Wrapper
 * Ensures createContext is properly available
 */

import React from 'react';

// Ensure React is properly initialized
if (!React.createContext) {
  console.error('React.createContext is not available!');
  throw new Error('React context system not properly initialized');
}

// Safe context creator with error handling
export const createSafeContext = (defaultValue, displayName) => {
  try {
    const context = React.createContext(defaultValue);
    if (displayName) {
      context.displayName = displayName;
    }
    return context;
  } catch (error) {
    console.error('Failed to create context:', displayName, error);
    throw error;
  }
};

// Context hook wrapper with better error messages
export const useSafeContext = (context, contextName) => {
  const value = React.useContext(context);
  if (value === undefined) {
    throw new Error(\`\${contextName} must be used within its Provider\`);
  }
  return value;
};

export default React;
`;

// Create utils directory if it doesn't exist
const utilsDir = path.join(__dirname, 'src', 'utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

try {
  fs.writeFileSync(contextWrapperPath, contextWrapperContent);
  console.log('✅ Created context wrapper');
} catch (error) {
  console.error('❌ Failed to create context wrapper:', error.message);
}

// 2. Fix ThemeContext
const themeContextPath = path.join(__dirname, 'src', 'contexts', 'ThemeContext.jsx');
let themeContextContent = fs.readFileSync(themeContextPath, 'utf8');

// Replace createContext import
themeContextContent = themeContextContent.replace(
  /import React, { createContext,/,
  'import React, { createContext,'
);

// Add safe context creation
themeContextContent = themeContextContent.replace(
  /const ThemeContext = createContext\(\);/,
  `// Safe context creation with error handling
const ThemeContext = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = 'ThemeContext';
    return context;
  } catch (error) {
    console.error('Failed to create ThemeContext:', error);
    throw error;
  }
})();`
);

try {
  fs.writeFileSync(themeContextPath, themeContextContent);
  console.log('✅ Fixed ThemeContext');
} catch (error) {
  console.error('❌ Failed to fix ThemeContext:', error.message);
}

// 3. Fix LanguageContext
const languageContextPath = path.join(__dirname, 'src', 'contexts', 'LanguageContext.jsx');
let languageContextContent = fs.readFileSync(languageContextPath, 'utf8');

languageContextContent = languageContextContent.replace(
  /const LanguageContext = createContext\(\);/,
  `// Safe context creation with error handling
const LanguageContext = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = 'LanguageContext';
    return context;
  } catch (error) {
    console.error('Failed to create LanguageContext:', error);
    throw error;
  }
})();`
);

try {
  fs.writeFileSync(languageContextPath, languageContextContent);
  console.log('✅ Fixed LanguageContext');
} catch (error) {
  console.error('❌ Failed to fix LanguageContext:', error.message);
}

// 4. Fix SettingsContext
const settingsContextPath = path.join(__dirname, 'src', 'contexts', 'SettingsContext.jsx');
let settingsContextContent = fs.readFileSync(settingsContextPath, 'utf8');

settingsContextContent = settingsContextContent.replace(
  /const SettingsContext = createContext\(\);/,
  `// Safe context creation with error handling
const SettingsContext = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = 'SettingsContext';
    return context;
  } catch (error) {
    console.error('Failed to create SettingsContext:', error);
    throw error;
  }
})();`
);

try {
  fs.writeFileSync(settingsContextPath, settingsContextContent);
  console.log('✅ Fixed SettingsContext');
} catch (error) {
  console.error('❌ Failed to fix SettingsContext:', error.message);
}

// 5. Fix AuthContext
const authContextPath = path.join(__dirname, 'src', 'contexts', 'AuthContext.jsx');
let authContextContent = fs.readFileSync(authContextPath, 'utf8');

authContextContent = authContextContent.replace(
  /const AuthContext = createContext\(\);/,
  `// Safe context creation with error handling
const AuthContext = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = 'AuthContext';
    return context;
  } catch (error) {
    console.error('Failed to create AuthContext:', error);
    throw error;
  }
})();`
);

try {
  fs.writeFileSync(authContextPath, authContextContent);
  console.log('✅ Fixed AuthContext');
} catch (error) {
  console.error('❌ Failed to fix AuthContext:', error.message);
}

// 6. Fix TabContext
const tabContextPath = path.join(__dirname, 'src', 'contexts', 'TabContext.jsx');
let tabContextContent = fs.readFileSync(tabContextPath, 'utf8');

tabContextContent = tabContextContent.replace(
  /const TabContext = createContext\(\);/,
  `// Safe context creation with error handling
const TabContext = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = 'TabContext';
    return context;
  } catch (error) {
    console.error('Failed to create TabContext:', error);
    throw error;
  }
})();`
);

try {
  fs.writeFileSync(tabContextPath, tabContextContent);
  console.log('✅ Fixed TabContext');
} catch (error) {
  console.error('❌ Failed to fix TabContext:', error.message);
}

console.log('🎉 Context bundling fixes applied!');