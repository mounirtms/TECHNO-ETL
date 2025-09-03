import { createTheme } from '@mui/material/styles';
import { useLanguage } from '../contexts/LanguageContext';

const getTheme = (mode = 'light', direction = 'ltr') => createTheme({
  direction,
  palette: {
    mode,
    primary: {
      main: '#F26322',
      light: '#FF8652',
      dark: '#C24D1B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#41362F',
      light: '#594A3F',
      dark: '#2B2B2B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F6F7F9',
      paper: '#ffffff',
      header: '#2B2B2B',
      footer: '#2B2B2B',
      tabs: '#F8F9FA',
    },
    text: {
      primary: '#41362F',
      secondary: '#594A3F',
      disabled: '#A6A6A6',
      hint: '#666666',
      header: '#FFFFFF',
      footer: '#FFFFFF',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: '#2B2B2B',
          color: '#FFFFFF',
          borderRight: 'none',
          borderLeft: 'none',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          '& .MuiListItemIcon-root': {
            color: 'inherit',
            minWidth: 40,
            marginRight: theme.direction === 'rtl' ? 0 : 16,
            marginLeft: theme.direction === 'rtl' ? 16 : 0,
          },
          '& .MuiListItem-root': {
            padding: '8px 16px',
            marginBottom: 4,
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            borderRadius: '0 24px 24px 0',
            ...(theme.direction === 'rtl' && {
              borderRadius: '24px 0 0 24px',
            }),
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: theme.direction === 'rtl' ? 'translateX(-5px)' : 'translateX(5px)',
            },
          },
          '& .Mui-selected': {
            backgroundColor: '#C24D1B !important',
            '&:hover': {
              backgroundColor: '#C24D1B !important',
            },
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 48,
          padding: '6px 16px',
          marginRight: theme.direction === 'rtl' ? 0 : 8,
          marginLeft: theme.direction === 'rtl' ? 8 : 0,
        }),
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600, fontSize: '2.375rem' },
    h2: { fontWeight: 600, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
  },
  shape: {
    borderRadius: 8,
  },
  mixins: {
    toolbar: {
      minHeight: 64,
    },
  },
  customValues: {
    drawerWidth: 240,
    microDrawerWidth: 56,
    headerHeight: 64,
    footerHeight: 64,
  },
});

export const useAppTheme = () => {
  const { currentLanguage } = useLanguage();

  return getTheme('light', currentLanguage === 'ar' ? 'rtl' : 'ltr');
};

export default getTheme;
