import { memo, useState, useCallback, useMemo } from 'react';
import { Box, Card, IconButton, Tooltip, Typography, Button } from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ComponentOptimizer } from '../../utils/componentOptimizer';
import BaseComponent from '../base/BaseComponent';

const CategoryManager = memo(() => {
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState(null);

  // Handlers
  const handleToggle = useCallback((_, nodeIds) => {
    setExpanded(nodeIds);
  }, []);

  const handleSelect = useCallback((_, nodeId) => {
    setSelected(nodeId);
  }, []);

  // Memoized renderers
  const renderTree = useCallback((node) => (
    <TreeItem
      key={node.id}
      nodeId={node.id.toString()}
      label={
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 0.5,
          '&:hover .actions': { 
            opacity: 1,
          },
        }}>
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {node.name}
          </Typography>
          <Box 
            className="actions"
            sx={{ 
              opacity: 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Add subcategory">
              <IconButton size="small">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit category">
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete category">
              <IconButton size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
    >
      {Array.isArray(node.children)
        ? node.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  ), []);

  // Sample data structure
  const categoryTree = useMemo(() => ({
    id: 1,
    name: 'Root',
    children: [
      {
        id: 2,
        name: 'Electronics',
        children: [
          {
            id: 3,
            name: 'Smartphones',
            children: [],
          },
          {
            id: 4,
            name: 'Laptops',
            children: [],
          },
        ],
      },
      {
        id: 5,
        name: 'Clothing',
        children: [
          {
            id: 6,
            name: 'Men',
            children: [],
          },
          {
            id: 7,
            name: 'Women',
            children: [],
          },
        ],
      },
    ],
  }), []);

  return (
    <BaseComponent>
      <Card sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Category Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* Add root category handler */}}
          >
            Add Root Category
          </Button>
        </Box>

        <TreeView
          expanded={expanded}
          selected={selected}
          onNodeToggle={handleToggle}
          onNodeSelect={handleSelect}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{
            flexGrow: 1,
            maxWidth: '100%',
            overflowY: 'auto',
            '& .MuiTreeItem-root': {
              '& .MuiTreeItem-content': {
                padding: '4px 0',
              },
            },
          }}
        >
          {renderTree(categoryTree)}
        </TreeView>
      </Card>
    </BaseComponent>
  );
});

// Add display name for debugging
CategoryManager.displayName = 'CategoryManager';

// Export optimized component
export default ComponentOptimizer.optimizeComponent(CategoryManager);