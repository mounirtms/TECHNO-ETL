/**
 * Comprehensive Loading States Component with RTL Support
 * Provides various loading indicators and progress states
 * Includes animations and accessibility features
 */
import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Paper,
  Stack,
  Fade,
  Zoom,
  Slide,
  useTheme,
  keyframes,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CloudSync as SyncIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';

// Keyframe animations for RTL support
const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInRTL = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInLTR = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Enhanced Loading Spinner with RTL support
export const LoadingSpinner = ({
  size = 40,
  message,
  color = 'primary',
  variant = 'indeterminate',
  showMessage = true,
  centered = true,
  fullHeight = false,
}) => {
  const theme = useTheme();
  const { translate, currentLanguage, languages } = useLanguage();
  const { animations } = useCustomTheme();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  const containerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: centered ? 'center' : 'flex-start',
    gap: 2,
    p: 2,
    minHeight: fullHeight ? '100vh' : 'auto',
    animation: animations ? `${isRTL ? slideInRTL : slideInLTR} 0.3s ease-out` : 'none',
  };

  return (
    <Box sx={containerSx}>
      <CircularProgress
        size={size}
        color={color}
        variant={variant}
        sx={{
          animation: animations ? `${spinAnimation} 1s linear infinite` : 'none',
        }}
      />
      {showMessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            animation: animations ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
          }}
        >
          {message || translate('common.loading')}
        </Typography>
      )}
    </Box>
  );
};

// Settings-specific loading indicator
export const SettingsLoadingIndicator = ({
  operation = 'loading',
  message,
  progress,
  showProgress = false,
}) => {
  const theme = useTheme();
  const { translate, currentLanguage, languages } = useLanguage();
  const { animations } = useCustomTheme();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';

  const getOperationIcon = () => {
    switch (operation) {
    case 'saving':
      return <SaveIcon sx={{ fontSize: 24, color: theme.palette.success.main }} />;
    case 'syncing':
      return <SyncIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />;
    case 'loading':
      return <SettingsIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />;
    case 'refreshing':
      return <RefreshIcon sx={{ fontSize: 24, color: theme.palette.secondary.main }} />;
    default:
      return <SettingsIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />;
    }
  };

  const getOperationMessage = () => {
    if (message) return message;

    switch (operation) {
    case 'saving':
      return translate('settings.operations.saving');
    case 'syncing':
      return translate('settings.operations.syncing');
    case 'loading':
      return translate('settings.operations.loading');
    case 'refreshing':
      return translate('settings.operations.refreshing');
    default:
      return translate('common.loading');
    }
  };

  return (
    <Fade in timeout={300}>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          animation: animations ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            animation: animations ? `${isRTL ? slideInRTL : slideInLTR} 0.5s ease-out` : 'none',
          }}
        >
          {getOperationIcon()}
          <CircularProgress
            size={20}
            color="primary"
            sx={{
              animation: animations ? `${spinAnimation} 1s linear infinite` : 'none',
            }}
          />
        </Box>

        <Typography
          variant="body1"
          color="text.primary"
          sx={{
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {getOperationMessage()}
        </Typography>

        {showProgress && progress !== undefined && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  transition: 'transform 0.4s ease-in-out',
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 0.5,
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

// Skeleton loader for settings components
export const SettingsSkeleton = ({
  variant = 'full',
  count = 3,
  showHeader = true,
}) => {
  const theme = useTheme();
  const { animations } = useCustomTheme();

  const skeletonSx = {
    animation: animations ? 'wave' : 'none',
    borderRadius: 2,
  };

  if (variant === 'tabs') {
    return (
      <Box sx={{ width: '100%' }}>
        {showHeader && (
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="60%" height={40} sx={skeletonSx} />
            <Skeleton variant="text" width="40%" height={24} sx={skeletonSx} />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              variant="rectangular"
              width={120}
              height={48}
              sx={skeletonSx}
            />
          ))}
        </Box>

        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
          sx={skeletonSx}
        />
      </Box>
    );
  }

  if (variant === 'form') {
    return (
      <Stack spacing={3}>
        {showHeader && (
          <Box>
            <Skeleton variant="text" width="50%" height={32} sx={skeletonSx} />
            <Skeleton variant="text" width="70%" height={20} sx={skeletonSx} />
          </Box>
        )}

        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width="30%" height={24} sx={skeletonSx} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={skeletonSx} />
          </Box>
        ))}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={skeletonSx} />
          <Skeleton variant="rectangular" width={100} height={40} sx={skeletonSx} />
        </Box>
      </Stack>
    );
  }

  // Default full skeleton
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        {showHeader && (
          <Box>
            <Skeleton variant="text" width="60%" height={40} sx={skeletonSx} />
            <Skeleton variant="text" width="40%" height={24} sx={skeletonSx} />
          </Box>
        )}

        {Array.from({ length: count }).map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" width="25%" height={24} sx={skeletonSx} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ ...skeletonSx, mt: 1 }} />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

// Progress indicator with steps
export const StepProgress = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  showLabels = true,
}) => {
  const theme = useTheme();
  const { animations } = useCustomTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        alignItems: 'center',
        gap: 2,
        p: 2,
      }}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id || index}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: orientation === 'horizontal' ? 'column' : 'row',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: index <= currentStep ?
                  theme.palette.primary.main :
                  theme.palette.grey[300],
                color: index <= currentStep ?
                  theme.palette.primary.contrastText :
                  theme.palette.text.secondary,
                transition: 'all 0.3s ease-in-out',
                animation: index === currentStep && animations ?
                  `${pulseAnimation} 1.5s ease-in-out infinite` : 'none',
              }}
            >
              {index < currentStep ? '✓' : index + 1}
            </Box>

            {showLabels && (
              <Typography
                variant="caption"
                color={index <= currentStep ? 'primary' : 'text.secondary'}
                sx={{
                  textAlign: 'center',
                  fontWeight: index === currentStep ? 600 : 400,
                  maxWidth: 80,
                  lineHeight: 1.2,
                }}
              >
                {step.label}
              </Typography>
            )}
          </Box>

          {index < steps.length - 1 && (
            <Box
              sx={{
                width: orientation === 'horizontal' ? 40 : 2,
                height: orientation === 'horizontal' ? 2 : 40,
                backgroundColor: index < currentStep ?
                  theme.palette.primary.main :
                  theme.palette.grey[300],
                transition: 'background-color 0.3s ease-in-out',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

export default {
  LoadingSpinner,
  SettingsLoadingIndicator,
  SettingsSkeleton,
  StepProgress,
};
