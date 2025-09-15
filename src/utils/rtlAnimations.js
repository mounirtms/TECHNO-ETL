/**
 * RTL Animation Utilities
 * Provides direction-aware animations and transitions
 * Supports both LTR and RTL layouts with smooth animations
 */
import { keyframes } from '@mui/material/styles';

// Direction-aware slide animations
export const createSlideAnimation = (direction, distance = '20px') => {
  const directions = {
    left: {
      ltr: keyframes`
        from { opacity: 0; transform: translateX(-${distance}); }
        to { opacity: 1; transform: translateX(0); }
      `,
      rtl: keyframes`
        from { opacity: 0; transform: translateX(${distance}); }
        to { opacity: 1; transform: translateX(0); }
      `,
    },
    right: {
      ltr: keyframes`
        from { opacity: 0; transform: translateX(${distance}); }
        to { opacity: 1; transform: translateX(0); }
      `,
      rtl: keyframes`
        from { opacity: 0; transform: translateX(-${distance}); }
        to { opacity: 1; transform: translateX(0); }
      `,
    },
    up: {
      ltr: keyframes`
        from { opacity: 0; transform: translateY(${distance}); }
        to { opacity: 1; transform: translateY(0); }
      `,
      rtl: keyframes`
        from { opacity: 0; transform: translateY(${distance}); }
        to { opacity: 1; transform: translateY(0); }
      `,
    },
    down: {
      ltr: keyframes`
        from { opacity: 0; transform: translateY(-${distance}); }
        to { opacity: 1; transform: translateY(0); }
      `,
      rtl: keyframes`
        from { opacity: 0; transform: translateY(-${distance}); }
        to { opacity: 1; transform: translateY(0); }
      `,
    },
  };

  return directions[direction] || directions.right;
};

// Fade animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

export const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

export const fadeInDown = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(-20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

// Scale animations
export const scaleIn = keyframes`
  from { 
    opacity: 0; 
    transform: scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
`;

export const scaleOut = keyframes`
  from { 
    opacity: 1; 
    transform: scale(1); 
  }
  to { 
    opacity: 0; 
    transform: scale(0.9); 
  }
`;

// Pulse animation
export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Bounce animation
export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

// Shake animation (direction-aware)
export const createShakeAnimation = (isRTL = false) => {
  const direction = isRTL ? -1 : 1;

  return keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(${-10 * direction}px); }
    20%, 40%, 60%, 80% { transform: translateX(${10 * direction}px); }
  `;
};

// Rotation animations
export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const spinReverse = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

// Slide and fade combinations
export const createSlideAndFade = (direction, isRTL = false, distance = '30px') => {
  const getTransform = (dir, rtl) => {
    switch (dir) {
    case 'left':
      return rtl ? `translateX(${distance})` : `translateX(-${distance})`;
    case 'right':
      return rtl ? `translateX(-${distance})` : `translateX(${distance})`;
    case 'up':
      return `translateY(-${distance})`;
    case 'down':
      return `translateY(${distance})`;
    default:
      return rtl ? `translateX(${distance})` : `translateX(-${distance})`;
    }
  };

  return keyframes`
    from { 
      opacity: 0; 
      transform: ${getTransform(direction, isRTL)}; 
    }
    to { 
      opacity: 1; 
      transform: translate(0, 0); 
    }
  `;
};

// Stagger animation helper
export const createStaggeredAnimation = (baseAnimation, delay = 100) => {
  return (index) => ({
    animation: `${baseAnimation} 0.6s ease-out ${index * delay}ms both`,
  });
};

// Direction-aware hover animations
export const createHoverAnimation = (isRTL = false) => {
  const direction = isRTL ? -4 : 4;

  return {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: `translateX(${direction}px) translateY(-2px)`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
  };
};

// Loading animations
export const loadingDots = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`;

export const loadingSpinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const loadingPulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
`;

// Success/Error animations
export const successCheckmark = keyframes`
  0% { 
    stroke-dasharray: 0 100;
    stroke-dashoffset: 0;
  }
  100% { 
    stroke-dasharray: 100 100;
    stroke-dashoffset: 0;
  }
`;

export const errorX = keyframes`
  0% { 
    stroke-dasharray: 0 100;
    stroke-dashoffset: 0;
  }
  100% { 
    stroke-dasharray: 100 100;
    stroke-dashoffset: 0;
  }
`;

// Utility function to get animation based on direction and RTL
export const getDirectionalAnimation = (animationType, direction, isRTL = false, options = {}) => {
  const { distance = '20px', duration = '0.3s', easing = 'ease-out', delay = '0s' } = options;

  switch (animationType) {
  case 'slide':
    return {
      animation: `${createSlideAnimation(direction, distance)[isRTL ? 'rtl' : 'ltr']} ${duration} ${easing} ${delay} both`,
    };
  case 'slideAndFade':
    return {
      animation: `${createSlideAndFade(direction, isRTL, distance)} ${duration} ${easing} ${delay} both`,
    };
  case 'fadeIn':
    return {
      animation: `${fadeIn} ${duration} ${easing} ${delay} both`,
    };
  case 'scaleIn':
    return {
      animation: `${scaleIn} ${duration} ${easing} ${delay} both`,
    };
  case 'bounce':
    return {
      animation: `${bounce} ${duration} ${easing} ${delay} both`,
    };
  case 'pulse':
    return {
      animation: `${pulse} ${duration} ${easing} ${delay} infinite`,
    };
  case 'shake':
    return {
      animation: `${createShakeAnimation(isRTL)} ${duration} ${easing} ${delay} both`,
    };
  default:
    return {
      animation: `${fadeIn} ${duration} ${easing} ${delay} both`,
    };
  }
};

// CSS-in-JS helper for creating responsive animations
export const createResponsiveAnimation = (mobileAnimation, desktopAnimation) => {
  return {
    '@media (max-width: 600px)': mobileAnimation,
    '@media (min-width: 601px)': desktopAnimation,
  };
};

// Animation presets for common UI elements
export const animationPresets = {
  modal: {
    enter: scaleIn,
    exit: scaleOut,
    duration: '0.3s',
  },
  drawer: {
    enter: (isRTL) => createSlideAnimation(isRTL ? 'right' : 'left')[isRTL ? 'rtl' : 'ltr'],
    exit: (isRTL) => createSlideAnimation(isRTL ? 'left' : 'right')[isRTL ? 'rtl' : 'ltr'],
    duration: '0.3s',
  },
  toast: {
    enter: (isRTL) => createSlideAndFade(isRTL ? 'left' : 'right', isRTL),
    exit: fadeOut,
    duration: '0.4s',
  },
  card: {
    hover: createHoverAnimation,
    enter: fadeInUp,
    duration: '0.3s',
  },
  button: {
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    duration: '0.2s',
  },
};

export default {
  createSlideAnimation,
  createSlideAndFade,
  createShakeAnimation,
  createHoverAnimation,
  createStaggeredAnimation,
  getDirectionalAnimation,
  createResponsiveAnimation,
  animationPresets,
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  scaleIn,
  scaleOut,
  pulse,
  bounce,
  spin,
  spinReverse,
  loadingDots,
  loadingSpinner,
  loadingPulse,
  successCheckmark,
  errorX,
};
