import { createTheme } from '@mui/material/styles';

const getTheme = (mode, direction) => {
  return createTheme({
    direction,
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      error: {
        main: '#dc3545',
        light: '#e4606d',
        dark: '#b02a37',
      },
      warning: {
        main: '#ffc107',
        light: '#ffcd39',
        dark: '#d39e00',
      },
      info: {
        main: '#17a2b8',
        light: '#3dd5f3',
        dark: '#0a58ca',
      },
      success: {
        main: '#28a745',
        light: '#34ce57',
        dark: '#1e7e34',
      },
      grey: {
        50: '#f8f9fa',
        100: '#f0f2f5',
        200: '#e9ecef',
        300: '#dee2e6',
        400: '#ced4da',
        500: '#adb5bd',
        600: '#6c757d',
        700: '#495057',
        800: '#343a40',
        900: '#212529',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 2px rgba(0, 0, 0, 0.05)',
      '0 2px 4px rgba(0, 0, 0, 0.05)',
      '0 4px 6px rgba(0, 0, 0, 0.1)',
      '0 6px 8px rgba(0, 0, 0, 0.1)',
      '0 8px 12px rgba(0, 0, 0, 0.1)',
      '0 12px 16px rgba(0, 0, 0, 0.1)',
      '0 16px 24px rgba(0, 0, 0, 0.1)',
      '0 20px 32px rgba(0, 0, 0, 0.1)',
      '0 24px 40px rgba(0, 0, 0, 0.1)',
      '0 28px 48px rgba(0, 0, 0, 0.1)',
      '0 32px 56px rgba(0, 0, 0, 0.1)',
      '0 36px 64px rgba(0, 0, 0, 0.1)',
      '0 40px 72px rgba(0, 0, 0, 0.1)',
      '0 44px 80px rgba(0, 0, 0, 0.1)',
      '0 48px 88px rgba(0, 0, 0, 0.1)',
      '0 52px 96px rgba(0, 0, 0, 0.1)',
      '0 56px 104px rgba(0, 0, 0, 0.1)',
      '0 60px 112px rgba(0, 0, 0, 0.1)',
      '0 64px 120px rgba(0, 0, 0, 0.1)',
      '0 68px 128px rgba(0, 0, 0, 0.1)',
      '0 72px 136px rgba(0, 0, 0, 0.1)',
      '0 76px 144px rgba(0, 0, 0, 0.1)',
      '0 80px 152px rgba(0, 0, 0, 0.1)',
      '0 84px 160px rgba(0, 0, 0, 0.1)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: mode === 'light' ? '#e9ecef' : '#2d2d2d',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: mode === 'light' ? '#f8f9fa' : '#1e1e1e',
              borderBottom: `1px solid ${mode === 'light' ? '#e9ecef' : '#2d2d2d'}`,
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: mode === 'light' ? '#f8f9fa' : '#2d2d2d',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(8px)',
            backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            }
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            backgroundImage: 'none'
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            width: '100%',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'center'
            }
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)'
            }
          }
        }
      }
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

export { getTheme };
