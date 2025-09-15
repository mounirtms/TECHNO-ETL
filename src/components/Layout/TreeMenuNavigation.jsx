import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Typography,
  Chip,
  Badge,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  useTheme,
  styled,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

import { MENU_TREE } from './MenuTree.js';
import { usePermissions, useLicense } from '../../contexts/PermissionContext';
import { USER_ROLES, ROLE_HIERARCHY, getRolePermissions } from '../../config/firebaseDefaults';

// Enhanced Styled Components with Professional Design
const TreeContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  height: 'calc(100vh - 64px)', // Subtract logo container height
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
  },
}));

const StyledCategoryItem = styled(Box)(({ theme, isRTL, open, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  borderRadius: '8px',
  margin: theme.spacing(0, 1),
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '& .category-icon': {
    color: expanded ? theme.palette.primary.main : theme.palette.text.secondary,
    transition: theme.transitions.create('color', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  ...(isRTL && {
    flexDirection: 'row-reverse',
  }),
  ...(!open && {
    justifyContent: 'center',
    padding: theme.spacing(1),
  }),
}));

const StyledMenuItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'open',
})(({ theme, active, open }) => ({
  borderRadius: '8px',
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
  color: active ? theme.palette.primary.main : 'inherit',
  transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
    duration: theme.transitions.duration.shortest,
  }),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: open ? 32 : 'auto',
  },
  '& .MuiListItemText-root': {
    opacity: open ? 1 : 0,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

const HighlightedText = styled('span')(({ theme }) => ({
  backgroundColor: alpha(theme.palette.warning.main, 0.3),
  borderRadius: '2px',
  padding: '0 2px',
}));

const CategoryDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  background: alpha(theme.palette.primary.main, 0.1),
}));

const TreeMenuNavigation = ({
  open,
  isRTL,
  activeTab,
  onTabClick,
  currentUser,
  translate,
}) => {
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = useState(new Set(['core']));
  const [searchQuery, setSearchQuery] = useState('');

  // Use permission and license hooks
  const {
    filterMenuItems,
    canAccessMenuItem,
    initialized: permissionsInitialized,
    loading: permissionsLoading,
  } = usePermissions();

  const {
    licenseStatus,
    isLicenseValid,
  } = useLicense();

  // Get user role from license status or current user
  const userRole = licenseStatus?.role || currentUser?.role || USER_ROLES.USER;

  const handleCategoryToggle = (categoryId) => {
    const newExpanded = new Set(expandedCategories);

    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleMenuItemClick = (item) => {
    if (canAccessMenuItem(item)) {
      onTabClick(item.id, item.label);
    }
  };

  const getLicenseStatus = (item) => {
    if (!item.licenseRequired) {
      return { icon: LockOpenIcon, color: 'success' };
    }

    if (canAccessMenuItem(item)) {
      return { icon: VerifiedIcon, color: 'primary' };
    }

    return { icon: LockIcon, color: 'error' };
  };

  // Filter menu tree based on permissions and search
  const filteredMenuTree = useMemo(() => {
    if (!permissionsInitialized) {
      return [];
    }

    // First filter by permissions
    const permissionFilteredTree = filterMenuItems(MENU_TREE);

    // Then filter by search query if provided
    if (!searchQuery.trim()) {
      return permissionFilteredTree;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = [];

    permissionFilteredTree.forEach(category => {
      const matchedChildren = category.children?.filter(item => {
        const itemText = (translate(item.labelKey) || item.label).toLowerCase();
        const categoryText = (translate(category.labelKey) || category.label).toLowerCase();

        return itemText.includes(query) || categoryText.includes(query);
      }) || [];

      if (matchedChildren.length > 0) {
        filtered.push({
          ...category,
          children: matchedChildren,
        });
      }
    });

    return filtered;
  }, [searchQuery, translate, permissionsInitialized, filterMenuItems]);

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const newExpanded = new Set();

      filteredMenuTree.forEach(category => {
        if (category.children?.length > 0) {
          newExpanded.add(category.id);
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchQuery, filteredMenuTree]);

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <HighlightedText key={index}>{part}</HighlightedText> :
        part,
    );
  };

  const renderCategoryHeader = (category) => {
    const isExpanded = expandedCategories.has(category.id);
    const CategoryIcon = category.icon;

    return (
      <StyledCategoryItem
        key={category.id}
        onClick={() => handleCategoryToggle(category.id)}
        sx={{
          ...(isRTL && {
            flexDirection: 'row-reverse',
          }),
          ...(!open && {
            justifyContent: 'center',
            padding: theme.spacing(1),
          }),
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          <CategoryIcon className="category-icon" fontSize="small" />
        </ListItemIcon>

        {open && (
          <>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight="600">
                  {highlightText(translate(category.labelKey) || category.label, searchQuery)}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {category.children?.length || 0} items
                </Typography>
              }
              sx={{ flex: 1 }}
            />
            <ExpandMoreIcon
              className="expand-icon"
              sx={{
                transform: isExpanded ? 'rotate(0deg)' : (isRTL ? 'rotate(180deg)' : 'rotate(-90deg)'),
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              }}
            />
          </>
        )}
      </StyledCategoryItem>
    );
  };

  const renderMenuItem = (item) => {
    const isActive = activeTab === item.id;
    const { icon: LicenseIcon, color: licenseColor } = getLicenseStatus(item);
    const ItemIcon = item.icon;

    return (
      <Tooltip
        key={item.id}
        title={!open ? translate(item.labelKey) || item.label : ''}
        placement={isRTL ? 'left' : 'right'}
        arrow
      >
        <StyledMenuItem
          active={isActive}
          open={open}
          onClick={() => handleMenuItemClick(item)}
        >
          <ListItemIcon>
            <ItemIcon fontSize="small" />
          </ListItemIcon>

          {open && (
            <>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" noWrap>
                      {highlightText(translate(item.labelKey) || item.label, searchQuery)}
                    </Typography>
                    {item.featured && (
                      <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                    )}
                  </Box>
                }
                secondary={item.description && (
                  <Typography variant="caption" noWrap>
                    {translate(item.descriptionKey) || item.description}
                  </Typography>
                )}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {item.licenseRequired && (
                  <LicenseIcon sx={{ fontSize: 16, color: `${licenseColor}.main` }} />
                )}
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: 16,
                      minWidth: 16,
                      fontSize: '0.625rem',
                      fontWeight: 'bold',
                      '& .MuiChip-label': {
                        px: 0.5,
                      },
                    }}
                  />
                )}
              </Box>
            </>
          )}
        </StyledMenuItem>
      </Tooltip>
    );
  };

  const renderCategory = (category) => {
    const isExpanded = expandedCategories.has(category.id);

    return (
      <Box key={category.id}>
        {renderCategoryHeader(category)}

        <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {category.children?.map(item => renderMenuItem(item))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <TreeContainer>
      {/* Search Field */}
      {open && (
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={translate('navigation.search') || 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.5 }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
      )}

      {/* Menu Items */}
      {filteredMenuTree.map(category => {
        // Skip empty categories
        if (!category.children || category.children.length === 0) {
          return null;
        }

        return (
          <Box key={category.id}>
            {renderCategory(category)}
            <CategoryDivider />
          </Box>
        );
      })}

      {/* Empty State */}
      {open && filteredMenuTree.length === 0 && searchQuery && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {translate('navigation.noResults') || 'No matching items found'}
          </Typography>
        </Box>
      )}
    </TreeContainer>
  );
};

export default TreeMenuNavigation;
