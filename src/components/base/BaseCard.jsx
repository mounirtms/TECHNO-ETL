/**
 * BaseCard - Modern React 18 Base Card Component
 *
 * Features:
 * - Standardized stats and info card layouts
 * - Multiple card variants (stats, info, action, metric)
 * - Animation support with framer-motion
 * - Responsive design
 * - Accessibility compliant
 * - Modern React patterns (memo, useCallback, useMemo)
 * - TypeScript-ready interfaces
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, {
  memo,
  useMemo,
  useCallback,
  useId,
} from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

// Animation support
import { motion } from 'framer-motion';

/**
 * Card variants configuration
 */
const CARD_VARIANTS = {
  stats: {
    elevation: 2,
    sx: {
      transition: 'all 0.3s ease',
      '&:hover': {
        elevation: 4,
        transform: 'translateY(-2px)',
      },
    },
  },
  info: {
    elevation: 1,
    sx: {
      borderLeft: '4px solid',
      borderLeftColor: 'primary.main',
    },
  },
  action: {
    elevation: 3,
    sx: {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        elevation: 6,
        transform: 'scale(1.02)',
      },
    },
  },
  metric: {
    elevation: 1,
    sx: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
  },
};

/**
 * Color configuration for different types
 */
const COLOR_CONFIG = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  error: {
    main: '#d32f2f',
    light: '#f44336',
    dark: '#c62828',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
};

/**
 * Trend Icon Component
 */
const TrendIcon = memo(({ trend, size = 'small' }) => {
  const icons = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    flat: TrendingFlatIcon,
  };

  const colors = {
    up: 'success.main',
    down: 'error.main',
    flat: 'text.secondary',
  };

  const Icon = icons[trend] || TrendingFlatIcon;

  return (
    <Icon
      fontSize={size}
      sx={{ color: colors[trend] || 'text.secondary' }}
    />
  );
});

TrendIcon.displayName = 'TrendIcon';

/**
 * Card Skeleton Component
 */
const CardSkeleton = memo(({ variant = 'stats' }) => (
  <Card variant="outlined">
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      <Skeleton variant="text" width="40%" height={32} />
      {variant === 'stats' && (
        <Skeleton variant="text" width="30%" height={16} sx={{ mt: 1 }} />
      )}
    </CardContent>
  </Card>
));

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Single Stat Card Component
 */
const StatCard = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  percentage,
  loading = false,
  onClick,
  sx = {},
}) => {
  const theme = useTheme();
  const cardId = useId();

  const colorConfig = COLOR_CONFIG[color] || COLOR_CONFIG.primary;

  const cardContent = (
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" component="div">
          {title}
        </Typography>
        {Icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: alpha(colorConfig.main, 0.1),
              color: colorConfig.main,
            }}
          >
            {React.isValidElement(Icon) ? Icon : <Icon fontSize="small" />}
          </Box>
        )}
      </Box>

      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: colorConfig.main }}>
        {loading ? <Skeleton width="60%" /> : value}
      </Typography>

      {(subtitle || trend || percentage !== undefined) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          {trend && <TrendIcon trend={trend} />}
          {percentage !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {percentage > 0 ? '+' : ''}{percentage}%
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </CardContent>
  );

  return (
    <Card
      id={cardId}
      onClick={onClick}
      sx={{
        ...CARD_VARIANTS.stats.sx,
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      elevation={CARD_VARIANTS.stats.elevation}
      component={motion.div}
      whileHover={onClick ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {cardContent}
    </Card>
  );
});

StatCard.displayName = 'StatCard';

/**
 * Info Card Component
 */
const InfoCard = memo(({
  title,
  content,
  type = 'info',
  icon,
  actions,
  dismissible = false,
  onDismiss,
  sx = {},
}) => {
  const theme = useTheme();
  const cardId = useId();

  const typeIcons = {
    info: InfoIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    success: SuccessIcon,
  };

  const IconComponent = icon || typeIcons[type];
  const colorConfig = COLOR_CONFIG[type] || COLOR_CONFIG.info;

  return (
    <Card
      id={cardId}
      sx={{
        ...CARD_VARIANTS.info.sx,
        borderLeftColor: colorConfig.main,
        ...sx,
      }}
      elevation={CARD_VARIANTS.info.elevation}
    >
      <CardHeader
        avatar={
          IconComponent && (
            React.isValidElement(IconComponent) ?
              React.cloneElement(IconComponent, { sx: { color: colorConfig.main } }) :
              <IconComponent sx={{ color: colorConfig.main }} />
          )
        }
        title={title}
        action={
          dismissible && (
            <IconButton onClick={onDismiss} size="small">
              <ErrorIcon />
            </IconButton>
          )
        }
        titleTypographyProps={{
          variant: 'h6',
          component: 'div',
        }}
        sx={{ pb: 1 }}
      />

      <CardContent sx={{ pt: 0 }}>
        {typeof content === 'string' ? (
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        ) : (
          content
        )}
      </CardContent>

      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </Card>
  );
});

InfoCard.displayName = 'InfoCard';

/**
 * Progress Card Component
 */
const ProgressCard = memo(({
  title,
  value,
  max = 100,
  color = 'primary',
  showPercentage = true,
  sx = {},
}) => {
  const cardId = useId();
  const percentage = Math.round((value / max) * 100);

  return (
    <Card id={cardId} sx={sx} elevation={1}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {percentage}%
            </Typography>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{
            height: 8,
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            },
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {value} of {max}
        </Typography>
      </CardContent>
    </Card>
  );
});

ProgressCard.displayName = 'ProgressCard';

/**
 * BaseCard Component - Main export
 */
const BaseCard = memo(({
  // Core props
  variant = 'stats',
  type = 'info',

  // Content props
  title,
  value,
  subtitle,
  content,
  icon,

  // Stats props
  stats = {},
  config = {},

  // State props
  loading = false,

  // Style props
  color = 'primary',
  sx = {},

  // Event props
  onClick,
  onDismiss,

  // Advanced props
  trend,
  percentage,
  progress,
  actions,
  dismissible = false,

  ...props
}) => {
  // If stats object is provided, render multiple stat cards
  const renderStatsCards = useCallback(() => {
    if (!stats || Object.keys(stats).length === 0) return null;

    const defaultStatsConfig = [
      { key: 'total', title: 'Total', color: 'primary' },
      { key: 'active', title: 'Active', color: 'success' },
      { key: 'inactive', title: 'Inactive', color: 'warning' },
      { key: 'selected', title: 'Selected', color: 'info' },
    ];

    const statsToRender = config.stats || defaultStatsConfig;

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {statsToRender.map(statConfig => {
          const statValue = stats[statConfig.key];

          if (statValue === undefined) return null;

          return (
            <StatCard
              key={statConfig.key}
              title={statConfig.title}
              value={statValue}
              color={statConfig.color}
              icon={statConfig.icon}
              loading={loading}
              onClick={onClick}
              trend={statConfig.trend}
              percentage={statConfig.percentage}
            />
          );
        })}
      </Box>
    );
  }, [stats, config.stats, loading, onClick]);

  // Loading state
  if (loading) {
    return <CardSkeleton variant={variant} />;
  }

  // Multiple stats cards
  if (variant === 'stats' && stats && Object.keys(stats).length > 0) {
    return renderStatsCards();
  }

  // Single card variants
  switch (variant) {
  case 'stats':
    return (
      <StatCard
        title={title}
        value={value}
        subtitle={subtitle}
        icon={icon}
        color={color}
        trend={trend}
        percentage={percentage}
        loading={loading}
        onClick={onClick}
        sx={sx}
        {...props}
      />
    );

  case 'info':
    return (
      <InfoCard
        title={title}
        content={content}
        type={type}
        icon={icon}
        actions={actions}
        dismissible={dismissible}
        onDismiss={onDismiss}
        sx={sx}
        {...props}
      />
    );

  case 'progress':
    return (
      <ProgressCard
        title={title}
        value={progress?.value || value}
        max={progress?.max || 100}
        color={color}
        showPercentage={progress?.showPercentage !== false}
        sx={sx}
        {...props}
      />
    );

  default:
    return (
      <StatCard
        title={title}
        value={value}
        subtitle={subtitle}
        icon={icon}
        color={color}
        loading={loading}
        onClick={onClick}
        sx={sx}
        {...props}
      />
    );
  }
});

BaseCard.displayName = 'BaseCard';

export default BaseCard;
