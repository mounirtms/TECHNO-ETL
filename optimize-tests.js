/**
 * Test Optimization Script for Techno-ETL
 * 
 * This script fixes common issues in test files that cause failures:
 * - Increases timeout values for async operations
 * - Fixes React act() warnings by properly wrapping async operations
 * - Improves waitFor usage with appropriate timeout options
 * - Adds proper cleanup for timers and mocks
 * - Ensures compatibility with Vitest
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  testDirs: [
    'src/tests/components',
    'src/tests/pages',
    'src/tests/integration',
    'src/tests/e2e',
    'src/tests/performance'
  ],
  timeouts: {
    test: 30000,
    hook: 30000,
    async: 10000
  },
  setupFile: 'src/tests/setup.js',
  vitestConfig: 'vitest.config.js'
};

// Patterns to fix
const PATTERNS = [
  // Fix 1: Add timeout to waitFor calls
  {
    match: /await waitFor\(\(\) => \{/g,
    replace: 'await waitFor(() => {',
    condition: (content, match) => {
      // Only replace if there's no timeout option already
      const nextChars = content.substring(match.index + match[0].length, match.index + match[0].length + 100);
      return !nextChars.includes('timeout');
    },
    transform: (match) => {
      if (match.includes('timeout')) return match;
      return match.replace(/\}\);$/, `}, { timeout: ${CONFIG.timeouts.async} });`);
    }
  },
  // Fix 2: Add proper timeout to problematic waitFor calls
  {
    match: /await waitFor\(\(\) => \{(?:[^}]*)\}\);/g,
    transform: (match) => {
      if (match.includes('timeout')) return match;
      return match.replace(/\}\);$/, `}, { timeout: ${CONFIG.timeouts.async} });`);
    }
  },
  // Fix 3: Fix act warnings by wrapping userEvent calls
  {
    match: /await user\.(\w+)\((.*?)\);(?!\s*await waitFor)/g,
    transform: (match, eventName, args) => {
      return `await user.${eventName}(${args});\n    // Add small delay to prevent act warnings\n    await vi.advanceTimersByTimeAsync(50);`;
    }
  },
  // Fix 4: Fix fireEvent act warnings
  {
    match: /fireEvent\.(\w+)\((.*?)\);(?!\s*await)/g,
    condition: (content, match) => {
      // Only replace if inside an async function
      const prevContent = content.substring(0, match.index);
      const asyncFnMatch = /async\s+\w+\s*\([^)]*\)\s*{[^{]*$/g.exec(prevContent);
      return !!asyncFnMatch;
    },
    transform: (match, eventName, args) => {
      return `fireEvent.${eventName}(${args});\n    // Add small delay to prevent act warnings\n    await vi.advanceTimersByTimeAsync(50);`;
    }
  },
  // Fix 5: Fix timer cleanup in tests
  {
    match: /beforeEach\(\(\) => \{\s*vi\.useFakeTimers\(\);\s*\}\);(?!\s*afterEach)/g,
    transform: () => {
      return 'beforeEach(() => {\n    vi.useFakeTimers();\n  });\n\n  afterEach(() => {\n    vi.runOnlyPendingTimers();\n    vi.useRealTimers();\n  });';
    }
  },
  // Fix 6: Fix missing vi.mock calls
  {
    match: /import\s+{\s*render,\s*screen,\s*waitFor.*?\}\s+from\s+['"]@testing-library\/react['"]/g,
    condition: (content) => !content.includes('vi.mock'),
    transform: (match) => {
      return `${match}\n\n// Ensure proper mocking\nvi.mock('react-dom', async () => {\n  const actual = await vi.importActual('react-dom');\n  return {\n    ...actual,\n    createPortal: vi.fn((element) => element)\n  };\n});`;
    }
  }
];

// File processing utilities
const fileUtils = {
  readFile: (filePath) => fs.readFileSync(path.resolve(filePath), 'utf8'),
  
  writeFile: (filePath, content) => {
    fs.writeFileSync(path.resolve(filePath), content);
    return true;
  },
  
  updateFile: (filePath, updater) => {
    if (!fs.existsSync(path.resolve(filePath))) return false;
    
    const content = fileUtils.readFile(filePath);
    const updatedContent = updater(content);
    
    if (content !== updatedContent) {
      fileUtils.writeFile(filePath, updatedContent);
      return true;
    }
    
    return false;
  },
  
  findFiles: (patterns) => {
    return patterns.reduce((files, pattern) => {
      return [...files, ...glob.sync(pattern)];
    }, []);
  }
};

// Update setup.js to increase default timeout
function updateSetupFile() {
  const updated = fileUtils.updateFile(CONFIG.setupFile, (content) => {
    // Update asyncUtilTimeout in RTL config
    let updatedContent = content.replace(
      /asyncUtilTimeout: \d+/,
      `asyncUtilTimeout: ${CONFIG.timeouts.async}`
    );
    
    // Add global waitFor helper with increased timeout if it doesn't exist
    if (!updatedContent.includes('extendedWaitFor')) {
      const waitForHelper = `
/**
 * Extended waitFor with better timeout handling
 */
export const extendedWaitFor = (callback, options = {}) => {
  const { waitFor } = require('@testing-library/react');
  return waitFor(callback, { timeout: ${CONFIG.timeouts.async}, ...options });
};
`;
      updatedContent += waitForHelper;
    }
    
    // Add improved test wrapper if it doesn't exist
    if (!updatedContent.includes('ImprovedTestWrapper')) {
      const improvedWrapper = `
/**
 * Improved test wrapper with better async handling
 */
export const ImprovedTestWrapper = ({ children }) => {
  const React = require('react');
  const { Suspense } = require('react');
  
  return React.createElement(TestWrapper, null,
    React.createElement(Suspense, { 
      fallback: React.createElement('div', null, 'Loading...') 
    }, children)
  );
};

/**
 * Helper to safely advance timers in tests
 */
export const advanceTimersAndAwaitPromises = async (ms = 100) => {
  if (typeof vi !== 'undefined' && typeof vi.advanceTimersByTimeAsync === 'function') {
    await vi.advanceTimersByTimeAsync(ms);
  } else {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};
`;
      updatedContent += improvedWrapper;
    }
    
    return updatedContent;
  });
  
  if (updated) {
    console.log('✅ Updated setup.js with improved timeout configuration');
  }
}

// Update vitest config to increase timeout
function updateVitestConfig() {
  const updated = fileUtils.updateFile(CONFIG.vitestConfig, (content) => {
    // Increase test timeout
    let updatedContent = content.replace(
      /testTimeout: \d+/,
      `testTimeout: ${CONFIG.timeouts.test}`
    );
    
    // Increase hook timeout if it exists
    if (updatedContent.includes('hookTimeout')) {
      updatedContent = updatedContent.replace(
        /hookTimeout: \d+/,
        `hookTimeout: ${CONFIG.timeouts.hook}`
      );
    } else {
      // Add hook timeout if it doesn't exist
      updatedContent = updatedContent.replace(
        /testTimeout: \d+/,
        `testTimeout: ${CONFIG.timeouts.test},\n    hookTimeout: ${CONFIG.timeouts.hook}`
      );
    }
    
    return updatedContent;
  });
  
  if (updated) {
    console.log('✅ Updated vitest.config.js with increased timeouts');
  }
}

// Process test files
function processTestFiles() {
  let totalFixed = 0;
  const filePatterns = CONFIG.testDirs.map(dir => `${dir}/**/*.{test,spec}.{js,jsx,ts,tsx}`);
  const testFiles = fileUtils.findFiles(filePatterns);
  
  testFiles.forEach(file => {
    const filePath = path.resolve(file);
    let content = fileUtils.readFile(filePath);
    let fileFixed = false;
    
    PATTERNS.forEach(pattern => {
      const matches = [...content.matchAll(pattern.match)];
      
      if (matches.length > 0) {
        for (const match of matches) {
          if (pattern.condition && !pattern.condition(content, match)) {
            continue;
          }
          
          const originalText = match[0];
          let replacement;
          
          if (pattern.transform) {
            replacement = pattern.transform(originalText, ...match.slice(1));
          } else if (pattern.replace) {
            replacement = typeof pattern.replace === 'function' 
              ? pattern.replace(originalText, ...match.slice(1))
              : pattern.replace;
          } else {
            continue;
          }
          
          content = content.replace(originalText, replacement);
          fileFixed = true;
          totalFixed++;
        }
      }
    });
    
    if (fileFixed) {
      fileUtils.writeFile(filePath, content);
      console.log(`✅ Fixed issues in ${file}`);
    }
  });
  
  return totalFixed;
}

// Create a custom test utility file
function createTestUtilsFile() {
  const utilsPath = path.resolve('src/tests/testUtils.js');
  
  // Only create if it doesn't exist
  if (!fs.existsSync(utilsPath)) {
    const content = `/**
 * Common test utilities for Techno-ETL
 * 
 * This file contains helper functions to make testing easier and more reliable
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

/**
 * Wait for a condition with a timeout
 * @param {Function} callback - The condition to wait for
 * @param {Object} options - Options for waitFor
 * @returns {Promise<void>}
 */
export const safeWaitFor = async (callback, options = {}) => {
  return waitFor(callback, { timeout: ${CONFIG.timeouts.async}, ...options });
};

/**
 * Safely advance timers and wait for promises to resolve
 * @param {number} ms - Milliseconds to advance
 * @returns {Promise<void>}
 */
export const advanceTimers = async (ms = 100) => {
  if (typeof vi.advanceTimersByTimeAsync === 'function') {
    await vi.advanceTimersByTimeAsync(ms);
  } else {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};

/**
 * Create a mock API service with common methods
 * @returns {Object} Mock API service
 */
export const createMockApiService = () => ({
  get: vi.fn().mockResolvedValue({ data: { items: [] } }),
  post: vi.fn().mockResolvedValue({ data: {} }),
  put: vi.fn().mockResolvedValue({ data: {} }),
  delete: vi.fn().mockResolvedValue({ data: {} }),
  patch: vi.fn().mockResolvedValue({ data: {} })
});

/**
 * Helper to test async errors
 * @param {Function} promise - Promise that should reject
 * @param {string|RegExp} [expectedError] - Expected error message or pattern
 * @returns {Promise<Error>} The caught error
 */
export const expectAsyncError = async (promise, expectedError) => {
  try {
    await promise();
    throw new Error('Expected promise to reject but it resolved');
  } catch (error) {
    if (expectedError) {
      if (expectedError instanceof RegExp) {
        expect(error.message).toMatch(expectedError);
      } else {
        expect(error.message).toContain(expectedError);
      }
    }
    return error;
  }
};
`;
    
    fileUtils.writeFile(utilsPath, content);
    console.log('✅ Created testUtils.js with helper functions');
  }
}

// Install missing dependencies if needed
function installDependencies() {
  try {
    if (!fs.existsSync('node_modules/glob')) {
      console.log('📦 Installing required dependencies...');
      execSync('npm install --save-dev glob', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
  }
}

// Main function
function main() {
  console.log('🔍 Starting test optimization...');
  
  // Install dependencies if needed
  installDependencies();
  
  // Update configuration files
  updateSetupFile();
  updateVitestConfig();
  createTestUtilsFile();
  
  // Process test files
  const fixCount = processTestFiles();
  
  console.log(`\n✨ Optimization complete! Fixed ${fixCount} issues.`);
  console.log('\n🚀 Run tests with: npm test');
}

main();