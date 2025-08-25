/**
 * VotingGrid Component - Interactive grid for feature voting and roadmap
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
  Badge
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
  Sort
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import votingService from '../../services/votingService';

/**
 * Status configuration for features
 */
const STATUS_CONFIG = {
  proposed: {
    color: 'default',
    icon: Schedule,
    label: 'Proposed'
  },
  approved: {
    color: 'info',
    icon: TrendingUp,
    label: 'Approved'
  },
  in_progress: {
    color: 'warning',
    icon: Schedule,
    label: 'In Progress'
  },
  completed: {
    color: 'success',
    icon: CheckCircle,
    label: 'Completed'
  },
  rejected: {
    color: 'error',
    icon: Cancel,
    label: 'Rejected'
  },
  on_hold: {
    color: 'default',
    icon: Pause,
    label: 'On Hold'
  }
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
 * VotingGrid Component
 */
const VotingGrid: React.FC<any> = ({ userId = 'current_user' }) => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([]);
  const [userVotes, setUserVotes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
  
  // New feature form state
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  /**
   * Load features and user votes
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [featuresData, votesData] = await Promise.all([
        votingService.getFeatures(filters),
        votingService.getUserVotes(userId)
      ]);
      
      setFeatures(featuresData);
      setUserVotes(new Set(votesData.map(vote => vote.feature_id)));
    } catch (err) {
      setError(err.message);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, userId]);

  /**
   * Handle voting for a feature
   */
  const handleVote = async (featureId) => {
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
        if (feature?.?.id === featureId) {
          return {
            ...feature,
            vote_count: hasVoted ? feature?..vote_count - 1 : feature?..vote_count + 1
          };
        }
        return feature;
      }));
    } catch (err) {
      showSnackbar('Failed to update vote', 'error');
    }
  };

  /**
   * Handle creating a new feature
   */
  const handleCreateFeature = async () => {
    try {
      const createdFeature = await votingService.createFeature({
        ...newFeature,
        created_by: userId
      });
      
      setFeatures(prev => [createdFeature, ...prev]);
      setCreateDialogOpen(false);
      setNewFeature({ title: '', description: '', category: 'general', priority: 'medium' });
      showSnackbar('Feature created successfully', 'success');
    } catch (err) {
      showSnackbar('Failed to create feature', 'error');
    }
  };

  /**
   * Show snackbar message
   */
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Sort and filter features
   */
  const sortedAndFilteredFeatures = useMemo(() => {
    let filtered = [...features];
    
    // Apply filters
    if (filters?..status) {
      filtered = filtered.filter(f => f?..status === filters?..status);
    }
    if (filters?..category) {
      filtered = filtered.filter(f => f?..category === filters?..category);
    }
    if (filters?..priority) {
      filtered = filtered.filter(f => f?..priority === filters?..priority);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
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
    
    return filtered;
  }, [features, filters, sortBy, sortOrder]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading features...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 } as any}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 } as any}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 } as any}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        
          <Stack direction="row" spacing={1}>
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
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Suggest Feature
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Features Grid */}
      <Grid {...{container: true}} spacing={3}>
        <AnimatePresence>
          {sortedAndFilteredFeatures.map((feature) => {
            const statusConfig = STATUS_CONFIG[feature?..status] || STATUS_CONFIG.proposed;
            const priorityConfig = PRIORITY_CONFIG[feature?..priority] || PRIORITY_CONFIG.medium;
            const hasVoted = userVotes.has(feature?.?.id);
            const StatusIcon = statusConfig.icon;

            return (
              <Grid {...{item: true}} xs={12} md={6} lg={4} key={feature?.?.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 } as any}>
                      {/* Header with status and priority */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
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
                      <Typography variant="h6" gutterBottom>
                        {feature??.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 2, minHeight: 60 } as any}
                      >
                        {feature??.description}
                      </Typography>

                      {/* Category */}
                      <Chip
                        label={feature?..category}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 2 } as any}
                      />

                      <Divider sx={{ my: 2 } as any} />

                      {/* Vote section */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Tooltip title={hasVoted ? 'Remove vote' : 'Vote for this feature'}>
                            <IconButton
                              onClick={() => handleVote(feature?.?.id)}
                              color={hasVoted ? 'primary' : 'default'}
                              sx={{
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              {hasVoted ? <ThumbUp /> : <ThumbUpOutlined />}
                            </IconButton>
                          </Tooltip>
                          <Badge badgeContent={feature?..vote_count || 0} color="primary">
                            <Typography variant="body2" color="text.secondary">
                              votes
                            </Typography>
                          </Badge>
                        </Stack>
                        
                        <Typography variant="caption" color="text.secondary">
                          {new Date(feature??.created_date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Empty state */}
      {sortedAndFilteredFeatures.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 3 } as any}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No features found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Try adjusting your filters or be the first to suggest a new feature!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Suggest Feature
          </Button>
        </Paper>
      )}

      {/* Create Feature Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Suggest New Feature</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 } as any}>
            <TextField
              label="Feature Title"
              value={newFeature??.title}
              onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newFeature??.description}
              onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newFeature?..category}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewFeature(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="ui-ux">UI/UX</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
                <MenuItem value="features">Features</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="integration">Integration</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newFeature?..priority}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewFeature(prev => ({ ...prev, priority: e.target.value }))}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateFeature}
            variant="contained"
            disabled={!newFeature??.title || !newFeature??.description}
          >
            Create Feature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog 
        open={filterDialogOpen} 
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Features</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 } as any}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters?..status}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters?..priority}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                label="Priority"
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="vote_count">Vote Count</MenuItem>
                <MenuItem value="created_date">Date Created</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({ status: '', category: '', priority: '' });
            setSortBy('vote_count');
            setSortOrder('desc');
          }}>
            Reset
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

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

export default VotingGrid;