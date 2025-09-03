import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Sync as SyncIcon,
  Storage as SourceIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const SyncProgressBar = ({ progressData }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (progressData?.current !== undefined) {
      const timer = setTimeout(() => {
        setAnimationProgress(progressData.current);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [progressData?.current]);

  if (!progressData?.isActive && !progressData?.completed) return null;

  const {
    current = 0,
    total = 0,
    isActive = false,
    completed = false,
    currentStep = '',
    sources = [],
    completedSources = [],
    errorSources = [],
    message = '',
  } = progressData;

  const percentage = total > 0 ? Math.max(0, Math.round((current / total) * 100)) : 0;
  const sourcesProgress = sources.length > 0 ? Math.round((completedSources.length / sources.length) * 100) : 0;

  const getStepIcon = (stepIndex) => {
    if (stepIndex < current) return <CheckIcon color="success" />;
    if (stepIndex === current) return <SyncIcon color="primary" />;

    return <PendingIcon color="disabled" />;
  };

  const steps = [
    'Marking stocks for sync',
    'Fetching source configurations',
    'Syncing sources to Magento',
    'Finalizing sync process',
  ];

  return (
    <Card sx={{ mt: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight={600}>
            📦 Stock Synchronization Progress
          </Typography>
          <IconButton
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
            aria-label="Toggle details"
            sx={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        {/* Main Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress: {current} / {total} Steps
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary">
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: completed
                  ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                  : 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
              },
            }}
          />
        </Box>

        {/* Current Step */}
        {currentStep && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={isActive ? <SyncIcon /> : <CheckIcon />}
              label={currentStep}
              color={isActive ? 'primary' : 'success'}
              variant="outlined"
              sx={{ fontSize: '0.8rem' }}
            />
          </Box>
        )}

        {/* Sources Progress */}
        {sources.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sources: {completedSources.length} / {sources.length} completed
            </Typography>
            <LinearProgress
              variant="determinate"
              value={sourcesProgress}
              color="secondary"
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Status Message */}
        {message && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {message}
          </Typography>
        )}

        <Collapse in={showDetails}>
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Step Details */}
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Process Steps
            </Typography>
            <List dense>
              {steps.map((step, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getStepIcon(index)}
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: index <= current ? 'text.primary' : 'text.secondary',
                      fontWeight: index === current ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Sources Status */}
            {sources.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Sources Status ({completedSources.length + errorSources.length} / {sources.length})
                </Typography>
                <Grid container spacing={1}>
                  {sources.map((source, index) => {
                    const isCompleted = completedSources.includes(source.code || source.code_source);
                    const hasError = errorSources.includes(source.code || source.code_source);
                    const status = hasError ? 'error' : isCompleted ? 'success' : 'default';

                    return (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Chip
                          icon={<SourceIcon />}
                          label={source.name || source.magentoSource || source.code}
                          color={status}
                          variant={isCompleted || hasError ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ width: '100%', justifyContent: 'flex-start' }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

SyncProgressBar.propTypes = {
  progressData: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number,
    isActive: PropTypes.bool,
    completed: PropTypes.bool,
    currentStep: PropTypes.string,
    sources: PropTypes.array,
    completedSources: PropTypes.array,
    errorSources: PropTypes.array,
  }),
};

export default SyncProgressBar;
