/**
 * Enhanced Voting Grid - Optimized version with performance improvements
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Divider,
  Stack,
  Badge,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Add,
  TrendingUp,
  Schedule,
  CheckCircle,
  Cancel,
  Pause,
  FilterList,
  Sort,
  Refresh,
  ViewModule,
  ViewList
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { FixedSizeGrid as VirtualGrid } from 'react-window';

// Hooks
import { useGridPerformance, useDebounceFilter } from '../../hooks/useGridPerformance';
import { useGridCache } from '../../hooks/useGridCache';
import votingService from '../../services/votingService';

/**
 * Status configuration for features
 */
const STATUS_CONFIG = {
  proposed: { color: 'default', icon: Schedule, label: 'Proposed' },
  approved: { color: 'info', icon: TrendingUp, label: 'Approved' },
  in_progress: { color: 'warning', icon: Schedule, label: 'In Progress' },
  completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  rejected: { color: 'error', icon: Cancel, label: 'Rejected' },
  on_hold: { color: 'default', icon: Pause, label: 'On Hold' }
};

/**
 * Priority configuration
 */
const PRIORITY_CONFIG = {
  low: { color: 'success', label: 'Low' },
  medium: { color: 'warning', label: 'Medium' },
  high: { color: 'error', label: 'High' },
  critical: { color: 'error', label: 'Critical' }
};

/**
 * Feature Card Component - Memoized for performance
 */
const FeatureCard = React.memo(({ feature, userVotes, onVote, style }) => {
  const statusConfig = STATUS_CONFIG[feature.status] || STATUS_CONFIG.proposed;
  const priorityConfig = PRIORITY_CONFIG[feature.priority] || PRIORITY_CONFIG.medium;
  const hasVoted = userVotes.has(feature.id);
  const StatusIcon = statusConfig.icon;

  return (
    <div style={style}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '8px' }}
      >
        <Card 
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            {/* Header with status and priority */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Chip
                icon={<StatusIcon />}
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
              />
              <Chip
                label={priorityConfig.label}
                color={priorityConfig.color}
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* Title and description */}
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
              {feature.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 1, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {feature.description}
            </Typography>

            {/* Category */}
            <Chip
              label={feature.category}
              size="small"
              variant="outlined"
              sx={{ mb: 1 }}
            />

            <Divider sx={{ my: 1 }} />

            {/* Vote section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Tooltip title={hasVoted ? 'Remove vote' : 'Vote for this feature'}>
                  <IconButton
                    onClick={() => onVote(feature.id)}
                    color={hasVoted ? 'primary' : 'default'}
                    size="small"
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    {hasVoted ? <ThumbUp /> : <ThumbUpOutlined />}
                  </IconButton>
                </Tooltip>
                <Badge badgeContent={feature.vote_count || 0} color="primary">
                  <Typography variant="body2" color="text.secondary">
                    votes
                  </Typography>
                </Badge>
              </Stack>
              
              <Typography variant="caption" color="text.secondary">
                {new Date(feature.created_date).toLocaleDateString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

/**
 * Enhanced Voting Grid Component
 */
const EnhancedVotingGrid = ({ userId = 'current_user' }) => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [userVotes, setUserVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [sortBy, setSortBy] = useState('vote_count');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Search with debouncing
  const { value: searchValue, debouncedValue: debouncedSearch, setValue: setSearchValue } = useDebounceFilter('', 300);
  
  // Performance optimization
  const {
    virtualizedData,
    visibleItems,
    virtualConfig,
    shouldVirtualize,
    isLoading: performanceLoading,
    handleScroll,
    scrollElementRef,
    getPerformanceMetrics
  } = useGridPerformance({
    data: features,
    pageSize: 20,
    virtualizeThreshold: 50,
    enableVirtualization: true,
    enableLazyLoading: false,
    getRowHeight: () => viewMode === 'grid' ? 280 : 120
  });

  // Caching
  const {
    cacheData,
    setCacheData,
    getCacheData,
    clearCache,
    cacheStats
  } = useGridCache('voting-grid', true);

  // New feature form state
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  /**
   * Load features and user votes with caching
   */
  const loadData = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      
      const cacheKey = { filters, sortBy, sortOrder, search: debouncedSearch };
      
      // Try to get from cache first
      if (useCache) {
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
          setFeatures(cachedData.features);
          setUserVotes(new Set(cachedData.userVotes));
          setLoading(false);
          return;
        }
      }
      
      const [featuresData, votesData] = await Promise.all([
        votingService.getFeatures(filters),
        votingService.getUserVotes(userId)
      ]);
      
      // Apply search filter
      let filteredFeatures = featuresData;
      if (debouncedSearch) {
        filteredFeatures = featuresData.filter(feature =>
          feature.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          feature.description.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      
      // Apply sorting
      filteredFeatures.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy === 'vote_count') {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      setFeatures(filteredFeatures);
      setUserVotes(new Set(votesData.map(vote => vote.feature_id)));
      
      // Cache the results
      setCacheData({ features: filteredFeatures, userVotes: votesData.map(vote => vote.feature_id) }, cacheKey);
      
    } catch (err) {
      setError(err.message);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, userId, debouncedSearch, sortBy, sortOrder, getCacheData, setCacheData]);

  /**
   * Handle voting for a feature
   */
  const handleVote = useCallback(async (featureId) => {
    try {
      const hasVoted = userVotes.has(featureId);
      
      if (hasVoted) {
        await votingService.removeVote(featureId, userId);
        setUserVotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(featureId);
          return newSet;
        });
        showSnackbar('Vote removed', 'info');
      } else {
        await votingService.voteForFeature(featureId, userId);
        setUserVotes(prev => new Set([...prev, featureId]));
        showSnackbar('Vote added', 'success');
      }
      
      // Update vote count in features
      setFeatures(prev => prev.map(feature => {
        if (feature.id === featureId) {
          return {
            ...feature,
            vote_count: hasVoted ? feature.vote_count - 1 : feature.vote_count + 1
          };
        }
        return feature;
      }));
      
      // Clear cache to force refresh
      clearCache();
      
    } catch (err) {
      showSnackbar('Failed to update vote', 'error');
    }
  }, [userVotes, userId, clearCache]);

  /**
   * Show snackbar message
   */
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  /**
   * Refresh data
   */
  const handleRefresh = useCallback(() => {
    clearCache();
    loadData(false);
  }, [clearCache, loadData]);

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Performance metrics for debugging
  const performanceMetrics = useMemo(() => {
    return {
      ...getPerformanceMetrics(),
      cacheStats,
      searchDebouncing: searchValue !== debouncedSearch
    };
  }, [getPerformanceMetrics, cacheStats, searchValue, debouncedSearch]);

  if (loading && !features.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading features...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with performance indicators */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Enhanced Feature Voting
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Optimized grid with virtualization and caching ({features.length} features)
            </Typography>
            {shouldVirtualize && (
              <Typography variant="caption" color="primary">
                Virtual scrolling enabled for performance
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Search features..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<Sort />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              Sort {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
            <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
            </IconButton>
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Stack>
        </Stack>
        
        {/* Performance indicators */}
        {performanceLoading && <LinearProgress sx={{ mt: 1 }} />}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Performance: {performanceMetrics.virtualizedItems}/{performanceMetrics.totalItems} items, 
            {performanceMetrics.memoryUsageMB}MB memory, 
            Cache: {performanceMetrics.cacheStats.size} entries
          </Typography>
        )}
      </Paper>

      {/* Features Grid/List */}
      <Box sx={{ height: 600, overflow: 'auto' }} ref={scrollElementRef} onScroll={handleScroll}>
        {shouldVirtualize ? (
          // Virtual scrolling for large datasets
          <VirtualGrid
            height={600}
            width="100%"
            columnCount={viewMode === 'grid' ? Math.floor(window.innerWidth / 350) : 1}
            columnWidth={viewMode === 'grid' ? 350 : window.innerWidth - 100}
            rowCount={Math.ceil(features.length / (viewMode === 'grid' ? Math.floor(window.innerWidth / 350) : 1))}
            rowHeight={viewMode === 'grid' ? 280 : 120}
            itemData={{ features, userVotes, onVote: handleVote }}
          >
            {({ columnIndex, rowIndex, style, data }) => {
              const itemsPerRow = viewMode === 'grid' ? Math.floor(window.innerWidth / 350) : 1;
              const featureIndex = rowIndex * itemsPerRow + columnIndex;
              const feature = data.features[featureIndex];
              
              if (!feature) return null;
              
              return (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  userVotes={data.userVotes}
                  onVote={data.onVote}
                  style={style}
                />
              );
            }}
          </VirtualGrid>
        ) : (
          // Regular grid for smaller datasets
          <Grid container spacing={3}>
            <AnimatePresence>
              {features.map((feature) => (
                <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 4 : 12} key={feature.id}>
                  <FeatureCard
                    feature={feature}
                    userVotes={userVotes}
                    onVote={handleVote}
                  />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedVotingGrid;
