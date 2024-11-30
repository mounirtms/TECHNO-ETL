import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { getCategoryTree } from '../../services/dataService';
import Box from '@mui/material/Box';
import BaseGrid from '../common/BaseGrid';

const columns = [
    { field: 'name', headerName: 'Category Name', width: 300,
        renderCell: (params) => {
            const level = params.row.level || 0;
            const padding = level * 20;
            return (
                <Box sx={{ pl: padding / 8 }}>
                    {params.value}
                </Box>
            );
        }
    },
    { field: 'url_key', headerName: 'URL Key', width: 200 },
    { field: 'position', headerName: 'Position', width: 100, type: 'number' },
    { 
        field: 'is_active', 
        headerName: 'Status', 
        width: 120,
        type: 'boolean',
        valueFormatter: (params) => params.value ? 'Active' : 'Inactive'
    },
    { 
        field: 'product_count', 
        headerName: 'Products', 
        width: 100, 
        type: 'number',
        valueGetter: (params) => params.row.product_count || 0
    }
];

const CategoryTree = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const data = getCategoryTree();
        const flattenCategories = (cats, level = 0, parentPath = '') => {
            return cats.reduce((acc, cat) => {
                const currentPath = parentPath ? `${parentPath}/${cat.name}` : cat.name;
                const flatCat = {
                    ...cat,
                    id: cat.entity_id,
                    level,
                    path: currentPath
                };
                acc.push(flatCat);
                if (cat.children && cat.children.length > 0) {
                    acc.push(...flattenCategories(cat.children, level + 1, currentPath));
                }
                return acc;
            }, []);
        };

        const flatCategories = flattenCategories(data);
        setCategories(flatCategories);
    }, []);

    return (
        <BaseGrid
            title="Category Tree"
            columns={columns}
            data={categories}
            initialSort={[{ field: 'path', sort: 'asc' }]}
            getRowClassName={(params) => `level-${params.row.level}`}
        />
    );
};

export default CategoryTree;
