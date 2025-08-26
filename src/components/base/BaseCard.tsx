/**
 * BaseCard - Advanced Card Component Foundation
 * Implements latest high-tech patterns for powerful card management
 * Features: Animated metrics, real-time updates, responsive design, accessibility
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card as MuiCard,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  LinearProgress,
  CardProps as MuiCardProps
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Components
import TooltipWrapper from '../common/TooltipWrapper';

// TypeScript interfaces
interface BaseCardProps {
  // Content props
  title?: string;
  value?: number | string;
  subtitle?: string;
  description?: string;
  
  // Visual props
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  
  // State props
  loading?: boolean;
  error?: Error | null;
  
  // Trend and analytics
  previousValue?: number;
  showTrend?: boolean;
  trendPeriod?: string;
  
  // Progress and goals
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  goalValue?: number;
  
  // Interactive features
  clickable?: boolean;
  onClick?: () => void;
  onRefresh?: () => void;
  
  // Styling
  sx?: any;
  minHeight?: number;
  
  // Animation
  animateValue?: boolean;
  animationDuration?: number;
  
  // Advanced features
  realTimeUpdate?: boolean;
  updateInterval?: number;
  
  // Accessibility
  ariaLabel?: string;
  
  [key: string]: any;
/**
 * Advanced BaseCard Component
 * 
 * Provides a comprehensive foundation for all card components with:
 * - Animated value transitions
 * - Trend indicators and analytics
 * - Real-time data updates
 * - Responsive design
 * - Accessibility compliance
 * - Performance optimization
 */
const BaseCard: React.FC<BaseCardProps> = ({
  // Content props
  title,
  value,
  subtitle,
  description,
  // Visual props
  icon: IconComponent,
  color,
  variant,
  elevation,
  // State props
  loading,
  error,
  // Trend and analytics
  previousValue,
  showTrend,
  trendPeriod,
  // Progress and goals
  showProgress,
  progressValue,
  progressMax,
  goalValue,
  
  // Interactive features
  clickable,
  onClick,
  onRefresh,
  
  // Styling
  sx = {},
  minHeight,
  // Animation
  animateValue,
  animationDuration,
  // Advanced features
  realTimeUpdate,
  updateInterval,
  // Accessibility
  ariaLabel,
  
  ...otherProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Local state
  const [displayValue, setDisplayValue] = useState<number | string>(value || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Color configuration
  const colorConfig = useMemo(() => {
    const colors = {
      primary: {
        main: theme.palette.primary.main,
        light: theme.palette.primary.light,
        background: theme.palette.primary.main + '10'
      },
      secondary: {
        main: theme.palette.secondary.main,
        light: theme.palette.secondary.light,
        background: theme.palette.secondary.main + '10'
      },
      success: {
        main: theme.palette.success.main,
        light: theme.palette.success.light,
        background: theme.palette.success.main + '10'
      },
      warning: {
        main: theme.palette.warning.main,
        light: theme.palette.warning.light,
        background: theme.palette.warning.main + '10'
      },
      error: {
        main: theme.palette.error.main,
        light: theme.palette.error.light,
        background: theme.palette.error.main + '10'
      },
      info: {
        main: theme.palette.info.main,
        light: theme.palette.info.light,
        background: theme.palette.info.main + '10'
    };
    
    return colors[color || 'primary'] || colors.primary;
  }, [color, theme]);

  // Animate value changes
  useEffect(() => {
    if(!animateValue || loading || typeof value !== 'number') {
      setDisplayValue(value || 0);
      return;
    setIsAnimating(true);
    const startValue = typeof displayValue === 'number' ? displayValue : 0;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (animationDuration || 1000), 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if(progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
    };

    requestAnimationFrame(animate);
  }, [value, animateValue, animationDuration, loading, displayValue]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeUpdate || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [realTimeUpdate, onRefresh, updateInterval]);

  // Calculate trend
  const trendData = useMemo(() => {
    if (!showTrend || previousValue ===undefined || typeof value !== 'number') return null;

    const change = value - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    
    let trend = 'flat';
    let trendIcon = <TrendingFlatIcon />;
    let trendColor = 'text.secondary';
    
    if(change > 0) {
      trendColor = theme.palette.success.main;
    } else if(change < 0) {
      trendColor = theme.palette.error.main;
    return {
      trend,
      change,
      changePercent,
      icon: trendIcon,
      color: trendColor
    };
  }, [showTrend, value, previousValue]);

  // Format display value
  const formatValue = useCallback((val: number | string): string => {
    if(typeof val === 'number') {
      if(val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if(val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      } else {
        return Math.round(val).toLocaleString();
    return String(val);
  }, []);

  // Render icon section
  const renderIcon = () => {
    if (!IconComponent) return null;

    return (
      <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? 40 : 48,
          height: isMobile ? 40 : 48,
          borderRadius: 2,
          backgroundColor: colorConfig.background,
          color: colorConfig.main,
          mb: isMobile ? 1 : 0,
          mr: isMobile ? 0 : 2
        }}></
        <IconComponent fontSize={isMobile ? 'medium' : 'large'} /></IconComponent>
    );
  };

  // Render trend indicator
  const renderTrend = () => {
    if (!trendData) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}></
        <Box sx={{ display: "flex", color: trendData.color, alignItems: 'center' }}>
          {trendData.icon}
        </Box>
        <Typography variant="caption"
          sx={{ display: "flex", color: trendData.color, fontWeight: 'medium' }}>
          {Math.abs(trendData.changePercent).toFixed(1)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          vs {trendPeriod}
        </Typography>
      </Box>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!showProgress) return null;

    const progressPercent = ((progressValue || 0) / (progressMax || 100)) * 100;
    
    return (
      <Box sx={{ display: "flex", mt: 1 }}></
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {progressPercent.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            display: "flex",
            borderRadius: 3,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: colorConfig.main,
              borderRadius: 3
          }}
        />
        {goalValue && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "flex", mt: 0.5, display: 'block' }}>
            Goal: {formatValue(goalValue)}
          </Typography>
        )}
      </Box>
    );
  };

  // Render actions
  const renderActions = () => {
    if (!onRefresh && !clickable) return null;

    return (
      <Box sx={{ display: "flex", position: 'absolute', top: 8, right: 8 }}>
        {onRefresh && (
          <TooltipWrapper title="Refresh"></
            <IconButton size="small"
              onClick={onRefresh}
              sx={{ display: "flex", opacity: 0.7, '&:hover': { opacity: 1 } }}>
              <RefreshIcon fontSize="small" /></RefreshIcon>
          </TooltipWrapper>
        )}
      </Box>
    );
  };

  // Loading state
  if(loading) {
    return (
      <MuiCard variant={variant === 'elevation' ? undefined : (variant as 'outlined')}
        elevation={variant === 'elevation' ? (elevation || 1) : 0}
        sx={{
          display: "flex",
          ...sx
        }}></
        <CardContent sx={{ display: "flex", p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}></
            <Skeleton variant="rectangular" width={48} height={48} sx={{ display: "flex", borderRadius: 2, mr: 2 }} />
            <Box sx={{ display: "flex", flex: 1 }}></
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={32} sx={{ display: "flex", mt: 1 }} /></
              <Skeleton variant="text" width="80%" height={16} sx={{ display: "flex", mt: 1 }} /></Skeleton>
          </Box>
        </CardContent>
      </MuiCard>
    );
  // Error state
  if(error) {
    return (
      <MuiCard variant={variant === 'elevation' ? undefined : (variant as 'outlined')}
        elevation={variant === 'elevation' ? (elevation || 1) : 0}
        sx={{
          display: "flex",
          borderLeft: `4px solid ${theme.palette.error.main}`,
          ...sx
        }}></
        <CardContent sx={{ display: "flex", p: isMobile ? 2 : 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="outlined" color="text.secondary">
            {error.message || 'Failed to load data'}
          </Typography>
        </CardContent>
      </MuiCard>
    );
  return (
    <Grow in timeout={300}></
      <MuiCard variant={variant === 'elevation' ? undefined : (variant as 'outlined')}
        elevation={variant === 'elevation' ? (elevation || 1) : 0}
        sx={{
          display: "flex",
          cursor: clickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          borderLeft: `4px solid ${colorConfig.main}`,
          ...(clickable && {
            '&:hover': {
              elevation: (elevation || 1) + 2,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[(elevation || 1) + 2]
          }),
          ...sx
        }}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-label={ariaLabel || `${title}: ${formatValue(displayValue)}`}
        {...otherProps}>
        <CardContent sx={{ display: "flex", p: isMobile ? 2 : 3, pb: `${isMobile ? 2 : 3} !important` }}>
          {/* Actions */}
          {renderActions()}
          
          {/* Main content */}
          <Box sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
            {/* Icon */}
            {renderIcon()}
            
            {/* Content */}
            <Box sx={{ display: "flex", flex: 1, minWidth: 0 }}>
              {/* Title */}
              <Typography variant="h6"
                sx={{
                  display: "flex",
                  mb: 0.5,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                {title}
              </Typography>
              
              {/* Value */}
              <Typography variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  display: "flex",
                  mb: 0.5,
                  transition: 'all 0.3s ease',
                  ...(isAnimating && {
                    transform: 'scale(1.05)'
                  })
                }}></
                <Fade in timeout={300}>
                  <span>{formatValue(displayValue)}</span>
                </Fade>
              </Typography>
              
              {/* Subtitle */}
              {subtitle && (
                <Typography variant="outlined" color="text.secondary" sx={{ display: "flex", mb: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
              
              {/* Description */}
              {description && (
                <Typography variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                  {description}
                </Typography>
              )}
              
              {/* Trend */}
              {renderTrend()}
              
              {/* Progress */}
              {renderProgress()}
            </Box>
          </Box>
        </CardContent>
      </MuiCard>
    </Grow>
  );
};

export default BaseCard;
