import React, { useState } from 'react';
import {
    DataGrid,
    GridToolbar
} from '@mui/x-data-grid';
import { Box, Paper } from '@mui/material';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const BaseGrid = ({
    rows = [],
    columns = [],
    loading = false,
    getRowId = (row) => row.id,
    initialState = {},
    ...props
}) => {
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    return (
        <Paper sx={{ width: '100%', height: '100%', p: 2 }}>
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    getRowId={getRowId}
                    pagination
                    paginationMode="client"
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                    components={{
                        Toolbar: GridToolbar
                    }}
                    initialState={{
                        pagination: {
                            pageSize: DEFAULT_PAGE_SIZE,
                        },
                        ...initialState
                    }}
                    disableSelectionOnClick
                    {...props}
                />
            </Box>
        </Paper>
    );
};

export default BaseGrid;
