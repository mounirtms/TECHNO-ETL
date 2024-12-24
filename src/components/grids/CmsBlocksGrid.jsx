import React, { useState, useCallback } from 'react';
import BaseGrid from '../common/BaseGrid';
import { Box } from '@mui/material';
import { formatDateTime } from '../../utils/formatters';
import magentoApi from '../../services/magentoApi';
import { toast } from 'react-toastify';

const CmsBlocksGrid = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({ is_active: true });

    const columns = [
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'identifier', headerName: 'Identifier', width: 200 },
        { 
            field: 'creation_time', 
            headerName: 'Creation Date', 
            width: 180,
            valueGetter: (params) => params.row.creation_time,
            valueFormatter: (params) => formatDateTime(params.value)
        }
    ];

    const fetchBlocks = useCallback(async ({ page = 0, pageSize = 10 } = {}) => {
        setLoading(true);
        try {
            const params = {
                filterGroups: [
                    {
                        filters: [
                            {
                                field: 'is_active',
                                value: '1',
                                condition_type: 'eq'
                            }
                        ]
                    }
                ],
                pageSize,
                currentPage: page + 1
            };
            const response = await magentoApi.getCmsBlocks(params);
            setData(response.items || []);
        } catch (error) {
            toast.error('Failed to fetch CMS blocks');
        } finally {
            setLoading(false);
        }
    }, []);

    return (
            <BaseGrid
                gridName="CmsBlocksGrid"
                columns={columns}
                data={data}
                loading={loading}
                onRefresh={fetchBlocks}
                currentFilter={filters}
                onFilterChange={setFilters}
                getRowId={(row) => row.identifier}
                defaultSortModel={[
                    { field: 'creation_time', sort: 'desc' }
                ]}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50, 100]}
                onRowDoubleClick={(params) => {
                    // Handle double click to view details
                    window.alert(`Viewing details for: ${params.row.title}`);
                }}
            />
    
    );
};

export default CmsBlocksGrid;
