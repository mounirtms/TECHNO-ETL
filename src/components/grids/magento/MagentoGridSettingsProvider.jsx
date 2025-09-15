/**
 * MagentoGridSettingsProvider
 * Provides consistent settings integration across all Magento grid components
 * Handles API settings propagation and error handling configuration
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import { setMagentoApiSettings } from '../../../services/magentoApi';
import {
  getMagentoGridConfig,
  getErrorHandlingConfig,
} from '../../../utils/magentoGridSettingsManager';

const MagentoGridSettingsContext = createContext();

export const useMagentoGridSettings = () => {
  const context = useContext(MagentoGridSettingsContext);

  if (!context) {
    throw new Error('useMagentoGridSettings must be used within a MagentoGridSettingsProvider');
  }

  return context;
};

/**
 * Provider component that wraps Magento grids with settings integration
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.gridType - Type of Magento grid
 */
export const MagentoGridSettingsProvider = ({ children, gridType }) => {
  const { settings, updateSettings } = useSettings();

  // Apply settings to API service when settings change
  useEffect(() => {
    if (settings) {
      setMagentoApiSettings(settings);
    }
  }, [settings]);

  // Get grid-specific configuration
  const gridConfig = useMemo(() => {
    return getMagentoGridConfig(gridType, settings);
  }, [gridType, settings]);

  // Get error handling configuration
  const errorConfig = useMemo(() => {
    return getErrorHandlingConfig(settings);
  }, [settings]);

  // Context value
  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    gridConfig,
    errorConfig,
    gridType,
  }), [settings, updateSettings, gridConfig, errorConfig, gridType]);

  return (
    <MagentoGridSettingsContext.Provider value={contextValue}>
      {children}
    </MagentoGridSettingsContext.Provider>
  );
};

/**
 * HOC to wrap Magento grid components with settings integration
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {string} gridType - Type of Magento grid
 * @returns {React.Component} Enhanced component with settings integration
 */
export const withMagentoGridSettings = (WrappedComponent, gridType) => {
  const EnhancedComponent = (props) => {
    return (
      <MagentoGridSettingsProvider gridType={gridType}>
        <WrappedComponent {...props} />
      </MagentoGridSettingsProvider>
    );
  };

  EnhancedComponent.displayName = `withMagentoGridSettings(${WrappedComponent.displayName || WrappedComponent.name})`;

  return EnhancedComponent;
};

export default MagentoGridSettingsProvider;
