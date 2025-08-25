/**
 * DEPRECATED: BaseGrid Component
 *
 * This component is deprecated and will be removed in a future version.
 * Please use UnifiedGrid from '../common/UnifiedGrid' instead.
 *
 * Migration Guide:
 * 1. Replace import: import UnifiedGrid from '../common/UnifiedGrid'
 * 2. Use getStandardGridProps() from '../config/gridConfig' for configuration
 * 3. Update prop names to match UnifiedGrid API
 *
 * @deprecated Use UnifiedGrid instead
 */

import React, { useState, useCallback, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, Tooltip, ToggleButton, ToggleButtonGroup, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRowId, GridSortModel, GridFilterModel, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CustomGridToolbar from './CustomGridToolbar';
import RecordDetailsDialog from './RecordDetailsDialog';
// import SettingsDialog from './CustomGridLayoutSettings'; // Temporarily disabled due to compilation issues
import { generateColumns, applySavedColumnSettings, rowNumberColumn } from '../../utils/gridUtils';
import { HEADER_HEIGHT, FOOTER_HEIGHT, STATS_CARD_HEIGHT } from '../Layout/Constants';
import { StatsCards } from './StatsCards';
import GridCardView from './GridCardView';

// Show deprecation warning in development
if(process.env.NODE_ENV === 'development') {
  console.warn(
    'BaseGrid is deprecated. Please use UnifiedGrid instead. ' +
    'See migration guide in the component documentation.'
  );
}

// Throw error in production to prevent usage
if(process.env.NODE_ENV === 'production') {
  throw new Error(
    'BaseGrid is deprecated and disabled in production. ' +
    'Please migrate to UnifiedGrid from ../common/UnifiedGrid'
  );
}

interface BaseGridProps {
    gridName: string;
    columns: GridColDef[];
    data: any[];
    loading: boolean;
    onRefresh?: (params: any) => Promise<void>;
    childFilterModel?: any;
    filterOptions?: any[];
    currentFilter?: any;
    onFilterChange?: (newFilterModel: GridFilterModel) => void;
    totalCount?: number;
    defaultPageSize?: number;
    totalItemsCount?: number;
    preColumns?: GridColDef[];
    endColumns?: GridColDef[];
    gridCards?: any[];
    showCardView?: boolean;
    initialVisibleColumns?: string[];
    onError?: (error: Error) => void;
    toolbarProps?: any;
    onSelectionChange?: (selectedIds: GridRowId[]) => void;
    getRowId?: (row: any) => GridRowId;
}

const BaseGrid: React.FC<BaseGridProps> = ({
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
    totalItemsCount,
    preColumns = [],
    endColumns = [],
    gridCards = [],
    showCardView = false,
    initialVisibleColumns = [],
    onError,
    toolbarProps,
    onSelectionChange,
    getRowId = (row: any) => row.id,
    ...props
}) => {
    const [columns, setColumns] = useState<GridColDef[]>(gridColumns);
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: defaultPageSize });
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [gridHeight, setGridHeight] = useState('100%');
    const [localLoading, setLocalLoading] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(0);
    const isMounted = useRef(false);
    const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
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
        } catch(error: any) {
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
        } catch(err: any) {
            console.error('Error refreshing grid:', err);
            onError?.(err);
        } finally {
            setLocalLoading(false);
            isMounted.current = false;
        }
    };
    const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
        setPaginationModel(prev => ({ ...prev, page: 0 }));
        setFilterModel(newFilterModel);
        onFilterChange?.(newFilterModel);
    };
    
    const handleSortModelChange = (newSortModel: GridSortModel) => {
        setSortModel((prevSortModel) => {
            // Check if new sort model is different from the previous one
            const isSame = JSON.stringify(prevSortModel) ===JSON.stringify(newSortModel);
            if (isSame) return prevSortModel; // Prevent unnecessary re-renders
    
            return [...newSortModel]; // Only update state if different
        });
    };
    
    

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        console.log("Pagination Changed:", newModel);
        setPaginationModel(newModel);
    };

    const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
        if(newMode !== null) {
            try {
                setViewMode(newMode);
                localStorage.setItem(`${gridName}_viewMode`, newMode);
            } catch(error: any) {
                console.error('Error saving view mode:', error);
            }
        }
    };

    const handleSelectionChange = useCallback((newSelection: GridRowSelectionModel) => {
        setSelectedRows(newSelection);
        onSelectionChange?.(newSelection as GridRowId[]);
    }, [onSelectionChange]);
 
    const getSelectedData = useCallback(() => {
        return safeData.filter((row: any) => (selectedRows as GridRowId[]).includes(getRowId ? getRowId(row) : row.id));
    }, [safeData, selectedRows, getRowId]);

    const handleRowDoubleClick = (params: any) => {
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
            } catch(error: any) {
                console.error('Error loading column settings:', error);
                setColumns(gridColumns);
            }
        };
        loadColumnSettings();
    }, [gridName, gridColumns]);


    // Configure row number column if provided
    if(rowNumberColumn) {
        rowNumberColumn.renderCell = (params) => {
            return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        };
    }


    const finalColumns = useMemo(() => {

        return [rowNumberColumn, ...preColumns, ...columns, ...endColumns];
    }, [columns, preColumns, endColumns]);

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
                display: "flex",
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <CustomGridToolbar
                    onRefresh={handleRefresh}
                    onFilter={handleFilterModelChange}
                    customFilters={filterOptions}
                    currentCustomFilter={currentFilter}
                    onCustomFilterChange={handleFilterModelChange}
                    gridName={gridName}

                    columns={finalColumns}
                    onOpenSettings={() => setSettingsDialogOpen(true)}
                    selectedCount={(selectedRows as GridRowId[]).length}
                    gridMethods={gridMethods}
                    { ...toolbarProps}
                />


                <Box sx={{ display: "flex", display: 'flex', gap: 1, alignItems: 'center' }}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        size="small"
                    >
                        <ToggleButton value="list">
                            <GridViewIcon />
                        </ToggleButton>
                        <ToggleButton value="card">
                            <ViewListIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        ),
    };

    return Boolean((
        <Box sx={{
            display: "flex",
            height: gridHeight,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
        }}>
            {toolbarComponents.toolbar()}
            {viewMode === 'list' ? (<DataGrid
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
                    onFilterModelChange={handleFilterModelChange}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => handleSelectionChange(newSelection)}
                    sortingOrder={['asc', 'desc']}  // Allows sorting in both directions
                    disableMultipleColumnsSorting={false} // Enable multi-column sorting
                    onSortModelChange={handleSortModelChange}
                    getRowId={getRowId}
                    onRowDoubleClick={handleRowDoubleClick}
                    components={toolbarComponents}
                    slotProps={{
                        toolbar: toolbarComponents.toolbar,
                      }}
                    { ...childFilterModel}
                    { ...props}
                />
            ) : (
                <Box sx={{ display: "flex", height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {!showCardView ? (
                        <Box sx={{ display: "flex", flexGrow: 1, overflow: 'auto', p: 1 }}>
                            <GridCardView
                                data={safeData}
                                type={gridName}
                                loading={loading || localLoading}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", flexGrow: 1, overflow: 'auto', p: 1 }}>
                            {safeData.map((row = {}; // Fixed invalid assignment index: any) => (
                                <Box key={getRowId ? getRowId(row) : index}>
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
                <div />
                // <SettingsDialog
                //     open={settingsDialogOpen}
                //     onClose={() => setSettingsDialogOpen(false)}
                //     columns={finalColumns}
                //     gridName={gridName}
                //     defaultColumns={gridColumns}
                //     onSave={async(newSettings) => {
                //         try {
                //             const updatedColumns = columns.map((col: any) => ({
                //                 ...col,
                //                 hide: !newSettings[col.field]?.visible,
                //                 width: newSettings[col.field]?.width || col.width,
                //                 index: newSettings[col.field]?.index
                //             })).sort((a, b) => (a.index || 0) - (b.index || 0))))));

                //             setColumns(updatedColumns);
                //             setSettingsDialogOpen(false);
                //         } catch(error: any) {
                //             console.error('Error applying column settings:', error);
                //             onError?.(error);
                //         }
                //     }}
                // />
            )}
        </Box>
    );
};

export default BaseGrid;