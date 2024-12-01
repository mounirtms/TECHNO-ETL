import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography 
} from '@mui/material';
import { 
  TreeView, 
  TreeItem 
} from '@mui/x-tree-view';
import { 
  ExpandMore as ExpandMoreIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';
import DataService from '../../services/dataService';

const CategoryTree = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryTree = await DataService.getCategoryTree();
        setCategories(categoryTree);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch category tree:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderTree = (nodes) => (
    nodes.map((node) => (
      <TreeItem 
        key={node.entity_id} 
        nodeId={node.entity_id.toString()} 
        label={node.name}
      >
        {node.children && node.children.length > 0 
          ? renderTree(node.children) 
          : null}
      </TreeItem>
    ))
  );

  if (loading) {
    return <Typography>Loading categories...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography variant="h6">Error Loading Categories</Typography>
        <Typography>{error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Category Hierarchy
      </Typography>
      <TreeView
        aria-label="category tree"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ 
          flexGrow: 1, 
          maxWidth: '100%', 
          overflowY: 'auto' 
        }}
      >
        {renderTree(categories)}
      </TreeView>
    </Box>
  );
};

export default CategoryTree;
