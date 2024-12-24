import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CustomGridToolbar from './CustomGridToolbar';
import RecordDetailsDialog from './RecordDetailsDialog';
import SettingsDialog from './CustomGridLyoutSettings';
import { generateColumns, mergeColumns, applySavedColumnSettings, getGridSettings } from '../../utils/gridUtils';
import {
    HEADER_HEIGHT,
    FOOTER_HEIGHT,
    DASHBOARD_TAB_HEIGHT,
    STATS_CARD_HEIGHT, staticPrimaryKeys
} from '../Layout/Constants';
import { StatsCards } from './StatsCards';

// Inside BaseGrid.js
const BaseGrid = ({
    gridName,
    columns: gridColumns,
    data,
    loading,
    onRefresh,
    filterOptions,
    currentFilter,
    onFilterChange,
    totalCount,
    defaultPageSize,
    totalItemsCount = 0,
    preColumns = [],
    endColumns = [],
    gridCards = [],  // Default to an empty array if gridCards is not passed
    initialVisibleColumns = [],
    onError,
    getRowId = (row) => {
        return row[staticPrimaryKeys[gridName]];
    },
    ...props
}) => {
    const [columns, setColumns] = useState(() => applySavedColumnSettings(gridName, gridColumns));
    const [sortModel, setSortModel] = useState([{ field: 'created_at', sort: 'desc' }]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const safeData = Array.isArray(data) ? data : [];
    const [pageSize, setPageSize] = useState(defaultPageSize);  // Page size state
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [gridHeight, setGridHeight] = useState('100%');

    const finalColumns = useMemo(() => {
        return [...preColumns, ...gridColumns, ...endColumns];
    }, [preColumns, gridColumns, endColumns, data]);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        try {
            await onRefresh({ page: paginationModel.page, pageSize: paginationModel.pageSize });
        } catch (err) {
            onError?.(err);
        }
    };

    const handleFilterChange = (newFilter) => {
        onFilterChange?.(newFilter);
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        handleRefresh();
    };

    const handlePaginationModelChange = (newModel) => {
        setPaginationModel(newModel);
        handleRefresh();
    };

    const handleSortModelChange = (newSortModel) => {
        setSortModel(newSortModel);
        handleRefresh();
    };

    const handleRowDoubleClick = (params) => {
        setSelectedRecord(params.row);
        setDetailsDialogOpen(true);
    };

    const handleOpenSettingsDialog = () => {
        setSettingsDialogOpen(true);
    };

    const handleSelectionModelChange = (newSelectionModel) => {
        setSelectionModel(newSelectionModel);
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleRefresh(); // Call handleRefresh to fetch data on mount
        };

        const calculateGridHeight = () => {
            const windowHeight = window.innerHeight;
            const tabPanelHeight = windowHeight
                - HEADER_HEIGHT
                - FOOTER_HEIGHT;

            // Adjust grid height if stat cards exist
            const calculatedHeight = gridCards && gridCards.length > 0
                ? tabPanelHeight - STATS_CARD_HEIGHT  // Leave space for stats cards
                : tabPanelHeight;  // Use full space if no stats cards

            setGridHeight(`${calculatedHeight}px`);
        };

        fetchData();
        calculateGridHeight();

        // Recalculate on window resize
        window.addEventListener('resize', calculateGridHeight);

        // Cleanup listener
        return () => window.removeEventListener('resize', calculateGridHeight);
    }, [gridCards]); // Depend on gridCards to recalculate height when cards appear/disappear

    return (
        <Box sx={{
            height: gridHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>

            <DataGrid
                pageSize={defaultPageSize}
                loading={loading}
                rowCount={totalCount}
                onPageChange={(newPage) => onRefresh({ page: newPage, pageSize: defaultPageSize })}
                pagination
                filterModel={{
                    items: [
                        {
                            field: 'name',
                            operator: 'contains',
                            value: currentFilter,
                            id: 'name-filter'
                        }
                    ]
                }}
                rows={safeData}
                columns={finalColumns}
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                sortModel={sortModel}
                onSortModelChange={handleSortModelChange}
                getRowId={getRowId}
                onRowDoubleClick={handleRowDoubleClick}
                slots={{
                    toolbar: () => (
                        <CustomGridToolbar
                            onRefresh={handleRefresh}
                            onFilter={handleFilterChange}
                            customFilters={filterOptions}
                            currentCustomFilter={currentFilter}
                            onCustomFilterChange={handleFilterChange}
                            gridName={gridName}
                            columns={finalColumns}
                            onOpenSettings={handleOpenSettingsDialog}
                        />
                    ),
                }}
                {...props}
            />

            {/* Conditionally render StatsCards */}
            {gridCards && gridCards.length > 0 && (
                <StatsCards
                    cards={gridCards}
                />
            )}

            <RecordDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                record={selectedRecord}
            />

            <SettingsDialog
                open={settingsDialogOpen}
                onClose={() => setSettingsDialogOpen(false)}
                columns={finalColumns}
                gridName={gridName}
                defaultColumns={gridColumns}
                onSave={(newSettings) => {
                    setColumns(prevColumns =>
                        prevColumns.map(col => ({
                            ...col,
                            visible: newSettings[col.field]?.visible ?? true,
                        }))
                    );
                }}
            />
        </Box>
    );
};

export default BaseGrid;
