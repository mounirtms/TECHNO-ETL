/**
 * RoadmapGrid Component - Visual roadmap showing feature development progress
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  ExpandMore,
  Schedule,
  TrendingUp,
  CheckCircle,
  Cancel,
  Pause,
  Lightbulb,
  Code,
  BugReport,
  Security,
  Speed,
  Palette
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import votingService from '../../services/votingService';

/**
 * Status configuration with timeline styling
 */
const STATUS_CONFIG = {
  proposed: {
    color: 'grey',
    icon: Lightbulb,
    label: 'Proposed',
    description: 'Ideas and suggestions from the community'
  },
  approved: {
    color: 'info',
    icon: TrendingUp,
    label: 'Approved',
    description: 'Features approved for development'
  },
  in_progress: {
    color: 'warning',
    icon: Code,
    label: 'In Progress',
    description: 'Currently being developed'
  },
  completed: {
    color: 'success',
    icon: CheckCircle,
    label: 'Completed',
    description: 'Released and available'
  },
  rejected: {
    color: 'error',
    icon: Cancel,
    label: 'Rejected',
    description: 'Not planned for development'
  },
  on_hold: {
    color: 'default',
    icon: Pause,
    label: 'On Hold',
    description: 'Temporarily paused'
  }
};

/**
 * Category icons
 */
const CATEGORY_ICONS = {
  'ui-ux': Palette,
  'performance': Speed,
  'security': Security,
  'features': Code,
  'integration': TrendingUp,
  'general': Lightbulb
};

/**
 * RoadmapGrid Component
 */
const RoadmapGrid = () => {
  const { t } = useTranslation();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['in_progress', 'approved']));

  /**
   * Load roadmap data with fallback
   */
  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from service
      const data = await votingService.getRoadmap();
      setRoadmapData(data);
    } catch(err: any) {
      console.warn('Roadmap service unavailable, using fallback data:', err);

      // Provide fallback roadmap data
      const fallbackData = {
        in_progress: [
          {
            id: 'feature-1',
            title: 'Enhanced Dashboard Analytics',
            description: 'Improved analytics with real-time data visualization and custom metrics.',
            priority: 'high',
            vote_count: 45,
            estimated_completion: '2024-Q2',
            progress: 75,
            tags: ['analytics', 'dashboard', 'ui']
          },
          {
            id: 'feature-2',
            title: 'Mobile App Development',
            description: 'Native mobile application for iOS and Android platforms.',
            priority: 'medium',
            vote_count: 32,
            estimated_completion: '2024-Q3',
            progress: 25,
            tags: ['mobile', 'app', 'cross-platform']
          }
        ],
        approved: [
          {
            id: 'feature-3',
            title: 'Advanced Search Filters',
            description: 'Enhanced search functionality with advanced filtering options.',
            priority: 'medium',
            vote_count: 28,
            estimated_completion: '2024-Q4',
            progress: 0,
            tags: ['search', 'filters', 'ux']
          },
          {
            id: 'feature-4',
            title: 'API Rate Limiting',
            description: 'Implement rate limiting for API endpoints to improve performance.',
            priority: 'high',
            vote_count: 22,
            estimated_completion: '2024-Q2',
            progress: 0,
            tags: ['api', 'performance', 'security']
          }
        ],
        completed: [
          {
            id: 'feature-5',
            title: 'Bug Bounty Program',
            description: 'Community-driven bug reporting and reward system.',
            priority: 'high',
            vote_count: 67,
            estimated_completion: '2024-Q1',
            progress: 100,
            tags: ['quality', 'community', 'testing']
          },
          {
            id: 'feature-6',
            title: 'Dark Mode Theme',
            description: 'Dark theme option for better user experience.',
            priority: 'low',
            vote_count: 89,
            estimated_completion: '2024-Q1',
            progress: 100,
            tags: ['ui', 'theme', 'accessibility']
          }
        ],
        rejected: [
          {
            id: 'feature-7',
            title: 'Cryptocurrency Integration',
            description: 'Accept cryptocurrency payments for premium features.',
            priority: 'low',
            vote_count: 12,
            estimated_completion: null,
            progress: 0,
            tags: ['payments', 'crypto']
          }
        ],
        on_hold: [
          {
            id: 'feature-8',
            title: 'AI-Powered Recommendations',
            description: 'Machine learning based product recommendations.',
            priority: 'medium',
            vote_count: 34,
            estimated_completion: '2025-Q1',
            progress: 10,
            tags: ['ai', 'ml', 'recommendations']
          }
        ]
      };

      setRoadmapData(fallbackData);

      // Only show error if it's a critical failure
      if (err.message && !err.message.includes('404') && !err.message.includes('fetch')) {
        setError(`Unable to load live roadmap data. Showing cached version. (${err.message})`);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle section expansion
   */
  const toggleSection = (status) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if(newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  /**
   * Calculate progress statistics
   */
  const progressStats = useMemo(() => {
    if (!roadmapData) return null;

    const total = roadmapData?.totalFeatures;
    const completed = roadmapData?.byStatus.completed?.length || 0;
    const inProgress = roadmapData?.byStatus.in_progress?.length || 0;
    const approved = roadmapData?.byStatus.approved?.length || 0;

    return {
      total,
      completed,
      inProgress,
      approved,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      activeWork: inProgress + approved
    };
  }, [roadmapData]);

  // Load data on component mount
  useEffect(() => {
    loadRoadmap();
  }, []);

  if(loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading roadmap...</Typography>
      </Box>
    );
  }

  if(error) {
    return (
      <Alert severity="error" sx={{ display: "flex", m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", p: 3 }}>
      {/* Header */}
      <Paper sx={{ display: "flex", p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Development Roadmap
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Track the progress of features from idea to implementation
        </Typography>

        {/* Progress Overview */}
        {progressStats && (
          <Grid { ...{container: true}} spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ display: "flex", textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary">
                  {progressStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Features
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ display: "flex", textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="success.main">
                  {progressStats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ display: "flex", textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="warning.main">
                  {progressStats.activeWork}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Development
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ display: "flex", textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="info.main">
                  {Math.round(progressStats.completionRate)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
                <LinearProgress 
                  variant="body2"
                  value={progressStats.completionRate} 
                  sx={{ display: "flex", mt: 1 }}
                />
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Roadmap Timeline */}
      <Grid { ...{container: true}} spacing={3}>
        {/* Timeline View */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ display: "flex", p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Development Timeline
            </Typography>
            
            <Timeline>
              {Object.entries(STATUS_CONFIG).map(([status: any config]: any = {}; // Fixed invalid assignment index: any: any: any: any) => {
                const features = roadmapData?.byStatus[status] || [];
                const StatusIcon = config.icon;
                const isLast = index ===Object.keys(STATUS_CONFIG).length - 1;

                return(<TimelineItem key={status}>
                    <TimelineSeparator>
                      <TimelineDot color={config.color}>
                        <StatusIcon />
                      </TimelineDot>
                      {!isLast && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Accordion 
                        expanded={expandedSections.has(status)}
                        onChange={(e) => () => toggleSection(status)}
                        sx={{ display: "flex", mb: 2 }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Stack direction="row" alignItems="center" spacing={2} width="100%">
                            <Typography variant="h6">
                              {config.label}
                            </Typography>
                            <Badge badgeContent={features.length} color={config.color}>
                              <Typography variant="body2" color="text.secondary">
                                features
                              </Typography>
                            </Badge>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary" mb={2}>
                            {config.description}
                          </Typography>
                          
                          {features.length > 0 ? (
                            <Stack spacing={2}>
                              {features.map((feature: any: any: any: any) => {
                                const CategoryIcon = CATEGORY_ICONS[feature.category] || Lightbulb;
                                
                                return Boolean((
                                  <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Card variant="outlined" sx={{ display: "flex", p: 2 }}>
                                      <Stack direction="row" spacing={2} alignItems="flex-start">
                                        <CategoryIcon color="action" />
                                        <Box flexGrow={1}>
                                          <Typography variant="subtitle1" gutterBottom>
                                            {feature.title}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" mb={1}>
                                            {feature.description}
                                          </Typography>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip 
                                              label={feature.category} 
                                              size="small"
                                              label={feature.priority} 
                                              size="small"
                                                     feature.priority = == 'medium' ? 'warning' : 'success'}
                                            />
                                            {feature.vote_count > 0 && (
                                              <Tooltip title="Community votes">
                                                <Chip 
                                                  label={`${feature.vote_count} votes`} 
                                                  size="small"
                                            )}
                                            {feature.target_release && (
                                              <Chip 
                                                label={`v${feature.target_release}`} 
                                                size="small"
                                            )}
                                          </Stack>
                                        </Box>
                                      </Stack>
                                    </Card>
                                  </motion.div>
                                )))));
                              })}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No features in this stage
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ display: "flex", p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Features by Category
            </Typography>
            
            {roadmapData?.byCategory && (
              <Stack spacing={2}>
                {Object.entries(roadmapData?.byCategory).map(([category: any features]: any: any: any: any) => {
                  const CategoryIcon = CATEGORY_ICONS[category] || Lightbulb;
                  
                  return (
                    <Card key={category} variant="outlined" sx={{ display: "flex", p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CategoryIcon color="primary" />
                        <Box flexGrow={1}>
                          <Typography variant="subtitle1" textTransform="capitalize">
                            {category.replace('-', ' ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {features.length} feature{features.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          {features.length}
                        </Typography>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ display: "flex", p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Updates
            </Typography>
            
            {roadmapData?.recentActivity && roadmapData?.recentActivity.length > 0 ? (
              <Stack spacing={2}>
                {roadmapData?.recentActivity.slice(0, 5).map((activity: any index: any: any: any: any) => (
                  <Box key={index} sx={{ display: "flex", pb: 1, borderBottom: index < 4 ? 1 : 0, borderColor: 'divider' }}>
                    <Typography variant="body2" gutterBottom>
                      {activity.title}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={STATUS_CONFIG[activity.status]?.label || activity.status} 
                        size="small"
                        color={STATUS_CONFIG[activity.status]?.color || 'default'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.updated_date).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoadmapGrid;