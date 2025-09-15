import { memo, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import { ComponentOptimizer } from '../utils/componentOptimizer';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const BaseComponent = memo(({
  children,
  onRender,
  style,
  elevation = 0,
  animate = true,
  ...props
}) => {
  const theme = useTheme();

  // Memoize styles
  const containerStyle = useMemo(() => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: elevation ? theme.shadows[elevation] : 'none',
    ...style,
  }), [theme, elevation, style]);

  // Performance callback
  const handleRender = useCallback(() => {
    if (onRender) {
      onRender();
    }
  }, [onRender]);

  // Animation variants
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Render optimized component
  return animate ? (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={containerStyle}
        {...props}
        ref={handleRender}
      >
        {children}
      </Box>
    </motion.div>
  ) : (
    <Box
      sx={containerStyle}
      {...props}
      ref={handleRender}
    >
      {children}
    </Box>
  );
});

// Add display name for debugging
BaseComponent.displayName = 'BaseComponent';

// Export optimized component
export default ComponentOptimizer.optimizeComponent(BaseComponent);

// Export type definition for TypeScript
export const BaseComponentType = BaseComponent;