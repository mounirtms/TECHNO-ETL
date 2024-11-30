import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: {
      main: '#F26322', // Magento orange
      light: '#FF8652',
      dark: '#C24D1B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26A2AA', // Magento teal
      light: '#4DC4CC',
      dark: '#1C7A80',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F6F7F9',
      paper: '#ffffff',
      header: '#2B2B2B', // Dark header
      footer: '#2B2B2B', // Dark footer
      tabs: '#F8F9FA', // Light gray for tabs
    },
    text: {
      primary: '#41362F',
      secondary: '#514943',
      header: '#FFFFFF', // White text for dark header
      footer: '#FFFFFF', // White text for dark footer
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2B2B2B',
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2B2B2B',
          color: '#FFFFFF',
          borderRight: 'none',
          '& .MuiListItemIcon-root': {
            color: '#FFFFFF',
          },
          '& .MuiListItemText-root': {
            color: '#FFFFFF',
          },
          '& .MuiListItemButton-root:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '& .Mui-selected': {
            backgroundColor: '#F26322 !important',
            '&:hover': {
              backgroundColor: '#C24D1B !important',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F9FA',
          borderBottom: '2px solid #E9ECEF',
          '& .MuiTab-root': {
            color: '#6C757D',
            '&.Mui-selected': {
              color: '#F26322',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#F26322',
            height: '3px',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            color: '#F26322',
            opacity: 0.8,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 600, fontSize: '2rem' },
    h2: { fontWeight: 600, fontSize: '1.75rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
  },
  // Custom values
  customValues: {
    drawerWidth: 240,
    microDrawerWidth: 56,
    headerHeight: 64,
    footerHeight: 28,
    tabHeight: 40,
  },
});

export default theme;
