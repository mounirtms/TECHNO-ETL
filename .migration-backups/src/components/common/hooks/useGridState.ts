// src/components/common/hooks/useGridState.ts
import { useState, useEffect, useCallback } from 'react';

interface UseGridStateProps {
  onRefresh?: (params: { paginationModel: any; sortModel: any; filterModel: any }) => void;
  serverSide?: boolean;
  initialSelection?: any[];
}

/**
 * Custom hook to manage the state of the BaseGrid component.
 */
export const useGridState = ({ onRefresh, serverSide, initialSelection = [] }: UseGridStateProps) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [sortModel, setSortModel] = useState([]);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [selectionModel, setSelectionModel] = useState(initialSelection);

    useEffect(() => {
        setSelectionModel(initialSelection);
    }, [initialSelection]);

    // This effect triggers the onRefresh callback when grid state changes, for server-side data fetching.
    useEffect(() => {
        if (serverSide) {
            onRefresh?.({ paginationModel, sortModel, filterModel });
        }
    }, [paginationModel, sortModel, filterModel, serverSide, onRefresh]);

    const handleSelectionChange = useCallback((newSelectionModel as any) => {
        setSelectionModel(newSelectionModel);
    }, []);

    return {
        paginationModel,
        setPaginationModel,
        sortModel,
        setSortModel,
        filterModel,
        setFilterModel,
        selectionModel,
        handleSelectionChange
    };
};
