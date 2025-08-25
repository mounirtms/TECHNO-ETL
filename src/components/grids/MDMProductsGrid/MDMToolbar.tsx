import React from 'react';
/**
 * MDM Toolbar Component
 * Professional toolbar for MDM Products Grid with standardized actions
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { 
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

/**
 * MDM Toolbar Configuration
 * Provides standardized toolbar configuration for MDM grid
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Refresh handler function
 * @param {Function} props.onSync - Sync handler function
 * @param {Function} props.onExport - Export handler function
 * @param {boolean} props.loading - Loading state
 * @param {number} props.selectedCount - Number of selected items
 * @returns {Object} Toolbar configuration object
 */
const useMDMToolbarConfig: React.FC<{onRefresh: any, onSync: any, onSyncStocks: any, onSyncAll: any, onExport: any, loading: any: any, selectedCount: any: any, hasChangedData: any: any, : any}> = ({ onRefresh,
  onSync,
  onSyncStocks,
  onSyncAll,
  onExport,
  loading: any,
  selectedCount: any,
  hasChangedData: any,
 }) => {
  return useMemo(() => ({
    showRefresh: true,
    showSync: true,
    showSyncStocks: true, // Always enabled for stock sync
    showSyncAll: hasChangedData, // Only enabled when data has changed
    showExport: false, // Moved to settings menu
    showSearch: false,
    showFilters: false,
    showSettings: true,
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showViewToggle: true,
    compact: false,
    size: 'medium',
    spacing: 1,
    maxWidth: '90%',
    actionAreaWidth: '30%',
    
    // Export options in settings menu
    exportOptions: {
      excel: {
        enabled: true,
        label: 'Export to Excel',
        icon: ExportIcon,
        handler: () => onExport?.('excel')
      },
      csv: {
        enabled: true,
        label: 'Export to CSV',
        icon: ExportIcon,
        handler: () => onExport?.('csv')
      },
      json: {
        enabled: true,
        label: 'Export to JSON',
        icon: ExportIcon,
        handler: () => onExport?.('json')
      }
    },

    // Custom actions for MDM-specific operations
    customActions: [
      {
        id: 'sync',
        label: selectedCount > 0 ? `Sync Selected (${selectedCount})` : 'Sync',
        icon: SyncIcon,
        onClick: onSync,
        disabled: loading,
        tooltip: selectedCount > 0
          ? `Sync ${selectedCount} selected items to Magento`
          : 'Sync selected items to Magento',
        variant: 'contained',
        color: 'primary'
      },
      {
        id: 'syncStocks',
        label: 'Sync Stocks',
        icon: SyncIcon,
        onClick: onSyncStocks,
        disabled: loading,
        tooltip: 'Sync stock quantities from selected source',
        variant: 'outlined',
        color: 'secondary'
      },
      ...(hasChangedData ? [{
        id: 'syncAll',
        label: 'Sync All',
        icon: SyncIcon,
        onClick: onSyncAll,
        disabled: loading,
        tooltip: 'Sync all changed data to Magento',
        variant: 'contained',
        color: 'success'
      }] : [])
    ]
  }), [onRefresh, onSync, onSyncStocks, onSyncAll, onExport, loading, selectedCount, hasChangedData]);
};

/**
 * MDM Custom Actions Configuration
 * Provides MDM-specific action buttons for the toolbar
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onRefresh - Refresh handler function
 * @param {Function} props.onSync - Sync handler function
 * @param {boolean} props.loading - Loading state
 * @param {number} props.selectedCount - Number of selected items
 * @returns {Array} Array of custom action configurations
 */
const useMDMCustomActions: React.FC<{onRefresh: any, onSync: any, onSyncStocks: any, onSyncAll: any, loading: any: any, selectedCount: any: any, hasChangedData: any: any, : any}> = ({ onRefresh,
  onSync,
  onSyncStocks,
  onSyncAll,
  loading: any,
  selectedCount: any,
  hasChangedData: any,
 }) => {
  return useMemo(() => [
    {
      id: 'sync-selected',
      label: selectedCount > 0 ? `Sync (${selectedCount})` : 'Sync',
      icon: SyncIcon,
      onClick: onSync,
      disabled: loading || selectedCount ===0,
      tooltip: selectedCount > 0
        ? `Sync ${selectedCount} selected items to Magento`
        : 'Select items to sync to Magento',
      variant: 'contained',
      color: 'primary',
      size: 'small'
    },
    {
      id: 'sync-stocks',
      label: 'Sync Stocks',
      icon: SyncIcon,
      onClick: onSyncStocks,
      disabled: loading,
      tooltip: 'Sync stock quantities from selected source',
      variant: 'outlined',
      color: 'secondary',
      size: 'small'
    },
    ...(hasChangedData ? [{
      id: 'sync-all',
      label: 'Sync All',
      icon: SyncIcon,
      onClick: onSyncAll,
      disabled: loading,
      tooltip: 'Sync all changed data to Magento',
      variant: 'contained',
      color: 'success',
      size: 'small'
    }] : [])
  ], [onRefresh, onSync, onSyncStocks, onSyncAll, loading, selectedCount, hasChangedData]);
};

/**
 * MDM Context Menu Actions
 * Provides context menu actions for MDM grid rows
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSync - Sync handler function
 * @param {Function} props.onView - View details handler function
 * @param {Function} props.onEdit - Edit handler function
 * @returns {Object} Context menu actions configuration
 */
const useMDMContextMenuActions: React.FC<{onSync: any, onView: any, onEdit: any}> = ({ onSync, onView, onEdit  }) => {
  return useMemo(() => ({
    view: {
      enabled: true,
      label: 'View Details',
      onClick: onView,
      icon: 'visibility'
    },
    edit: {
      enabled: true,
      label: 'Edit Product',
      onClick: onEdit,
      icon: 'edit'
    },
    sync: {
      enabled: true,
      label: 'Sync to Magento',
      onClick: onSync,
      icon: 'sync',
      color: 'primary'
    },
    divider1: { type: 'divider' },
    export: {
      enabled: true,
      label: 'Export Item',
      onClick: (rowData) => {
        // Export single item logic
        console.log('Exporting item:', rowData);
      },
      icon: 'download'
    }
  }), [onSync, onView, onEdit]);
};

export {
  useMDMToolbarConfig,
  useMDMCustomActions,
  useMDMContextMenuActions
};
