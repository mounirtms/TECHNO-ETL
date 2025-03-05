import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    IconButton
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CustomGridToolbar from './CustomGridToolbar';
import RecordDetailsDialog from './RecordDetailsDialog';
import SettingsDialog from './CustomGridLyoutSettings';
import { generateColumns, mergeColumns, applySavedColumnSettings } from '../../utils/gridUtils';
import {
    HEADER_HEIGHT,
    FOOTER_HEIGHT,
    DASHBOARD_TAB_HEIGHT,
    STATS_CARD_HEIGHT,
    staticPrimaryKeys
} from '../Layout/Constants';
import { StatsCards } from './StatsCards';
import GridCardView from './GridCardView';

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
    gridCards = [],
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
    const [viewMode, setViewMode] = useState(() => {
        try {
            return localStorage.getItem(`${gridName}_viewMode`) || 'list';
        } catch {
            return 'list';
        }
    });

    const safeData = useMemo(() => {
        try {
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error processing data:', error);
            onError?.(error);
            return [];
        }
    }, [data, onError]);

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

    const handleViewModeChange = (event, newMode) => {
        if (newMode !== null) {
            try {
                setViewMode(newMode);
                localStorage.setItem(`${gridName}_viewMode`, newMode);
            } catch (error) {
                console.error('Error saving view mode:', error);
            }
        }
    };

    const handleRowDoubleClick = (params) => {
        setSelectedRecord(params.row);
        setDetailsDialogOpen(true);
    };

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

    useEffect(() => {
        const calculateGridHeight = () => {
            const windowHeight = window.innerHeight;
            const tabPanelHeight = windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT;
            const calculatedHeight = gridCards && gridCards.length > 0
                ? tabPanelHeight - STATS_CARD_HEIGHT
                : tabPanelHeight;
            setGridHeight(`${calculatedHeight}px`);
        };

        calculateGridHeight();
        window.addEventListener('resize', calculateGridHeight);
        return () => window.removeEventListener('resize', calculateGridHeight);
    }, [gridCards]);

    const toolbarComponents = {
        toolbar: () => (
            <Box sx={{
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <CustomGridToolbar
                    onRefresh={handleRefresh}
                    onFilter={handleFilterChange}
                    customFilters={filterOptions}
                    currentCustomFilter={currentFilter}
                    onCustomFilterChange={handleFilterChange}
                    gridName={gridName}
                    columns={finalColumns}
                    onOpenSettings={() => setSettingsDialogOpen(true)}
                />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        size="small"
                    >
                        <ToggleButton value="list" aria-label="list view">
                            <Tooltip title="List View">
                                <ViewListIcon />
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="grid" aria-label="grid view">
                            <Tooltip title="Grid View">
                                <GridViewIcon />
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        )
    };

    return (
        <Box sx={{
            height: gridHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
            {toolbarComponents.toolbar()}
            {viewMode === 'list' ? (
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
                    components={toolbarComponents}
                    {...props}
                />
            ) : (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                   <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                        <GridCardView
                            data={safeData}
                            type={gridName}
                            loading={loading || localLoading}
                        />
                    </Box>
                </Box>
            )}

            <RecordDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                record={selectedRecord}
            />
            {gridCards && gridCards.length > 0 && (
                <StatsCards cards={gridCards} />
            )}
            <SettingsDialog
                open={settingsDialogOpen}
                onClose={() => setSettingsDialogOpen(false)}
                columns={finalColumns}
                gridName={gridName}
                defaultColumns={gridColumns}
                onSave={async (newSettings) => {
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
                        onError?.(error);
                    }
                }}
            />
        </Box>
    );
};

export default BaseGrid;
