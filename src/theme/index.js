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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2B2B2B',
          color: '#FFFFFF',
          borderRight: 'none',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          '& .MuiListItemIcon-root': {
            color: '#FFFFFF',
          },
          '& .MuiListItemText-root': {
            color: '#FFFFFF',
          },
          '& .MuiListItemButton-root': {
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateX(5px)',
            },
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
