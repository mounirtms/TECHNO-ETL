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
    alpha
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
    Clear as ClearIcon
} from '@mui/icons-material';

import { MENU_TREE } from './MenuTree';
import { check_license_status, get_license_details } from '../../utils/licenseUtils';
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
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
        },
    },
}));

const StyledCategoryItem = styled(ListItem, {
    shouldForwardProp: (prop) => !['isRTL', 'open', 'expanded'].includes(prop),
})(({ theme, isRTL, open, expanded }) => ({
    padding: theme.spacing(1, 1.5),
    margin: theme.spacing(0.25, 0.5),
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    position: 'relative',
    background: expanded 
        ? alpha(theme.palette.primary.main, 0.08)
        : 'transparent',
    borderLeft: expanded 
        ? `3px solid ${theme.palette.primary.main}`
        : '3px solid transparent',
    transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateX(2px)',
        '& .category-icon': {
            color: theme.palette.primary.main,
        },
        '& .expand-icon': {
            color: theme.palette.primary.main,
        },
    },
    '& .category-icon': {
        color: expanded ? theme.palette.primary.main : theme.palette.text.secondary,
        transition: theme.transitions.create('color'),
    },
    '& .expand-icon': {
        color: theme.palette.text.secondary,
        transition: theme.transitions.create(['color', 'transform']),
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
    },
}));

const StyledMenuItem = styled(ListItem, {
    shouldForwardProp: (prop) => !['isRTL', 'open', 'selected', 'licensed', 'hasAccess'].includes(prop),
})(({ theme, isRTL, open, selected, licensed, hasAccess }) => ({
    padding: theme.spacing(0.75, 2),
    margin: theme.spacing(0.25, 1),
    marginLeft: theme.spacing(3), // Indent for tree structure
    borderRadius: theme.spacing(0.75),
    cursor: hasAccess ? 'pointer' : 'not-allowed',
    position: 'relative',
    opacity: hasAccess ? 1 : 0.6,
    background: selected 
        ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
        : 'transparent',
    borderLeft: selected 
        ? `2px solid ${theme.palette.primary.main}`
        : '2px solid transparent',
    transition: theme.transitions.create(['all'], {
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
        backgroundColor: hasAccess 
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.error.main, 0.04),
        transform: hasAccess ? 'translateX(2px)' : 'none',
        '& .menu-icon': {
            color: hasAccess ? theme.palette.primary.main : theme.palette.error.main,
        },
        '& .license-indicator': {
            opacity: 1,
        },
    },
    '& .menu-icon': {
        color: selected 
            ? theme.palette.primary.main 
            : hasAccess 
                ? theme.palette.text.primary 
                : theme.palette.text.disabled,
        transition: theme.transitions.create('color'),
    },
    '& .license-indicator': {
        opacity: 0.7,
        transition: theme.transitions.create('opacity'),
    },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1, 1.5),
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const HighlightedText = styled('span')(({ theme }) => ({
    backgroundColor: alpha(theme.palette.warning.main, 0.3),
    color: theme.palette.warning.contrastText,
    fontWeight: 600,
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
    translate 
}) => {
    const theme = useTheme();
    const [expandedCategories, setExpandedCategories] = useState(new Set(['core']));
    const [userLicense, setUserLicense] = useState(null);
    const [userRole, setUserRole] = useState(USER_ROLES.USER);
    const [licensedItems, setLicensedItems] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize user license and permissions
    useEffect(() => {
        const initializeUserData = async () => {
            if (!currentUser?.uid) {
                setUserLicense(null);
                setLicensedItems(new Set());
                return;
            }

            try {
                // Get user role from user data or default to USER
                const userRole = currentUser.role || USER_ROLES.USER;
                setUserRole(userRole);

                // Get license details
                const licenseDetails = await get_license_details(currentUser.uid);
                setUserLicense(licenseDetails);

                // Check which items are accessible
                const accessible = new Set();
                
                // Check each category and its children
                for (const category of MENU_TREE) {
                    if (category.children) {
                        for (const item of category.children) {
                            // If item doesn't require license, always include it
                            if (!item.licensed) {
                                accessible.add(item.id);
                                continue;
                            }

                            // Check license status
                            const hasLicense = await check_license_status(currentUser.uid);
                            const rolePermissions = getRolePermissions(userRole);
                            
                            // Grant access based on license or role permissions
                            if (hasLicense || rolePermissions.canAccessSystem || import.meta.env.DEV) {
                                accessible.add(item.id);
                            }
                        }
                    }
                }

                setLicensedItems(accessible);
            } catch (error) {
                console.error('Error initializing user data:', error);
                // In development, allow access to all items
                if (import.meta.env.DEV) {
                    const allItems = new Set();
                    MENU_TREE.forEach(category => {
                        if (category.children) {
                            category.children.forEach(item => allItems.add(item.id));
                        }
                    });
                    setLicensedItems(allItems);
                }
            }
        };

        initializeUserData();
    }, [currentUser]);

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
        if (licensedItems.has(item.id)) {
            onTabClick(item.id);
        }
    };

    const getLicenseStatus = (item) => {
        if (!item.licensed) {
            return { icon: <LockOpenIcon />, color: 'success' };
        }
        
        if (licensedItems.has(item.id)) {
            return { icon: <VerifiedIcon />, color: 'primary' };
        }
        
        return { icon: <LockIcon />, color: 'error' };
    };

    // Filter and highlight search results
    const filteredMenuTree = useMemo(() => {
        if (!searchQuery.trim()) {
            return MENU_TREE;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = [];

        MENU_TREE.forEach(category => {
            const matchedChildren = category.children?.filter(item => {
                const itemText = (translate(item.labelKey) || item.label).toLowerCase();
                const categoryText = (translate(category.labelKey) || category.label).toLowerCase();
                return itemText.includes(query) || categoryText.includes(query);
            }) || [];

            if (matchedChildren.length > 0) {
                filtered.push({
                    ...category,
                    children: matchedChildren
                });
            }
        });

        return filtered;
    }, [searchQuery, translate]);

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
                part
        );
    };

    const renderCategoryHeader = (category) => {
        const isExpanded = expandedCategories.has(category.id);
        const CategoryIcon = category.icon;
        
        return (
            <StyledCategoryItem
                key={category.id}
                isRTL={isRTL}
                open={open}
                expanded={isExpanded}
                onClick={() => handleCategoryToggle(category.id)}
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
                        />
                        
                        <IconButton size="small" className="expand-icon">
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
                
                {!open && (
                    <Tooltip 
                        title={translate(category.labelKey) || category.label}
                        placement={isRTL ? "left" : "right"}
                    >
                        <Badge
                            badgeContent={category.children?.length || 0}
                            color="primary"
                            variant="dot"
                            invisible={!category.children?.length}
                        >
                            <Box />
                        </Badge>
                    </Tooltip>
                )}
            </StyledCategoryItem>
        );
    };

    const renderMenuItem = (item) => {
        const isSelected = activeTab === item.id;
        const hasAccess = licensedItems.has(item.id);
        const licenseStatus = getLicenseStatus(item);
        const ItemIcon = item.icon;

        return (
            <StyledMenuItem
                key={item.id}
                isRTL={isRTL}
                open={open}
                selected={isSelected}
                licensed={item.licensed}
                hasAccess={hasAccess}
                onClick={() => handleMenuItemClick(item)}
            >
                <ListItemIcon sx={{ minWidth: 28 }}>
                    <ItemIcon className="menu-icon" fontSize="small" />
                </ListItemIcon>
                
                {open && (
                    <>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: isSelected ? 600 : 400,
                                            color: hasAccess ? 'inherit' : 'text.disabled'
                                        }}
                                    >
                                        {highlightText(translate(item.labelKey) || item.label, searchQuery)}
                                    </Typography>
                                    
                                    {item.licensed && (
                                        <IconButton 
                                            size="small" 
                                            sx={{ 
                                                p: 0, 
                                                color: licenseStatus.color === 'success' ? 'success.main' : 
                                                       licenseStatus.color === 'primary' ? 'primary.main' : 'error.main'
                                            }}
                                            className="license-indicator"
                                        >
                                            {licenseStatus.icon}
                                        </IconButton>
                                    )}
                                </Box>
                            }
                        />
                        
                        {/* Quality indicators for special items */}
                        {(item.id === 'BugBounty' || item.id === 'Voting') && (
                            <StarIcon 
                                fontSize="small" 
                                sx={{ 
                                    color: theme.palette.warning.main,
                                    opacity: 0.7 
                                }} 
                            />
                        )}
                    </>
                )}
                
                {!open && (
                    <Tooltip 
                        title={`${translate(item.labelKey) || item.label} ${hasAccess ? '' : '(License Required)'}`}
                        placement={isRTL ? "left" : "right"}
                    >
                        <Box display="flex" alignItems="center">
                            {item.licensed && !hasAccess && (
                                <LockIcon 
                                    fontSize="small" 
                                    sx={{ 
                                        color: theme.palette.error.main,
                                        opacity: 0.7 
                                    }} 
                                />
                            )}
                        </Box>
                    </Tooltip>
                )}
            </StyledMenuItem>
        );
    };

    return (
        <TreeContainer>
            {/* Search Input */}
            {open && (
                <SearchContainer>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchQuery('')}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                },
                                '&.Mui-focused': {
                                    backgroundColor: theme.palette.background.paper,
                                },
                            },
                        }}
                    />
                </SearchContainer>
            )}
            
            <List component="nav" disablePadding>
                {filteredMenuTree.map((category, index) => (
                    <React.Fragment key={category.id}>
                        {/* Category Header */}
                        {renderCategoryHeader(category)}
                        
                        {/* Category Items */}
                        <Collapse 
                            in={expandedCategories.has(category.id)} 
                            timeout="auto" 
                            unmountOnExit
                        >
                            <List component="div" disablePadding>
                                {category.children
                                    ?.filter(item => !item.hidden)
                                    .map(renderMenuItem)
                                }
                            </List>
                        </Collapse>
                        
                        {/* Divider between categories */}
                        {open && index < MENU_TREE.length - 1 && (
                            <CategoryDivider />
                        )}
                    </React.Fragment>
                ))}
            </List>
            
            {/* License Status Footer */}
            {open && userLicense && (
                <Box 
                    sx={{ 
                        p: 2, 
                        mt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        background: alpha(theme.palette.background.paper, 0.5)
                    }}
                >
                    <Typography variant="caption" color="text.secondary" display="block">
                        License: {userLicense.licenseType?.toUpperCase() || 'FREE'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Role: {userRole?.replace('_', ' ').toUpperCase()}
                    </Typography>
                    {userLicense.expiryDate && (
                        <Typography variant="caption" color="warning.main" display="block">
                            Expires: {new Date(userLicense.expiryDate).toLocaleDateString()}
                        </Typography>
                    )}
                </Box>
            )}
        </TreeContainer>
    );
};

export default TreeMenuNavigation;
