import React from 'react';
import { TablePagination } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomPagination = ({ rowCount, totalCount, paginationModel, onPaginationModelChange }) => {
  const { translate, currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  if (!paginationModel) return null;

  // Prioritize totalCount over rowCount, ensure count is always a valid number
  const count = totalCount ?? rowCount;
  const validCount = (typeof count === 'number' && !isNaN(count) && count >= 0) ? count : 0;

  return (
    <TablePagination
      component="div"
      count={validCount}
      page={paginationModel.page || 0}
      onPageChange={(event, newPage) => {
        onPaginationModelChange({ ...paginationModel, page: newPage });
      }}
      rowsPerPage={paginationModel.pageSize || 25}
      onRowsPerPageChange={(event) => {
        onPaginationModelChange({ pageSize: parseInt(event.target.value, 10), page: 0 });
      }}
      rowsPerPageOptions={[10, 25, 50, 100]}
      labelRowsPerPage={translate('grid.rowsPerPage') || 'Rows per page:'}
      labelDisplayedRows={({ from, to, count }) =>
        translate('grid.displayedRows')
          ? translate('grid.displayedRows').replace('{from}', from).replace('{to}', to).replace('{count}', count)
          : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
      }
      sx={{
        '& .MuiTablePagination-toolbar': {
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        '& .MuiTablePagination-spacer': {
          order: isRTL ? 1 : 0,
        },
        '& .MuiTablePagination-selectLabel': {
          order: isRTL ? 3 : 2,
        },
        '& .MuiTablePagination-select': {
          order: isRTL ? 2 : 3,
        },
        '& .MuiTablePagination-displayedRows': {
          order: isRTL ? 0 : 4,
        },
        '& .MuiTablePagination-actions': {
          order: isRTL ? 4 : 5,
          '& button': {
            transform: isRTL ? 'scaleX(-1)' : 'none',
          },
        },
      }}
    />
  );
};

export default CustomPagination;
