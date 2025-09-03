import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GridOptimizer } from '../../utils/componentOptimizer';

export const useOptimizedGridState = (initialState = {}) => {
  // Initialize grid state with optimized defaults
  const [gridState, setGridState] = useState(() => ({
    ...GridOptimizer.createOptimizedState(initialState),
  }));

  // Track pending updates for batching
  const pendingUpdates = useRef(new Set());
  const updateTimeout = useRef(null);

  // Performance monitoring
  const renderCount = useRef(0);
  const lastUpdateTime = useRef(Date.now());

  // Batch updates for better performance
  const batchStateUpdate = useCallback((updates) => {
    updates.forEach(update => pendingUpdates.current.add(update));
    
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    updateTimeout.current = setTimeout(() => {
      setGridState(prev => {
        const nextState = { ...prev };
        pendingUpdates.current.forEach(update => {
          Object.assign(nextState, typeof update === 'function' ? update(prev) : update);
        });
        pendingUpdates.current.clear();
        return nextState;
      });
    }, 0);
  }, []);

  // Optimized state updaters
  const updateState = useCallback((update) => {
    batchStateUpdate([update]);
  }, [batchStateUpdate]);

  // Monitor render performance
  useEffect(() => {
    renderCount.current += 1;
    const timeSinceLastUpdate = Date.now() - lastUpdateTime.current;
    
    if (timeSinceLastUpdate < 16) { // 60fps threshold
      console.warn('Grid state updating too frequently');
    }
    
    lastUpdateTime.current = Date.now();
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, []);

  // Memoized state selectors
  const selectors = useMemo(() => ({
    getFilterModel: () => gridState.filterModel,
    getSortModel: () => gridState.sortModel,
    getPageSize: () => gridState.pageSize,
    getCurrentPage: () => gridState.page,
  }), [gridState]);

  // Memoized state updaters
  const actions = useMemo(() => ({
    setFilterModel: (filterModel) => updateState({ filterModel }),
    setSortModel: (sortModel) => updateState({ sortModel }),
    setPageSize: (pageSize) => updateState({ pageSize }),
    setCurrentPage: (page) => updateState({ page }),
    
    // Batch update multiple properties
    batchUpdate: (updates) => batchStateUpdate(updates),
    
    // Reset state
    resetState: () => setGridState(GridOptimizer.createOptimizedState(initialState)),
  }), [updateState, batchStateUpdate, initialState]);

  return {
    state: gridState,
    ...selectors,
    ...actions,
  };
};

export default useOptimizedGridState;