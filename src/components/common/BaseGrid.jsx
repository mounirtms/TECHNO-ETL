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
    defaultPageSize = 25,
    totalItemsCount = 0,
    preColumns = [],
    endColumns = [],
    gridCards = [],  // Default to an empty array if gridCards is not passed
    initialVisibleColumns = [],
    onError,
    getRowId = (row) => row.id || row.entity_id,
    ...props
}) => {
    const [columns, setColumns] = useState(gridColumns);
    const [sortModel, setSortModel] = useState([{ field: 'created_at', sort: 'desc' }]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: defaultPageSize });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [gridHeight, setGridHeight] = useState('100%');
    const [localLoading, setLocalLoading] = useState(false);

    const safeData = useMemo(() => {
        return Array.isArray(data) ? data : [];
    }, [data]);

    // Handle refresh with loading state
    const handleRefresh = async () => {
        if (!onRefresh) return;

        try {
            setLocalLoading(true);
            await onRefresh({
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                sortModel,
                filterModel: {
                    items: currentFilter ? [{
                        field: 'name',
                        operator: 'contains',
                        value: currentFilter
                    }] : []
                }
            });
        } catch (err) {
            console.error('Error refreshing grid:', err);
            onError?.(err);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        if (onFilterChange) {
            onFilterChange(newFilter);
            setPaginationModel(prev => ({ ...prev, page: 0 }));
            handleRefresh();
        }
    };

    const handlePaginationModelChange = (newModel) => {
        setPaginationModel(newModel);
        handleRefresh();
    };

    const handleSortModelChange = (newSortModel) => {
        setSortModel(newSortModel);
        handleRefresh();
    };

    // Initial data load
    useEffect(() => {
        handleRefresh();
    }, [currentFilter]); // Refresh when filter changes

    // Load saved column settings
    useEffect(() => {
        const loadColumnSettings = async () => {
            try {
                const savedColumns = await applySavedColumnSettings(gridName, gridColumns);
                if (savedColumns && Array.isArray(savedColumns)) {
                    setColumns(savedColumns);
                }
            } catch (error) {
                console.error('Error loading column settings:', error);
                setColumns(gridColumns);
            }
        };
        loadColumnSettings();
    }, [gridName, gridColumns]);

    const finalColumns = useMemo(() => {
        return [...preColumns, ...columns, ...endColumns].map(col => ({
            ...col,
            flex: col.flex || undefined,
            width: col.width || 150,
            minWidth: col.minWidth || 100
        }));
    }, [preColumns, columns, endColumns]);

    const handleSettingsSave = async (newSettings) => {
        try {
            const updatedColumns = columns.map(col => ({
                ...col,
                hide: !newSettings[col.field]?.visible,
                width: newSettings[col.field]?.width || col.width,
                index: newSettings[col.field]?.index
            })).sort((a, b) => (a.index || 0) - (b.index || 0));

            setColumns(updatedColumns);
            setSettingsDialogOpen(false);
        } catch (error) {
            console.error('Error applying column settings:', error);
        }
    };

    const handleRowDoubleClick = (params) => {
        setSelectedRecord(params.row);
        setDetailsDialogOpen(true);
    };

    const handleOpenSettingsDialog = () => {
        setSettingsDialogOpen(true);
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
                rows={safeData}
                columns={finalColumns}
                loading={loading || localLoading}
                rowCount={totalCount || safeData.length}
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
            {/* Conditionally render StatsCards at the top */}
            {gridCards && gridCards.length > 0 && (
                <StatsCards cards={gridCards} />
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
                onSave={handleSettingsSave}
            />
        </Box>
    );
};

export default BaseGrid;
