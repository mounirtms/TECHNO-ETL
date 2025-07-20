import { createTheme, alpha } from '@mui/material/styles';

// ===== PRODUCTION THEME CONFIGURATION =====

// Base color palette
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#F26322', // Brand primary
    600: '#C24D1B',
    700: '#A03E16',
    800: '#7E2F11',
    900: '#5C200C',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#41362F', // Brand secondary
    600: '#594A3F',
    700: '#2B2B2B',
    800: '#1F1F1F',
    900: '#131313',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  }
};

// Typography configuration
const typography = {
  fontFamily: [
    '"Inter"',
    '"Roboto"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ].join(','),
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'none',
  },
};

// Component overrides
const getComponentOverrides = (mode) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#959595 #f1f1f1',
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          backgroundColor: mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: mode === 'dark' ? '#6b6b6b' : '#959595',
          minHeight: 24,
          border: mode === 'dark' ? '2px solid #2b2b2b' : '2px solid #f1f1f1',
        },
        '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
          backgroundColor: mode === 'dark' ? '#959595' : '#6b6b6b',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 500,
        padding: '8px 16px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'box-shadow 0.2s ease-in-out',
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      elevation2: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      elevation3: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: 'none',
        borderRadius: 12,
        '& .MuiDataGrid-columnHeaders': {
          borderRadius: '12px 12px 0 0',
          backgroundColor: mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.02),
          fontWeight: 600,
        },
        '& .MuiDataGrid-cell': {
          borderBottom: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            backgroundColor: mode === 'dark' ? alpha('#ffffff', 0.04) : alpha('#000000', 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? alpha(colors.primary[500], 0.2) : alpha(colors.primary[500], 0.1),
            '&:hover': {
              backgroundColor: mode === 'dark' ? alpha(colors.primary[500], 0.3) : alpha(colors.primary[500], 0.15),
            },
          },
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
          backgroundColor: mode === 'dark' ? alpha('#ffffff', 0.02) : alpha('#000000', 0.02),
        },
      },
    },
  },
});

// Create production theme
export const createProductionTheme = (mode = 'light', direction = 'ltr') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    direction,
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      grey: colors.grey,
      background: {
        default: isDark ? '#0a0a0a' : '#F6F7F9',
        paper: isDark ? '#1a1a1a' : '#ffffff',
        header: '#2B2B2B',
        footer: '#2B2B2B',
        tabs: isDark ? '#2a2a2a' : '#F8F9FA',
      },
      text: {
        primary: isDark ? '#ffffff' : '#41362F',
        secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : '#594A3F',
        disabled: isDark ? 'rgba(255, 255, 255, 0.5)' : '#A6A6A6',
        hint: isDark ? 'rgba(255, 255, 255, 0.5)' : '#666666',
        header: '#FFFFFF',
        footer: '#FFFFFF',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography,
    shape: {
      borderRadius: 8,
    },
    components: getComponentOverrides(mode),
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    spacing: 8,
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  });
};

// Export theme variants
export const lightTheme = createProductionTheme('light');
export const darkTheme = createProductionTheme('dark');

// Export theme factory
export default createProductionTheme;
