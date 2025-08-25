import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'build',
      'coverage',
      'archive',
      'backend/node_modules',
      '*.config.js',
      '*.config.ts'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        sourceType: 'module'
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint
    },
    rules: {
      // React specific
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      
      // TypeScript specific - relaxed for migration
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      
      // General - relaxed
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'prefer-const': 'off',
      'no-var': 'warn',
      'no-irregular-whitespace': 'off',
      'no-useless-escape': 'off',
      
      // React Refresh
      'react-refresh/only-export-components': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];