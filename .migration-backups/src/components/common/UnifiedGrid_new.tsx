/**
 * UnifiedGrid - Wrapper for BaseGrid
 * Maintains backward compatibility while using the new BaseGrid system
 * 
 * @deprecated Use BaseGrid directly for new implementations
 */
import React, { forwardRef } from 'react';
import BaseGrid from '../grids/BaseGrid';
import ComponentErrorBoundary from './ComponentErrorBoundary';

/**
 * UnifiedGrid - Backward compatibility wrapper
 * @deprecated Use BaseGrid directly for new implementations
 */
const UnifiedGrid = forwardRef((props, ref) => {
  // Map old props to new BaseGrid props
  const {
    gridName = 'UnifiedGrid',
    columns = [],
    data = [],
    loading = false,
    getRowId = (row: any) => row.id || row.entity_id,
    gridCards = [],
    showStatsCards = false,
    toolbarConfig,
    customActions = [],
    contextMenuActions = [],
    ...otherProps
  } = props;

  const mappedProps = {
    gridName,
    columns,
    data,
    loading,
    getRowId,
    showStatsCards,
    statsCards: gridCards,
    toolbarConfig,
    customActions,
    contextMenuActions,
    ...otherProps
  };

  return (
    <ComponentErrorBoundary 
      componentName="UnifiedGrid"
      fallbackMessage="Grid temporarily unavailable"
    >
      <BaseGrid ref={ref} {...mappedProps} />
    </ComponentErrorBoundary>
  );
});

UnifiedGrid.displayName = 'UnifiedGrid';

export default UnifiedGrid;
