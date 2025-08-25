import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Enhanced Grid State Management Hook with Performance Optimizations
 * Manages all grid state with persistence, synchronization, and memoization
 */
export const useGridState = (gridName, options = {}) => {
  const {
    enablePersistence
    serverSide
    onStateChange,
    initialState = {}
  } = options;

  // Performance optimization: memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => ({
    enablePersistence,
    serverSide,
    onStateChange,
    initialState
  }), [enablePersistence, serverSide, onStateChange, initialState]);

  // Debounce timer for state persistence
  const persistenceTimerRef = useRef(null);
  const lastPersistedStateRef = useRef(null);

  // Enhanced state management with better defaults
  const [paginationModel, setPaginationModelState] = useState(
    initialState.paginationModel || { page: 0, pageSize: 25 }
  );
  const [sortModel, setSortModelState] = useState(
    initialState.sortModel || []
  );
  const [filterModel, setFilterModelState] = useState(
    initialState.filterModel || { items: [] }
  );
  const [selectedRows, setSelectedRowsState] = useState(
    initialState.selectedRows || []
  );
  const [columnVisibility, setColumnVisibilityState] = useState(
    initialState.columnVisibility || {}
  );
  const [density, setDensityState] = useState(
    initialState.density || 'standard'
  );
  const [columnOrder, setColumnOrderState] = useState(
    initialState.columnOrder || []
  );
  const [pinnedColumns, setPinnedColumnsState] = useState(
    initialState.pinnedColumns || { left: [], right: [] }
  );

  // Additional state for enhanced functionality
  const [viewMode, setViewModeState] = useState(
    initialState.viewMode || 'grid'
  );
  const [searchValue, setSearchValueState] = useState(
    initialState.searchValue || ''
  );
  const [filtersVisible, setFiltersVisibleState] = useState(
    initialState.filtersVisible || false
  );

  const stateRef = useRef({
    paginationModel,
    sortModel,
    filterModel,
    selectedRows,
    columnVisibility,
    density,
    columnOrder,
    pinnedColumns,
    viewMode,
    searchValue,
    filtersVisible
  });

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = {
      paginationModel,
      sortModel,
      filterModel,
      selectedRows,
      columnVisibility,
      density,
      columnOrder,
      pinnedColumns
    };
  }, [paginationModel, sortModel, filterModel, selectedRows, columnVisibility, density, columnOrder, pinnedColumns]);

  // Persistence helpers
  const getStorageKey = useCallback((key) => `grid_${gridName}_${key}`, [gridName]);

  // Debounced save to storage for performance
  const saveToStorage = useCallback((key, value) => {
    if (!enablePersistence || !gridName) return;

    // Clear existing timer
    if(persistenceTimerRef.current) {
      clearTimeout(persistenceTimerRef.current);
    }

    // Debounce the save operation
    persistenceTimerRef.current = setTimeout(() => {
      try {
        const serializedValue = JSON.stringify(value );
        // Only save if value actually changed
        if(lastPersistedStateRef.current?.[key] !== serializedValue) {
          localStorage.setItem(getStorageKey(key ), serializedValue);
          if(!lastPersistedStateRef.current) {
            lastPersistedStateRef.current = {};
          }
          lastPersistedStateRef.current[key] = serializedValue;
        }
      } catch(error) {
        console.warn(`Failed to save grid state for ${key}:`, error);
      }
    }, 300); // 300ms debounce
  }, [enablePersistence, gridName, getStorageKey]);

  const loadFromStorage = useCallback((key, defaultValue) => {
    if (!enablePersistence || !gridName) return defaultValue;
    try {
      const stored = localStorage.getItem(getStorageKey(key ));
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load grid state for ${key}:`, error);
      return defaultValue;
    }
  }, [enablePersistence, gridName, getStorageKey]);

  // Load initial state from storage
  useEffect(() => {
    if (!enablePersistence || !gridName) return;

    const storedPagination = loadFromStorage('pagination', paginationModel);
    const storedSort = loadFromStorage('sort', sortModel);
    const storedFilter = loadFromStorage('filter', filterModel);
    const storedColumnVisibility = loadFromStorage('columnVisibility', columnVisibility);
    const storedDensity = loadFromStorage('density', density);
    const storedColumnOrder = loadFromStorage('columnOrder', columnOrder);
    const storedPinnedColumns = loadFromStorage('pinnedColumns', pinnedColumns);

    setPaginationModelState(storedPagination);
    setSortModelState(storedSort);
    setFilterModelState(storedFilter);
    setColumnVisibilityState(storedColumnVisibility);
    setDensityState(storedDensity);
    setColumnOrderState(storedColumnOrder);
    setPinnedColumnsState(storedPinnedColumns);
  }, [gridName, enablePersistence]); // Only run on mount

  // Enhanced setters with persistence and callbacks
  const setPaginationModel = useCallback((newModel) => {
    setPaginationModelState(newModel );
    saveToStorage('pagination', newModel);
    onStateChange?.({ type: 'pagination', value: newModel, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setSortModel = useCallback((newModel) => {
    setSortModelState(newModel );
    saveToStorage('sort', newModel);
    onStateChange?.({ type: 'sort', value: newModel, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setFilterModel = useCallback((newModel) => {
    setFilterModelState(newModel );
    saveToStorage('filter', newModel);
    onStateChange?.({ type: 'filter', value: newModel, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setSelectedRows = useCallback((newSelection) => {
    setSelectedRowsState(newSelection );
    onStateChange?.({ type: 'selection', value: newSelection, state: stateRef.current });
  }, [onStateChange]);

  const setColumnVisibility = useCallback((newVisibility) => {
    setColumnVisibilityState(newVisibility );
    saveToStorage('columnVisibility', newVisibility);
    onStateChange?.({ type: 'columnVisibility', value: newVisibility, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setDensity = useCallback((newDensity) => {
    setDensityState(newDensity );
    saveToStorage('density', newDensity);
    onStateChange?.({ type: 'density', value: newDensity, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setColumnOrder = useCallback((newOrder) => {
    setColumnOrderState(newOrder );
    saveToStorage('columnOrder', newOrder);
    onStateChange?.({ type: 'columnOrder', value: newOrder, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setPinnedColumns = useCallback((newPinned) => {
    setPinnedColumnsState(newPinned );
    saveToStorage('pinnedColumns', newPinned);
    onStateChange?.({ type: 'pinnedColumns', value: newPinned, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  // Enhanced setters for new state
  const setViewMode = useCallback((newMode) => {
    setViewModeState(newMode );
    saveToStorage('viewMode', newMode);
    onStateChange?.({ type: 'viewMode', value: newMode, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  const setSearchValue = useCallback((newValue) => {
    setSearchValueState(newValue );
    // Don't persist search value as it's typically temporary
    onStateChange?.({ type: 'searchValue', value: newValue, state: stateRef.current });
  }, [onStateChange]);

  const setFiltersVisible = useCallback((newVisible) => {
    setFiltersVisibleState(newVisible );
    saveToStorage('filtersVisible', newVisible);
    onStateChange?.({ type: 'filtersVisible', value: newVisible, state: stateRef.current });
  }, [saveToStorage, onStateChange]);

  // Utility functions
  const resetState = useCallback(() => {
    const defaultState = {
      paginationModel: { page: 0, pageSize: 25 },
      sortModel: [],
      filterModel: { items: [] },
      selectedRows: [],
      columnVisibility: {},
      density: 'standard',
      columnOrder: [],
      pinnedColumns: { left: [], right: [] }
    };

    setPaginationModelState(defaultState.paginationModel);
    setSortModelState(defaultState.sortModel);
    setFilterModelState(defaultState.filterModel);
    setSelectedRowsState(defaultState.selectedRows);
    setColumnVisibilityState(defaultState.columnVisibility);
    setDensityState(defaultState.density);
    setColumnOrderState(defaultState.columnOrder);
    setPinnedColumnsState(defaultState.pinnedColumns);

    // Clear storage
    if(enablePersistence && gridName) {
      Object.keys(defaultState).forEach((key) => {
        localStorage.removeItem(getStorageKey(key ));
      });
    }
  }, [enablePersistence, gridName, getStorageKey]);

  const exportState = useCallback(() => {
    return {
      paginationModel,
      sortModel,
      filterModel,
      selectedRows,
      columnVisibility,
      density,
      columnOrder,
      pinnedColumns
    };
  }, [paginationModel, sortModel, filterModel, selectedRows, columnVisibility, density, columnOrder, pinnedColumns]);

  const importState = useCallback((state) => {
    if (state.paginationModel) setPaginationModel(state.paginationModel);
    if (state.sortModel) setSortModel(state.sortModel);
    if (state.filterModel) setFilterModel(state.filterModel);
    if (state.selectedRows) setSelectedRows(state.selectedRows);
    if (state.columnVisibility) setColumnVisibility(state.columnVisibility);
    if (state.density) setDensity(state.density);
    if (state.columnOrder) setColumnOrder(state.columnOrder);
    if (state.pinnedColumns) setPinnedColumns(state.pinnedColumns);
  }, [setPaginationModel, setSortModel, setFilterModel, setSelectedRows, setColumnVisibility, setDensity, setColumnOrder, setPinnedColumns]);

  return {
    // State values
    paginationModel,
    sortModel,
    filterModel,
    selectedRows,
    columnVisibility,
    density,
    columnOrder,
    pinnedColumns,
    viewMode,
    searchValue,
    filtersVisible,

    // State setters
    setPaginationModel,
    setSortModel,
    setFilterModel,
    setSelectedRows,
    setColumnVisibility,
    setDensity,
    setColumnOrder,
    setPinnedColumns,
    setViewMode,
    setSearchValue,
    setFiltersVisible,

    // Utility functions
    resetState,
    exportState,
    importState,

    // State reference for callbacks
    stateRef
  };
};

export default useGridState;
