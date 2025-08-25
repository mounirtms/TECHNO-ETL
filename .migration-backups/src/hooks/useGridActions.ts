import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface UseGridActionsProps {
  onRefresh?: () => Promise<void> | void;
  onAdd?: () => Promise<void> | void;
  onEdit?: (selectedRows: any[]) => Promise<void> | void;
  onDelete?: (selectedRows: any[]) => Promise<void> | void;
  onSync?: () => Promise<void> | void;
  onExport?: (data: any[], selectedRows: any[]) => Promise<void> | void;
  onSearch?: (searchValue: string) => Promise<void> | void;
  selectedRows?: any[];
  data?: any[];
  gridName?: string;
  searchableFields?: string[];
}

/**
 * Enhanced Grid Actions Hook
 * Provides standardized action handlers for grid operations
 */
export const useGridActions = ({
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onSync,
  onExport,
  onSearch,
  selectedRows = [],
  data = [],
  gridName,
  searchableFields = ['sku', 'name', 'Code_MDM', 'reference']
}: UseGridActionsProps) => {
  // Refresh handler with error handling
  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh?.();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  }, [onRefresh]);

  // Add handler
  const handleAdd = useCallback(async () => {
    try {
      await onAdd?.();
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to add record');
    }
  }, [onAdd]);

  // Edit handler
  const handleEdit = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select a record to edit');
      return;
    }
    
    try {
      await onEdit?.(selectedRows);
    } catch (error) {
      console.error('Error editing record:', error);
      toast.error('Failed to edit record');
    }
  }, [onEdit, selectedRows]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select records to delete');
      return;
    }
    
    try {
      await onDelete?.(selectedRows);
      toast.success(`Deleted ${selectedRows.length} record(s)`);
    } catch (error) {
      console.error('Error deleting records:', error);
      toast.error('Failed to delete records');
    }
  }, [onDelete, selectedRows]);

  // Sync handler
  const handleSync = useCallback(async () => {
    try {
      await onSync?.();
      toast.success('Sync completed successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    }
  }, [onSync]);

  // Export handler
  const handleExport = useCallback(async () => {
    try {
      const exportData = selectedRows.length > 0
        ? data.filter(item => selectedRows.includes(item?.id || item?.entity_id))
        : data;

      await onExport?.(exportData, selectedRows);
      toast.success(`Exported ${exportData.length} record(s)`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  }, [onExport, selectedRows, data]);

  // Search handler
  const handleSearch = useCallback(async (searchValue as any) => {
    try {
      if (onSearch) {
        // Use custom search logic if provided
        await onSearch(searchValue);
      } else if (searchValue.trim()) {
        // Default search behavior - show info about what would be searched
        const fieldsText = searchableFields.join(', ');
        toast.info(`Searching in: ${fieldsText}`);
        console.log(`Search "${searchValue}" in fields:`, searchableFields);
      }
    } catch (error) {
      console.error('Error searching data:', error);
      toast.error('Search failed');
    }
  }, [onSearch, searchableFields]);

  return {
    handleRefresh,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSync,
    handleExport,
    handleSearch
  };
};
