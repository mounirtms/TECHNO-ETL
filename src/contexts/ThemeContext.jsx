import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { alpha } from '@mui/material/styles';

const ThemeContext = createContext();

const lightPalette = {
  primary: {
    main: '#ff5501',
    light: '#ff7733',
    dark: '#cc4400',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#26A69A',
    light: '#51b7ae',
    dark: '#1a746b',
    contrastText: '#ffffff'
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    sidebar: '#ffffff',
    header: '#ffffff'
  },
  text: {
    primary: '#2b2b2b',
    secondary: '#666666',
    disabled: '#9e9e9e'
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: '#2b2b2b',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(255, 85, 1, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)'
  }
};

const darkPalette = {
  primary: {
    main: '#ff6b22',
    light: '#ff8c55',
    dark: '#cc4400',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#4DB6AC',
    light: '#71c5bc',
    dark: '#357f78',
    contrastText: '#ffffff'
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    sidebar: '#1a1a1a',
    header: '#1a1a1a'
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666'
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 107, 34, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)'
  }
};

const createCustomTheme = (mode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.sidebar,
            backgroundImage: 'none',
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.standard,
            }),
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: '8px',
            margin: '4px 8px',
            transition: theme.transitions.create(
              ['background-color', 'color', 'padding-left', 'border-radius'],
              { duration: 200 }
            ),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              paddingLeft: '24px',
              borderRadius: '8px',
            },
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '60%',
                width: '4px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '0 4px 4px 0',
              },
            },
          }),
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            minWidth: 40,
            transition: theme.transitions.create(['color'], {
              duration: theme.transitions.duration.shorter,
            }),
            '.Mui-selected > &': {
              color: theme.palette.primary.main,
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.header,
            backgroundImage: 'none',
            color: theme.palette.text.primary,
            transition: theme.transitions.create(
              ['background-color', 'box-shadow', 'color'],
              { duration: theme.transitions.duration.standard }
            ),
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
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
    },
  });
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() => createCustomTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const value = {
    mode,
    toggleTheme,
    isDark: mode === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;