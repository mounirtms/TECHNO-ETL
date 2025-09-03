import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Unified Grid System
import UnifiedGrid from '../../common/UnifiedGrid';
import { getStandardGridProps, getStandardToolbarConfig } from '../../../config/gridConfig';
import { ColumnFactory } from '../../../utils/ColumnFactory.jsx';

// Services
import magentoApi from '../../../services/magentoApi';

/**
 * ProductAttributesGrid - Comprehensive Product Attributes Management
 * Similar to Magento Backend Catalog > Attributes > Product
 */
const ProductAttributesGrid = () => {
  // ===== STATE MANAGEMENT =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    system: 0,
    userDefined: 0,
    required: 0,
  });

  // ===== COLUMN DEFINITIONS =====
  const columns = useMemo(() => [
    ColumnFactory.text('attribute_code', {
      headerName: 'Attribute Code',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontFamily="monospace">
            {params.value}
          </Typography>
        </Box>
      ),
    }),
    ColumnFactory.text('frontend_label', {
      headerName: 'Default Label',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LabelIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    }),
    {
      field: 'frontend_input',
      headerName: 'Input Type',
      width: 120,
      renderCell: (params) => {
        const inputTypeColors = {
          text: 'default',
          textarea: 'info',
          select: 'primary',
          multiselect: 'secondary',
          boolean: 'success',
          date: 'warning',
          price: 'error',
        };

        return (
          <Chip
            label={params.value}
            color={inputTypeColors[params.value] || 'default'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'is_required',
      headerName: 'Required',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'error' : 'default'}
          size="small"
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'is_user_defined',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Custom' : 'System'}
          color={params.value ? 'primary' : 'secondary'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'scope',
      headerName: 'Scope',
      width: 100,
      renderCell: (params) => {
        const scopeColors = {
          global: 'success',
          website: 'warning',
          store: 'info',
        };

        return (
          <Chip
            label={params.value}
            color={scopeColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewAttribute(params.row)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Attribute">
            <IconButton
              size="small"
              onClick={() => handleEditAttribute(params.row)}
              disabled={!params.row.is_user_defined}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Manage Options">
            <IconButton
              size="small"
              onClick={() => handleManageOptions(params.row)}
              disabled={!['select', 'multiselect'].includes(params.row.frontend_input)}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], []);

  // ===== DATA FETCHING =====
  const fetchAttributes = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching product attributes...', params);

      const response = await magentoApi.getProductAttributes(params);

      console.log('📦 Product attributes response:', response);

      const attributes = response?.items || [];

      setData(attributes);
      updateStats(attributes);

    } catch (error) {
      console.error('❌ Error fetching product attributes:', error);
      toast.error('Failed to load product attributes');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== STATISTICS UPDATE =====
  const updateStats = useCallback((attributes) => {
    const newStats = attributes.reduce((acc, attr) => ({
      total: acc.total + 1,
      system: acc.system + (!attr.is_user_defined ? 1 : 0),
      userDefined: acc.userDefined + (attr.is_user_defined ? 1 : 0),
      required: acc.required + (attr.is_required ? 1 : 0),
    }), {
      total: 0,
      system: 0,
      userDefined: 0,
      required: 0,
    });

    setStats(newStats);
  }, []);

  // ===== EVENT HANDLERS =====
  const handleViewAttribute = useCallback((attribute) => {
    console.log('👁️ Viewing attribute:', attribute);
    setSelectedAttribute(attribute);
    setEditDialogOpen(true);
  }, []);

  const handleEditAttribute = useCallback((attribute) => {
    console.log('✏️ Editing attribute:', attribute);
    setSelectedAttribute(attribute);
    setEditDialogOpen(true);
  }, []);

  const handleManageOptions = useCallback((attribute) => {
    console.log('⚙️ Managing options for attribute:', attribute);
    toast.info(`Managing options for ${attribute.frontend_label}`);
  }, []);

  const handleCreateAttribute = useCallback(() => {
    console.log('➕ Creating new attribute');
    setSelectedAttribute(null);
    setCreateDialogOpen(true);
  }, []);

  // ===== EFFECTS =====
  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <UnifiedGrid
        {...getStandardGridProps('productAttributes', {
          // Data
          data,
          columns,
          loading,

          // Grid identification
          gridName: 'ProductAttributesGrid',

          // Configuration
          toolbarConfig: getStandardToolbarConfig('productAttributes'),

          // Stats cards
          showStatsCards: true,
          gridCards: [
            {
              title: 'Total Attributes',
              value: stats.total,
              icon: LabelIcon,
              color: 'primary',
            },
            {
              title: 'System Attributes',
              value: stats.system,
              icon: SettingsIcon,
              color: 'secondary',
            },
            {
              title: 'Custom Attributes',
              value: stats.userDefined,
              icon: CodeIcon,
              color: 'info',
            },
            {
              title: 'Required',
              value: stats.required,
              icon: EditIcon,
              color: 'error',
            },
          ],

          // Event handlers
          onRefresh: fetchAttributes,
          onAdd: handleCreateAttribute,
          onRowDoubleClick: (params) => handleViewAttribute(params.row),

          // Row configuration
          getRowId: (row) => row.attribute_id,

          // Error handling
          onError: (error) => {
            console.error('Product Attributes Grid Error:', error);
            toast.error('Error in product attributes grid');
          },
        })}
      />

      {/* Attribute Edit/View Dialog */}
      <AttributeDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        attribute={selectedAttribute}
        onSave={(updatedAttribute) => {
          console.log('💾 Saving attribute:', updatedAttribute);
          toast.success('Attribute updated successfully');
          fetchAttributes();
          setEditDialogOpen(false);
        }}
      />

      {/* Create Attribute Dialog */}
      <AttributeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        attribute={null}
        onSave={(newAttribute) => {
          console.log('➕ Creating attribute:', newAttribute);
          toast.success('Attribute created successfully');
          fetchAttributes();
          setCreateDialogOpen(false);
        }}
      />
    </Box>
  );
};

// ===== ATTRIBUTE DIALOG COMPONENT =====
const AttributeDialog = ({ open, onClose, attribute, onSave }) => {
  const [formData, setFormData] = useState({
    attribute_code: '',
    frontend_label: '',
    frontend_input: 'text',
    is_required: false,
    is_user_defined: true,
    scope: 'global',
  });

  useEffect(() => {
    if (attribute) {
      setFormData(attribute);
    } else {
      setFormData({
        attribute_code: '',
        frontend_label: '',
        frontend_input: 'text',
        is_required: false,
        is_user_defined: true,
        scope: 'global',
      });
    }
  }, [attribute]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {attribute ? `Edit Attribute: ${attribute.frontend_label}` : 'Create New Attribute'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Attribute Code"
            value={formData.attribute_code}
            onChange={(e) => setFormData({ ...formData, attribute_code: e.target.value })}
            disabled={!!attribute}
            fullWidth
          />
          <TextField
            label="Default Label"
            value={formData.frontend_label}
            onChange={(e) => setFormData({ ...formData, frontend_label: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Input Type</InputLabel>
            <Select
              value={formData.frontend_input}
              onChange={(e) => setFormData({ ...formData, frontend_input: e.target.value })}
            >
              <MenuItem value="text">Text Field</MenuItem>
              <MenuItem value="textarea">Text Area</MenuItem>
              <MenuItem value="select">Dropdown</MenuItem>
              <MenuItem value="multiselect">Multiple Select</MenuItem>
              <MenuItem value="boolean">Yes/No</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="price">Price</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Scope</InputLabel>
            <Select
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            >
              <MenuItem value="global">Global</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="store">Store View</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
            }
            label="Required"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {attribute ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductAttributesGrid;
