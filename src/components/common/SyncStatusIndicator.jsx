/**
 * Sync Status Indicator Component
 * Provides clear visual feedback about settings synchronization status
 * Shows sync progress, errors, and allows manual sync actions
 *
 * Requirements: 7.4, 7.5 (Clear sync status and error feedback)
 */

import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  CloudSync as CloudSyncIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useSettingsSync } from '../../hooks/useSettingsSync';

const SyncStatusIndicator = ({
  variant = 'chip', // 'chip', 'full', 'minimal'
  showDetails = false,
  allowManualSync = true,
  className = '',
}) => {
  const {
    syncStatus,
    isLoading,
    error,
    forceSyncAll,
    clearError,
    getSyncStatusText,
    getSyncStatusColor,
    getSyncQueueStatus,
  } = useSettingsSync();

  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const statusColor = getSyncStatusColor();
  const statusText = getSyncStatusText();
  const queueStatus = getSyncQueueStatus();

  // Handle manual sync
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await forceSyncAll();
    } finally {
      setSyncing(false);
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isLoading || syncing) {
      return <CircularProgress size={16} />;
    }

    switch (statusColor) {
    case 'error':
      return <ErrorIcon fontSize="small" color="error" />;
    case 'warning':
      return syncStatus.isOnline ?
        <WarningIcon fontSize="small" color="warning" /> :
        <CloudOffIcon fontSize="small" color="warning" />;
    case 'info':
      return <CloudSyncIcon fontSize="small" color="info" />;
    case 'success':
    default:
      return <CloudDoneIcon fontSize="small" color="success" />;
    }
  };

  // Get chip color
  const getChipColor = () => {
    switch (statusColor) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'success':
    default:
      return 'success';
    }
  };

  // Minimal variant - just an icon
  if (variant === 'minimal') {
    return (
      <Tooltip title={statusText}>
        <IconButton
          size="small"
          onClick={allowManualSync ? handleManualSync : undefined}
          disabled={isLoading || syncing}
          className={className}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  // Chip variant - compact status chip
  if (variant === 'chip') {
    return (
      <Box className={className}>
        <Chip
          icon={getStatusIcon()}
          label={statusText}
          color={getChipColor()}
          variant="outlined"
          size="small"
          onClick={showDetails ? () => setExpanded(!expanded) : undefined}
          clickable={showDetails}
        />

        {showDetails && (
          <Collapse in={expanded}>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
              <SyncStatusDetails
                syncStatus={syncStatus}
                queueStatus={queueStatus}
                error={error}
                onManualSync={allowManualSync ? handleManualSync : undefined}
                onClearError={clearError}
                syncing={syncing}
              />
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  // Full variant - detailed status display
  return (
    <Box className={className}>
      <Stack spacing={1}>
        {/* Main status */}
        <Box display="flex" alignItems="center" gap={1}>
          {getStatusIcon()}
          <Typography variant="body2" color="text.secondary">
            {statusText}
          </Typography>

          {allowManualSync && (
            <Tooltip title="Force sync all changes">
              <IconButton
                size="small"
                onClick={handleManualSync}
                disabled={isLoading || syncing || !syncStatus.isOnline}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {showDetails && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* Error display */}
        {error && (
          <Alert
            severity="error"
            size="small"
            action={
              <Button size="small" onClick={clearError}>
                                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Detailed status */}
        {showDetails && (
          <Collapse in={expanded}>
            <SyncStatusDetails
              syncStatus={syncStatus}
              queueStatus={queueStatus}
              error={error}
              onManualSync={allowManualSync ? handleManualSync : undefined}
              onClearError={clearError}
              syncing={syncing}
            />
          </Collapse>
        )}
      </Stack>
    </Box>
  );
};

// Detailed status component
const SyncStatusDetails = ({
  syncStatus,
  queueStatus,
  error,
  onManualSync,
  onClearError,
  syncing,
}) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.primary">
                Sync Status Details
      </Typography>

      <Stack spacing={1}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
                        Connection:
          </Typography>
          <Typography variant="body2" color={syncStatus.isOnline ? 'success.main' : 'warning.main'}>
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
                        Pending Changes:
          </Typography>
          <Typography variant="body2">
            {syncStatus.pendingChanges}
          </Typography>
        </Box>

        {syncStatus.lastSync && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
                            Last Sync:
            </Typography>
            <Typography variant="body2">
              {new Date(syncStatus.lastSync).toLocaleString()}
            </Typography>
          </Box>
        )}

        {syncStatus.conflictsDetected > 0 && (
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
                            Conflicts Resolved:
            </Typography>
            <Typography variant="body2" color="warning.main">
              {syncStatus.conflictsDetected}
            </Typography>
          </Box>
        )}

        {queueStatus.queueLength > 0 && (
          <>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                                Queue Length:
              </Typography>
              <Typography variant="body2">
                {queueStatus.queueLength}
              </Typography>
            </Box>

            {queueStatus.oldestItem && (
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                                    Oldest Pending:
                </Typography>
                <Typography variant="body2">
                  {new Date(queueStatus.oldestItem).toLocaleString()}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Stack>

      {/* Actions */}
      <Stack direction="row" spacing={1}>
        {onManualSync && (
          <Button
            size="small"
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={onManualSync}
            disabled={syncing || !syncStatus.isOnline}
          >
            {syncing ? 'Syncing...' : 'Force Sync'}
          </Button>
        )}

        {error && onClearError && (
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={onClearError}
          >
                        Clear Error
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default SyncStatusIndicator;
