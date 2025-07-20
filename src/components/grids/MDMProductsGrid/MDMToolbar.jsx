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
const useMDMToolbarConfig = ({ 
  onRefresh, 
  onSync, 
  onExport, 
  loading = false, 
  selectedCount = 0 
}) => {
  return useMemo(() => ({
    showRefresh: true,
    showSync: true,
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
        label: selectedCount > 0 ? `Sync Selected (${selectedCount})` : 'Sync All',
        icon: SyncIcon,
        onClick: onSync,
        disabled: loading,
        tooltip: selectedCount > 0 
          ? `Sync ${selectedCount} selected items to Magento`
          : 'Sync all items to Magento',
        variant: 'contained',
        color: 'primary'
      }
    ]
  }), [onRefresh, onSync, onExport, loading, selectedCount]);
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
const useMDMCustomActions = ({ 
  onRefresh, 
  onSync, 
  loading = false, 
  selectedCount = 0 
}) => {
  return useMemo(() => [
  
    {
      id: 'sync-mdm',
      label: selectedCount > 0 ? `Sync (${selectedCount})` : 'Sync All',
      icon: SyncIcon,
      onClick: onSync,
      disabled: loading,
      tooltip: selectedCount > 0 
        ? `Sync ${selectedCount} selected items to Magento`
        : 'Sync all items to Magento',
      variant: 'contained',
      color: 'primary',
      size: 'small'
    }
  ], [onRefresh, onSync, loading, selectedCount]);
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
const useMDMContextMenuActions = ({ onSync, onView, onEdit }) => {
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
