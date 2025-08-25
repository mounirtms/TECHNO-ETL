/**
 * Professional Voting Grid - SQL-backed voting system
 * Advanced voting interface with comprehensive features
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Stack,
  Badge,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  Add,
  Search,
  FilterList,
  Sort,
  Refresh,
  Settings,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Lightbulb,
  BugReport,
  Speed,
  Palette,
  Link,
  Security
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import votingApiService from '../../services/votingApiService';
import GridSettings, { useGridSettings } from '../common/GridSettings';

// Category icons mapping
const CATEGORY_ICONS = {
  'Feature Request': Lightbulb,
  'Bug Report': BugReport,
  'Performance': Speed,
  'UI/UX': Palette,
  'Integration': Link,
  'Security': Security
};

// Status colors mapping
const STATUS_COLORS = {
  'Proposed': '#2196F3',
  'In Review': '#FF9800',
  'Approved': '#4CAF50',
  'In Development': '#9C27B0',
  'Testing': '#FF5722',
  'Completed': '#4CAF50',
  'Rejected': '#F44336'
};

// Priority colors mapping
const PRIORITY_COLORS = {
  'Low': '#4CAF50',
  'Medium': '#FF9800',
  'High': '#FF5722',
  'Critical': '#F44336'
};

const ProfessionalVotingGrid: React.FC<{userId = 'anonymous': any}> = ({ userId = 'anonymous'  }) => {
  const theme = useTheme();

  // Grid settings hook
  const { settings: gridSettings, saveSettings, settingsLoaded } = useGridSettings('voting-grid', {
    pageSize: 25,
    density: 'standard',
    showToolbar: true,
    enableFiltering: true,
    enableSorting: true,
    enableExport: true
  });

  // State management
  const [features, setFeatures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Pagination and filtering
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [totalCount, setTotalCount] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'vote_count', sort: 'desc' }]);
  const [filterModel, setFilterModel] = useState({
    category: '',
    status: '',
    priority: '',
    search: ''
  });
  
  // UI state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  /**
   * Load voting features with current filters and pagination
   */
  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        page: paginationModel.page + 1, // API uses 1-based pagination
        pageSize: paginationModel.pageSize,
        category: filterModel.category || undefined,
        status: filterModel.status || undefined,
        priority: filterModel.priority || undefined,
        search: filterModel.search || undefined,
        sortBy: sortModel[0]?.field || 'vote_count',
        sortOrder: sortModel[0]?.sort?.toUpperCase() || 'DESC'
      };

      const response = await votingApiService.getFeatures(options);
      
      if(response.success) {
        setFeatures(response.data);
        setTotalCount(response.pagination.total);
      } else {
        throw new Error(response.message || 'Failed to load features');
      }

    } catch(error: any) {
      console.error('Error loading features:', error);
      setError(error.message);
      showSnackbar('Failed to load voting features', 'error');
    } finally {
      setLoading(false);
    }
  }, [paginationModel, sortModel, filterModel]);

  /**
   * Load voting categories
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await votingApiService.getCategories();
      if(response.success) {
        setCategories(response.data);
      }
    } catch(error: any) {
      console.error('Error loading categories:', error);
    }
  }, []);

  /**
   * Load user votes for current features
   */
  const loadUserVotes = useCallback(async () => {
    try {
      const featureIds = features.map((f: any: any) => f?.id);
      if (featureIds.length ===0) return;

      const response = await votingApiService.getUserVotes(userId, featureIds);
      if(response.success) {
        const votesMap = {};
        response.data.forEach((vote) => {
          votesMap[vote.feature_id] = vote.vote_type;
        });
        setUserVotes(votesMap);
      }
    } catch(error: any) {
      console.error('Error loading user votes:', error);
    }
  }, [features, userId]);

  /**
   * Handle voting for a feature
   */
  const handleVote = async (featureId, voteType) => {
    try {
      const userInfo = votingApiService.getCurrentUserInfo();
      const currentVote = userVotes[featureId];

      if(currentVote ===voteType) {
        // Remove vote if clicking same vote type
        await votingApiService.removeVote(featureId, userInfo);
        setUserVotes(prev => {
          const updated = { ...prev };
          delete updated[featureId];
          return updated;
        });
        showSnackbar('Vote removed', 'info');
      } else {
        // Add or change vote
        await votingApiService.voteForFeature(featureId, voteType, userInfo);
        setUserVotes(prev => ({ ...prev, [featureId]: voteType }));
        showSnackbar(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`, 'success');
      }

      // Refresh the features to get updated vote counts
      await loadFeatures();

    } catch(error: any) {
      console.error('Error voting:', error);
      showSnackbar('Failed to record vote', 'error');
    }
  };

  /**
   * Show snackbar message
   */
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeatures();
    await loadUserVotes();
    setRefreshing(false);
    showSnackbar('Data refreshed', 'success');
  };

  /**
   * DataGrid columns configuration
   */
  const columns = useMemo(() => [
    {
      field: 'title',
      headerName: 'Feature Title',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {params.row.description}
          </Typography>
        </Box>
      )
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 140,
      renderCell: (params) => {
        const IconComponent = CATEGORY_ICONS[params.value] || Lightbulb;
        return (
          <Chip
            icon={<IconComponent />}
            label={params.value}
            size: any,
              backgroundColor: alpha(params.row.category_color || '#2196F3', 0.1),
              color: params.row.category_color || '#2196F3',
              border: `1px solid ${alpha(params.row.category_color || '#2196F3', 0.3)}`
            }}
          />
        );
      }
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size: any,
            backgroundColor: alpha(PRIORITY_COLORS[params.value] || '#2196F3', 0.1),
            color: PRIORITY_COLORS[params.value] || '#2196F3',
            fontWeight: 600
          }}
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size: any,
            backgroundColor: alpha(STATUS_COLORS[params.value] || '#2196F3', 0.1),
            color: STATUS_COLORS[params.value] || '#2196F3',
            fontWeight: 500
          }}
        />
      )
    },
    {
      field: 'vote_count',
      headerName: 'Votes',
      width: 80,
      align: 'center',
      renderCell: (params) => (
        <Badge
          badgeContent={params.value}
          color: any,
              fontWeight: 600
            }
          }}
        >
          <TrendingUp color="action" />
        </Badge>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const featureId = params.row?.id;
        const userVote = userVotes[featureId];
        
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Upvote">
              <IconButton
                size: any,
                onClick={() => handleVote(featureId, 'upvote')}
                sx: any,
                  backgroundColor: userVote === 'upvote' ? alpha(theme.palette.success.main, 0.1) : 'transparent'
                }}
              >
                <ThumbUp fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Downvote">
              <IconButton
                size: any,
                onClick={() => handleVote(featureId, 'downvote')}
                sx: any,
                  backgroundColor: userVote === 'downvote' ? alpha(theme.palette.error.main, 0.1) : 'transparent'
                }}
              >
                <ThumbDown fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Comments">
              <IconButton
                size: any,
                onClick={() => setSelectedFeature(params.row)}
              >
                <Comment fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
    }
  ], [userVotes, theme, handleVote]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  useEffect(() => {
    if(features.length > 0) {
      loadUserVotes();
    }
  }, [loadUserVotes]);

  return(<Box sx={{ height: '100%', width: '100%' }}>
      {/* Header with filters and actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid { ...{container: true}} spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size: any,
              value={filterModel.search}
              onChange={(e) => setFilterModel(prev => ({ ...prev, search: e.target.value }))}
              InputProps: any,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterModel.category}
                label: any,
                onChange={(e) => setFilterModel(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat: any: any) => (
                  <MenuItem key={cat?.id} value={cat?.id}>{cat?.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterModel.status}
                label: any,
                onChange={(e) => setFilterModel(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.keys(STATUS_COLORS).map((status: any: any) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterModel.priority}
                label: any,
                onChange={(e) => setFilterModel(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value="">All Priorities</MenuItem>
                {Object.keys(PRIORITY_COLORS).map((priority: any: any) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button
                variant: any,
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
                size: any,
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                size: any,
                startIcon={<Settings />}
                onClick={() => setSettingsDialogOpen(true)}
                size: any,
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Progress */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={features}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          rowCount={totalCount}
          loading={loading}
          paginationMode: any,
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          getRowHeight={() => 80}
          sx: any,
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            }
          }}
        />
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Grid Settings Dialog */}
      <GridSettings
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onSave={saveSettings}
        gridId: any,
        columns={columns}
        currentSettings={gridSettings}
        onReset: any,
          saveSettings({});
          showSnackbar('Settings reset to defaults', 'info');
        }}
      />
    </Box>
  );
};

export default ProfessionalVotingGrid;
