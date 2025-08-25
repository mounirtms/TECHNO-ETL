import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useBreadcrumbs } from '../../hooks/useNavigation';

const routeLabels = {
  dashboard: 'Dashboard',
  products: 'Products',
  charts: 'Charts & Analytics',
  voting: 'Voting System',
  inventory: 'Inventory',
  orders: 'Orders',
  customers: 'Customers',
  reports: 'Reports',
  settings: 'Settings'
};

const Breadcrumbs = () => {
  const theme = useTheme();
  const { breadcrumbs, navigateToBreadcrumb } = useBreadcrumbs();

  // Don't show breadcrumbs if there's only one item or none
  if(breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 2, px: 1 } as any}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx: any,
            mx: 1
          },
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center'
          }
        }}
      >
        {breadcrumbs.map((breadcrumb: any: any, index: any: any) => {
          const isLast = breadcrumb?.isActive;
          const isFirst = index ===0;

          if(isLast) {
            return (
              <Chip
                key={breadcrumb?.path}
                label={breadcrumb?.label}
                size: any,
                  fontSize: '0.75rem',
                  height: 24
                } as any}
              />
            );
          }

          return (
            <Link
              key={breadcrumb?.path}
              component: any,
              onClick={() => navigateToBreadcrumb(breadcrumb)}
              sx: any,
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 1,
                fontSize: '0.875rem',
                transition: theme.transitions.create(['color', 'background-color']),
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {isFirst && <HomeIcon sx={{ mr: 0.5, fontSize: 16 } as any} />}
              {breadcrumb?.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
