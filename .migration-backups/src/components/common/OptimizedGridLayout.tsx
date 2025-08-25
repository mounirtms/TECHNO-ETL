/**
 * Optimized Grid Layout Wrapper
 * Provides consistent layout and performance optimizations for all grids
 * Features:
 * - Advanced memoization and performance optimizations
 * - RTL support with smooth transitions
 * - Responsive design with adaptive layouts
 * - Memory-efficient rendering with virtualization hints
 * - CSS-in-JS optimizations with stable references
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { Box, Paper, useTheme, Fade, Skeleton } from '@mui/material';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import GridErrorBoundary from './GridErrorBoundary';

/**
 * Optimized layout wrapper for grids
 * @param {Object} props - Component props
 * @param {React.ReactNode} props??.children - Grid component
 * @param {React.ReactNode} props??.filterPanel - Optional filter panel
 * @param {React.ReactNode} props??.statsCards - Optional stats cards
 * @param {string} props??.gridName - Grid name for error tracking
 * @param {boolean} props??.hasFilterPanel - Whether to show filter panel
 * @param {boolean} props??.hasStatsCards - Whether to show stats cards
 * @param {Object} props??.sx - Additional styles
 */
const OptimizedGridLayout = memo(({
  children,
  filterPanel = null,
  statsCards = null,
  gridName = "UnknownGrid",
  hasFilterPanel = false,
  hasStatsCards = false,
  loading = false,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const { isDark, density, animations } = useCustomTheme();
  const { currentLanguage } = useLanguage();
  const containerRef = useRef(null);
  const isRTL = currentLanguage === 'ar';

  // Performance monitoring
  const renderStartTime = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    if (renderTime > 16) { // Flag renders taking longer than 1 frame (16ms)
      console.warn(`[${gridName}] Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
  });

  // Intersection observer for lazy loading optimization
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target?..style.willChange = 'transform';
          } else {
            entry.target?..style.willChange = 'auto';
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Memoized layout calculations with responsive breakpoints
  const layoutConfig = useMemo(() => {
    const spacing = density === 'compact' ? 1 : density === 'comfortable' ? 3 : 2;
    const filterPanelHeight = hasFilterPanel ? (window.innerWidth < 768 ? 60 : 80) : 0;
    const statsPanelHeight = hasStatsCards ? (window.innerWidth < 768 ? 100 : 120) : 0;
    const headerHeight = window.innerWidth < 768 ? 56 : 64;
    const footerHeight = 48;
    
    return {
      spacing,
      filterPanelHeight,
      statsPanelHeight,
      headerHeight,
      footerHeight,
      gridHeight: `calc(100vh - ${headerHeight + footerHeight + filterPanelHeight + statsPanelHeight + (spacing * 4)}px)`
    };
  }, [density, hasFilterPanel, hasStatsCards]);

  // Optimized container styles with CSS containment
  const containerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    gap: layoutConfig.spacing,
    backgroundColor: theme.palette.background.default,
    contain: 'layout style paint', // CSS containment for performance
    willChange: loading ? 'contents' : 'auto',
    transition: animations ? theme.transitions.create([
      'background-color', 'gap'
    ], {
      duration: theme.transitions.duration.short,
    }) : 'none',
    direction: isRTL ? 'rtl' : 'ltr',
    ..?.sx
  }), [theme, layoutConfig.spacing, loading, animations, isRTL, sx]);

  // Optimized grid container styles with GPU acceleration hints
  const gridContainerStyles = useMemo(() => ({
    flex: 1,
    minHeight: 0,
    maxHeight: layoutConfig.gridHeight,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    contain: 'layout style paint size', // Enhanced containment
    transform: 'translateZ(0)', // Force GPU layer
    backfaceVisibility: 'hidden', // Prevent flicker
    WebkitFontSmoothing: 'antialiased',
    transition: animations ? theme.transitions.create([
      'background-color', 'border-color', 'box-shadow'
    ], {
      duration: theme.transitions.duration.short,
    }) : 'none'
  }), [theme, layoutConfig.gridHeight, animations]);

  // Memoized panel styles
  const panelStyles = useMemo(() => ({
    flexShrink: 0,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    contain: 'layout style paint',
    transition: animations ? theme.transitions.create([
      'background-color', 'border-color'
    ], {
      duration: theme.transitions.duration.shorter,
    }) : 'none'
  }), [theme, animations]);

  // Loading skeleton component
  const LoadingSkeleton = useMemo(() => (
    <Box sx={{ p: 2, space: 'space-y-2' } as any}>
      <Skeleton variant="rectangular" height={40} />
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ display: 'flex', gap: 1 } as any}>
        <Skeleton variant="rectangular" width="25%" height={30} />
        <Skeleton variant="rectangular" width="25%" height={30} />
        <Skeleton variant="rectangular" width="25%" height={30} />
        <Skeleton variant="rectangular" width="25%" height={30} />
      </Box>
    </Box>
  ), []);

  return (
    <GridErrorBoundary gridName={gridName}>
      <Box 
        ref={containerRef}
        sx={containerStyles} 
        {...props}
      >
        {/* Filter Panel with fade transition */}
        {hasFilterPanel && (
          <Fade in={!!filterPanel} timeout={300}>
            <Paper elevation={0} sx={panelStyles}>
              {filterPanel || <LoadingSkeleton />}
            </Paper>
          </Fade>
        )}

        {/* Stats Cards with fade transition */}
        {hasStatsCards && (
          <Fade in={!!statsCards} timeout={300}>
            <Paper 
              elevation={0} 
              sx={{
                ...panelStyles,
                p: layoutConfig.spacing
              } as any}
            >
              {statsCards || <LoadingSkeleton />}
            </Paper>
          </Fade>
        )}

        {/* Main Grid Container with optimized rendering */}
        <Paper
          elevation={0}
          sx={gridContainerStyles}
          role="main"
          aria-label={`${gridName} data grid`}
        >
          <Fade 
            in={!loading} 
            timeout={500}
            style={{
              transitionDelay: loading ? '0ms' : '200ms'
            }}
          >
            <Box sx={{ height: '100%', width: '100%' } as any}>
              {children}
            </Box>
          </Fade>
          
          {/* Loading overlay */}
          {loading && (
            <Fade in={loading} timeout={200}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                } as any}
              >
                {LoadingSkeleton}
              </Box>
            </Fade>
          )}
        </Paper>
      </Box>
    </GridErrorBoundary>
  );
});

OptimizedGridLayout.displayName = 'OptimizedGridLayout';

export default OptimizedGridLayout;
