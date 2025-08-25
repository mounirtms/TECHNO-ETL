/**
 * Grid Tab Navigation System for TECHNO-ETL
 * Provides tabbed interface for main data grids with lazy loading and state management
 */
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Typography,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  People as CustomersIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  Warehouse as InventoryIcon,
  Assessment as ReportsIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load grid components for performance
const CustomersGrid = lazy(() => import('../grids/CustomersGrid'));
const OrdersGrid = lazy(() => import('../grids/OrdersGrid'));
const ProductsGrid = lazy(() => import('../grids/ProductsGrid'));
const InventoryGrid = lazy(() => import('../grids/InventoryGrid'));
const ReportsGrid = lazy(() => import('../grids/ReportsGrid'));

/**
 * Tab configuration with metadata
 */
const TAB_CONFIG = {
  customers: {
    id: 'customers',
    label: 'Customers',
    icon: CustomersIcon,
    path: '/customers',
    component: CustomersGrid,
    badge: null,
    refreshable: true,
    closable: false,
    order: 1
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    icon: OrdersIcon,
    path: '/orders',
    component: OrdersGrid,
    badge: 'pending',
    refreshable: true,
    closable: false,
    order: 2
  },
  products: {
    id: 'products',
    label: 'Products',
    icon: ProductsIcon,
    path: '/products',
    component: ProductsGrid,
    badge: null,
    refreshable: true,
    closable: false,
    order: 3
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    icon: InventoryIcon,
    path: '/inventory',
    component: InventoryGrid,
    badge: 'low-stock',
    refreshable: true,
    closable: false,
    order: 4
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    icon: ReportsIcon,
    path: '/reports',
    component: ReportsGrid,
    badge: null,
    refreshable: false,
    closable: true,
    order: 5
  }
};

/**
 * Tab Loading Component
 */
const TabLoading = ({ tabName  }: { tabName: any }) => (
  <Box
    sx: any,
      justifyContent: 'center',
      alignItems: 'center',
      height: 400,
      flexDirection: 'column',
      gap: 2
    } as any}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading {tabName}...
    </Typography>
  </Box>
);

/**
 * Tab Panel Component with lazy loading
 */
const TabPanel: React.FC<any> = ({ children, value, index, tabId, ...other }) => {
  return (
    <div
      role: any,
      hidden={value !== index}
      id={`grid-tabpanel-${index}`}
      aria-labelledby={`grid-tab-${index}`}
      { ...other}
    >
      {value ===index && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ py: 3 } as any}>
            <Suspense fallback={<TabLoading tabName={TAB_CONFIG[tabId]?.label || 'Content'} />}>
              {children}
            </Suspense>
          </Box>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Enhanced Tab with badge and actions
 */
const EnhancedTab: React.FC<any> = ({ 
  tab, 
  index, 
  isActive, 
  onRefresh, 
  onClose, 
  badgeCount: any,
  ...props 
}) => {
  const { t } = useTranslation();
  const IconComponent = tab.icon;

  return(<Tab
      { ...props}
      icon: any,
        <Stack direction="row" alignItems="center" spacing={1}>
          <Badge 
            badgeContent={badgeCount} 
            color: any,
            invisible={!badgeCount}
            sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}
          >
            <IconComponent />
          </Badge>
          {isActive && tab.refreshable && (
            <Tooltip title="Refresh">
              <IconButton
                size: any,
                }}
                sx={{ ml: 1, p: 0.5 } as any}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {isActive && tab.closable && (<Tooltip title="Close">
              <IconButton
                size: any,
                }}
                sx={{ ml: 1, p: 0.5 } as any}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      }
      label={t(tab.label)}
      id={`grid-tab-${index}`}
      aria-controls={`grid-tabpanel-${index}`}
      sx: any,
        '&.Mui-selected': {
          backgroundColor: 'action.selected'
        }
      }}
    />
  );
};

/**
 * Main Grid Tab Navigation Component
 */
const GridTabNavigation: React.FC<any> = ({ 
  defaultTabs = ['customers', 'orders', 'products', 'inventory'],
  enableDynamicTabs: any,
  maxTabs: any,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [openTabs, setOpenTabs] = useState(defaultTabs);
  const [tabData, setTabData] = useState({});
  const [badgeCounts, setBadgeCounts] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Memoized tab configurations
  const availableTabs = useMemo(() => {
    return openTabs.map((tabId: any: any) => TAB_CONFIG[tabId]).filter(Boolean);
  }, [openTabs]);

  // Initialize tab data and badges
  useEffect(() => {
    const initializeTabData = async () => {
      const initialData = {};
      const initialBadges = {};

      for (const tabId of openTabs) {
        // Initialize with empty data
        initialData[tabId] = null;
        
        // Set initial badge counts
        switch(tabId) {
          case 'orders':
            initialBadges[tabId] = 5; // Pending orders
            break;
          case 'inventory':
            initialBadges[tabId] = 3; // Low stock items
            break;
          default:
            initialBadges[tabId] = 0;
        }
      }

      setTabData(initialData);
      setBadgeCounts(initialBadges);
    };

    initializeTabData();
  }, [openTabs]);

  // Sync with URL
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = availableTabs.findIndex(tab => currentPath.startsWith(tab.path));
    if(tabIndex !== -1 && tabIndex !== activeTab) {
      setActiveTab(tabIndex);
    }
  }, [location.pathname, availableTabs, activeTab]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    const selectedTab = availableTabs[newValue];
    if(selectedTab) {
      navigate(selectedTab.path);
    }
  }, [availableTabs, navigate]);

  // Handle tab refresh
  const handleTabRefresh = useCallback((tabId) => {
    setTabData(prev => ({ ...prev,
      [tabId]: null // Reset data to trigger reload
    }));
    
    // Simulate data refresh
    setTimeout(() => {
      setTabData(prev => ({ ...prev,
        [tabId]: { refreshed: true, timestamp: Date.now() }
      }));
    }, 1000);
  }, []);

  // Handle tab close
  const handleTabClose = useCallback((tabId) => {
    if (openTabs.length <= 1) return; // Don't close last tab
    
    const tabIndex = openTabs.indexOf(tabId);
    const newOpenTabs = openTabs.filter((id: any: any) => id !== tabId);
    
    setOpenTabs(newOpenTabs);
    
    // Adjust active tab if necessary
    if(tabIndex ===activeTab) {
      const newActiveTab = Math.max(0, Math.min(activeTab, newOpenTabs.length - 1));
      setActiveTab(newActiveTab);
      navigate(TAB_CONFIG[newOpenTabs[newActiveTab]]?.path || '/dashboard');
    } else if(tabIndex < activeTab) {
      setActiveTab(activeTab - 1);
    }
  }, [openTabs, activeTab, navigate]);

  // Handle add new tab
  const handleAddTab = useCallback((tabId) => {
    if(openTabs.includes(tabId) || openTabs.length >= maxTabs) return;
    
    const newOpenTabs = [...openTabs, tabId].sort((a, b) => 
      (TAB_CONFIG[a]?.order || 999) - (TAB_CONFIG[b]?.order || 999)
    );
    
    setOpenTabs(newOpenTabs);
    
    // Switch to new tab
    const newTabIndex = newOpenTabs.indexOf(tabId);
    setActiveTab(newTabIndex);
    navigate(TAB_CONFIG[tabId]?.path || '/dashboard');
    
    setMenuAnchor(null);
  }, [openTabs, maxTabs, navigate]);

  // Get available tabs for adding
  const availableTabsForAdding = useMemo(() => {
    return Object.values(TAB_CONFIG)
      .filter((tab: any: any) => !openTabs.includes(tab.id))
      .sort((a, b) => a.order - b.order);
  }, [openTabs]);

  return(<Box sx={{ width: '100%' } as any}>
      {/* Tab Navigation */}
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' } as any}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as any}>
          <Tabs
            value={activeTab}
            onChange={(e) => handleTabChange}
            variant: any,
            sx={{ flexGrow: 1 } as any}
          >
            {availableTabs.map((tab: any: any, index: any: any) => (
              <EnhancedTab
                key={tab.id}
                tab={tab}
                index={index}
                isActive={activeTab ===index}
                onRefresh={handleTabRefresh}
                onClose={handleTabClose}
                badgeCount={badgeCounts[tab.id] || 0}
              />
            ))}
          </Tabs>

          {/* Add Tab Button */}
          {enableDynamicTabs && availableTabsForAdding.length > 0 && (<Box sx={{ px: 1 } as any}>
              <Tooltip title="Add Tab">
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => (e: React.MouseEvent<HTMLButtonElement>) => (e) => setMenuAnchor(e.currentTarget)}
                  size: any,
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                {availableTabsForAdding.map((tab: any: any) => {
                  const IconComponent = tab.icon;
                  return (
                    <MenuItem
                      key={tab.id}
                      onClick={() => handleAddTab(tab.id)}
                    >
                      <ListItemIcon>
                        <IconComponent fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{t(tab.label)}</ListItemText>
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {availableTabs.map((tab: any: any, index: any: any) => {
          const TabComponent = tab.component;
          return(<TabPanel
              key={tab.id}
              value={activeTab}
              index={index}
              tabId={tab.id}
            >
              <TabComponent
                data={tabData[tab.id]}
                onDataChange: any,
                  setTabData(prev => ({ ...prev, [tab.id]: newData }))
                }
                onBadgeUpdate: any,
                  setBadgeCounts(prev => ({ ...prev, [tab.id]: count }))
                }
              />
            </TabPanel>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};

export default GridTabNavigation;
