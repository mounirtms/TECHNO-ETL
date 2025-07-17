import React from 'react';
import { TablePagination } from '@mui/material';

const CustomPagination = ({ rowCount, paginationModel, onPaginationModelChange }) => {
    if (!paginationModel) return null;

    // Ensure count is always a valid number
    const validCount = typeof rowCount === 'number' && rowCount >= 0 ? rowCount : 0;

    return (
        <TablePagination
            component="div"
            count={validCount}
            page={paginationModel.page}
            onPageChange={(event, newPage) => {
                onPaginationModelChange({ ...paginationModel, page: newPage });
            }}
            rowsPerPage={paginationModel.pageSize}
            onRowsPerPageChange={(event) => {
                onPaginationModelChange({ pageSize: parseInt(event.target.value, 10), page: 0 });
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Rows per page:"
        />
    );
};

export default CustomPagination;
