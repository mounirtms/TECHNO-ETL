import React, { useState, useCallback, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CustomGridToolbar from './CustomGridToolbar';
import RecordDetailsDialog from './RecordDetailsDialog';
// import SettingsDialog from './CustomGridLayoutSettings'; // Temporarily disabled due to compilation issues
import { generateColumns, applySavedColumnSettings, rowNumberColumn } from '../../utils/gridUtils';
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT } from '../Layout/Constants';
import { StatsCards } from './StatsCards';
import GridCardView from './GridCardView';
const BaseGrid = ({
    gridName,
    columns: gridColumns,
    data,
    loading,
    onRefresh,
    childFilterModel,
    filterOptions,
    currentFilter,
    onFilterChange,
    totalCount,
    defaultPageSize = 25,
    totalItemsCount = 0,
    preColumns = [],
    endColumns = [],
    gridCards = [],
    showCardView = true,
    initialVisibleColumns = [],
    onError,
    toolbarProps,
    onSelectionChange,
    getRowId = (row) => row.id || row.entity_id,
    ...props
}) => {
    const [columns, setColumns] = useState(gridColumns);
    const [sortModel, setSortModel] = useState([{ field: 'created_at', sort: 'desc' }]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: defaultPageSize });
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [filterModel, setFilterModel] = useState({ items: [] });
    const [gridHeight, setGridHeight] = useState('100%');
    const [localLoading, setLocalLoading] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(0);
    const isMounted = useRef(false);
    const [selectedRows, setSelectedRows] = useState([]);
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
        if (isMounted.current) return;
        isMounted.current = true;
        try {
            setLocalLoading(true);
            isMounted.current = false;
            await onRefresh({
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                sortModel,
                filterModel
            });
        } catch (err) {
            console.error('Error refreshing grid:', err);
            onError?.(err);
        } finally {
            setLocalLoading(false);
            isMounted.current = false;
        }
    };
    const handleFilterChange = (newFilterModel) => {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        setFilterModel(newFilterModel);
    };
    
    const handleSortModelChange = (newSortModel) => {
        setSortModel((prevSortModel) => {
            // Check if new sort model is different from the previous one
            const isSame = JSON.stringify(prevSortModel) === JSON.stringify(newSortModel);
            if (isSame) return prevSortModel; // Prevent unnecessary re-renders
    
            return [...newSortModel]; // Only update state if different
        });
    };
    
    

    const handlePaginationModelChange = (newModel) => {
        console.log("Pagination Changed:", newModel);
        setPaginationModel(newModel);
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

    const handleSelectionChange = useCallback((newSelection) => {
        const selectedSet = new Set(newSelection);
        setSelectedRows(selectedSet);
        onSelectionChange?.(Array.from(selectedSet)); // Pass as an array
    }, [onSelectionChange]);
 
    const getSelectedData = useCallback(() => {
        return safeData.filter(row => selectedRows.includes(getRowId(row)));
    }, [safeData, selectedRows, getRowId]);

    const handleRowDoubleClick = (params) => {
        setSelectedRecord(params.row);
        setDetailsDialogOpen(true);
    };

    const gridMethods = {
        getSelectedData,
        selectedRows,
        setSelectedRows
    };

    useEffect(() => {
        const loadColumnSettings = async () => {
            try {
                const savedColumns = await applySavedColumnSettings(gridName, gridColumns);
                if (savedColumns && Array.isArray(savedColumns)) {
                    setColumns(savedColumns || gridColumns);
                }
            } catch (error) {
                console.error('Error loading column settings:', error);
                setColumns(gridColumns);
            }
        };
        loadColumnSettings();
    }, [gridName, gridColumns]);


    rowNumberColumn.renderCell = (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
    };


    const finalColumns = useMemo(() => {

        return [rowNumberColumn, ...preColumns, ...columns, ...endColumns];
    }, [columns, preColumns, endColumns, selectedRows]);

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
                    selectedCount={selectedRows.size}
                    gridMethods={gridMethods}
                    {...toolbarProps}
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
                    paginationMode={totalCount && totalCount > 0 ? "server" : "client"}
                    sortingMode={totalCount && totalCount > 0 ? "server" : "client"}
                    filterMode={totalCount && totalCount > 0 ? "server" : "client"}
                    rowCount={totalCount && totalCount > 0 ? totalCount : safeData.length}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                    sortModel={sortModel}
                    filterModel={filterModel}
                    onFilterModelChange={handleFilterChange}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => handleSelectionChange(newSelection)}
                    sortingOrder={['asc', 'desc']}  // Allows sorting in both directions
                    disableMultipleColumnsSorting={false} // Enable multi-column sorting
                    onSortModelChange={handleSortModelChange}
                    getRowId={getRowId}
                    onRowDoubleClick={handleRowDoubleClick}
                    components={toolbarComponents}
                    slotProps={{
                        toolbar: {
                          showQuickFilter: true,
                        },
                      }}
                    {...childFilterModel}
                    {...props}
                />
            ) : (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {!showCardView ? (
                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                            <GridCardView
                                data={safeData}
                                type={gridName}
                                loading={loading || localLoading}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                            {safeData.map((row, index) => (
                                <Box key={getRowId(row) || index}>
                                    {JSON.stringify(row)}
                                </Box>
                            ))}
                        </Box>
                    )}

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
            {/* Settings Dialog - Temporarily disabled due to compilation issues */}
            {false && (
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
            )}
        </Box>
    );
};

export default BaseGrid;
