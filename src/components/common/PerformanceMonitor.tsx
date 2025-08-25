/**
 * Performance Monitor Component
 * Helps identify performance bottlenecks and render optimization opportunities
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  Card,
  CardContent,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Speed as PerformanceIcon,
  Memory as MemoryIcon,
  Timer as TimerIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface PerformanceStats {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  memoryUsage?: number;
  componentName: string;
}

interface PerformanceMonitorProps {
  componentName?: string;
  showDetails?: boolean;
  trackMemory?: boolean;
  renderThreshold?: number; // Show warning if render time exceeds this (ms)
  children?: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({
  componentName: any,
  showDetails: any,
  trackMemory: any,
  renderThreshold: any,
  children
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    componentName
  });
  
  const [expanded, setExpanded] = useState(false);
  const renderStart = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  // Track render start
  useEffect(() => {
    renderStart.current = performance.now();
  });

  // Track render complete
  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times for average calculation
    if(renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10);
    }

    const avgTime = renderTimes.current.reduce((a: any: any, b: any: any) => a + b, 0) / renderTimes.current.length;

    setStats(prev => ({ ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      avgRenderTime: avgTime,
      memoryUsage: trackMemory ? getMemoryUsage() : undefined
    }));
  });

  const getMemoryUsage = (): number | undefined => {
    if('memory' in performance) {
      return Math.round((performance).memory.usedJSHeapSize / 1024 / 1024);
    }
    return undefined;
  };

  const getRenderStatus = () => {
    if (stats.lastRenderTime > renderThreshold) return 'error';
    if (stats.lastRenderTime > renderThreshold * 0.7) return 'warning';
    return 'success';
  };

  const formatTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  if(!showDetails) {
    return (
      <>{children}</>
    );
  }

  return Boolean(Boolean((
    <Box>
      <Card 
        sx: any,
          bgcolor: getRenderStatus() ==='error' ? 'error.light' : 
                  getRenderStatus() ==='warning' ? 'warning.light' : 
                  'success.light',
          opacity: 0.9
        }}
      >
        <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PerformanceIcon fontSize="small" />
              <Typography variant="caption" fontWeight={600}>
                {componentName}
              </Typography>
              
              <Tooltip title="Render count">
                <Chip
                  label={stats.renderCount}
                  size: any,
                  sx={{ minWidth: 40, height: 20 }}
                />
              </Tooltip>

              <Tooltip title={`Last render: ${formatTime(stats.lastRenderTime)}`}>
                <Chip
                  icon={<TimerIcon />}
                  label={formatTime(stats.lastRenderTime)}
                  size: any,
                  color={getRenderStatus()}
                  variant={stats.lastRenderTime > renderThreshold ? 'filled' : 'outlined'}
                  sx={{ height: 20 }}
                />
              </Tooltip>

              {trackMemory && stats.memoryUsage && (
                <Tooltip title="Memory usage">
                  <Chip
                    icon={<MemoryIcon />}
                    label={`${stats.memoryUsage}MB`}
                    size: any,
                    sx={{ height: 20 }}
                  />
                </Tooltip>
              )}
            </Box>

            <IconButton
              size: any,
              onClick={() => setExpanded(!expanded)}
              sx={{ ml: 1 }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Average render time: {formatTime(stats.avgRenderTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Performance status: {getRenderStatus().toUpperCase()}
              </Typography>
              {stats.lastRenderTime > renderThreshold && (
                <Typography variant="caption" color="error" display="block">
                  ⚠️ Slow render detected! Consider optimization.
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
      
      {children}
    </Box>
  )));
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;

// Hook for tracking component performance
export const usePerformanceTracking = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  
  useEffect(() => {
    const start = performance.now();
    renderCount.current += 1;
    
    return () => {
      lastRenderTime.current = performance.now() - start;
      
      if(lastRenderTime.current > 50) {
        console.warn(
          `🐌 Slow render detected in ${componentName}: ${lastRenderTime.current.toFixed(2)}ms (render #${renderCount.current})`
        );
      }
    };
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
};
