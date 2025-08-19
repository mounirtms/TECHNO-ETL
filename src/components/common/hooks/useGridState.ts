// src/components/common/hooks/useGridState.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage the state of the BaseGrid component.
 * @param {object} props - The props passed to the hook.
 * @param {function} props.onRefresh - Callback to refresh data.
 * @param {boolean} props.serverSide - Flag for server-side operations.
 * @param {Array} props.initialSelection - Initial selected rows.
 * @returns {object} - The state and state handlers for the grid.
 */
export const useGridState = ({ onRefresh, serverSide, initialSelection = [] }) => {
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

    const handleSelectionChange = useCallback((newSelectionModel) => {
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
