import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  Fade,
  Popper,
  ClickAwayListener,
  Divider,
  CircularProgress,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../contexts/SearchContext';

const SearchComponent = ({ variant = 'outlined', size = 'medium', fullWidth = false }) => {
  const navigate = useNavigate();
  const { searchQuery, searchResults, isSearching, performSearch, clearSearch, getHighlightedText } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const anchorRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('techno-etl-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('techno-etl-recent-searches', JSON.stringify(updated));
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    performSearch(query);
    setIsOpen(query.length > 0);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setIsOpen(false);
    }
  };

  const handleResultClick = (result) => {
    navigate(result.item.path);
    saveRecentSearch(searchQuery);
    setIsOpen(false);
    clearSearch();
  };

  const handleRecentSearchClick = (query) => {
    performSearch(query);
    setIsOpen(true);
  };

  const handleClearSearch = () => {
    clearSearch();
    setIsOpen(false);
    searchRef.current?.focus();
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const filteredResults = selectedCategory === 'all' 
    ? searchResults 
    : searchResults.filter(result => result.item.category.toLowerCase() === selectedCategory);

  const categories = ['all', 'overview', 'setup', 'features', 'architecture', 'api', 'integration', 'devops', 'support'];

  const getCategoryColor = (category) => {
    const colors = {
      overview: 'primary',
      setup: 'success',
      features: 'warning',
      architecture: 'info',
      api: 'secondary',
      integration: 'error',
      devops: 'primary',
      support: 'warning'
    };
    return colors[category.toLowerCase()] || 'default';
  };

  const getResultIcon = (category) => {
    const icons = {
      overview: <DocumentIcon />,
      setup: <TrendingIcon />,
      features: <TrendingIcon />,
      architecture: <DocumentIcon />,
      api: <DocumentIcon />,
      integration: <TrendingIcon />,
      devops: <DocumentIcon />,
      support: <DocumentIcon />
    };
    return icons[category.toLowerCase()] || <DocumentIcon />;
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
        <form onSubmit={handleSearchSubmit}>
          <TextField
            ref={searchRef}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(searchQuery.length > 0 || recentSearches.length > 0)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isSearching && (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  )}
                  {searchQuery && (
                    <Tooltip title="Clear search">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }
            }}
          />
        </form>

        <Popper
          open={isOpen}
          anchorEl={searchRef.current}
          placement="bottom-start"
          style={{ width: searchRef.current?.offsetWidth || 'auto', zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  maxHeight: 500,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {/* Category Filters */}
                {searchQuery && searchResults.length > 0 && (
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FilterIcon sx={{ mr: 1, fontSize: 16 }} color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Filter by category:
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {categories.map((category) => (
                        <Chip
                          key={category}
                          label={category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                          size="small"
                          variant={selectedCategory === category ? 'filled' : 'outlined'}
                          color={selectedCategory === category ? getCategoryColor(category) : 'default'}
                          onClick={() => setSelectedCategory(category)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {/* Search Results */}
                  {searchQuery && (
                    <AnimatePresence>
                      {filteredResults.length > 0 ? (
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Typography variant="caption" color="text.secondary">
                                  <Badge badgeContent={filteredResults.length} color="primary" sx={{ mr: 1 }}>
                                    <SearchIcon fontSize="small" />
                                  </Badge>
                                  Search Results
                                </Typography>
                              }
                            />
                          </ListItem>
                          {filteredResults.slice(0, 8).map((result, index) => (
                            <motion.div
                              key={result.item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <ListItem
                                button
                                onClick={() => handleResultClick(result)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'action.hover'
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  {getResultIcon(result.item.category)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography
                                        variant="subtitle2"
                                        dangerouslySetInnerHTML={{
                                          __html: getHighlightedText(
                                            result.item.title,
                                            result.matches?.find(m => m.key === 'title')?.indices
                                          )
                                        }}
                                      />
                                      <Chip
                                        label={result.item.category}
                                        size="small"
                                        color={getCategoryColor(result.item.category)}
                                        variant="outlined"
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      dangerouslySetInnerHTML={{
                                        __html: getHighlightedText(
                                          result.item.description,
                                          result.matches?.find(m => m.key === 'description')?.indices
                                        )
                                      }}
                                    />
                                  }
                                />
                                <Typography variant="caption" color="primary.main" sx={{ ml: 1 }}>
                                  {Math.round((1 - result.score) * 100)}% match
                                </Typography>
                              </ListItem>
                            </motion.div>
                          ))}
                          {filteredResults.length > 8 && (
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Typography variant="caption" color="text.secondary" align="center">
                                    +{filteredResults.length - 8} more results...
                                  </Typography>
                                }
                              />
                            </ListItem>
                          )}
                        </List>
                      ) : searchQuery && !isSearching ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No results found for "{searchQuery}"
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            Try different keywords or check spelling
                          </Typography>
                        </Box>
                      ) : null}
                    </AnimatePresence>
                  )}

                  {/* Recent Searches */}
                  {!searchQuery && recentSearches.length > 0 && (
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="caption" color="text.secondary">
                              Recent Searches
                            </Typography>
                          }
                        />
                      </ListItem>
                      {recentSearches.map((search, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleRecentSearchClick(search)}
                          sx={{
                            pl: 4,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                {search}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      <Divider />
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="caption" color="text.disabled" align="center">
                              Start typing to search documentation...
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  )}

                  {/* Empty State */}
                  {!searchQuery && recentSearches.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Search through all documentation
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Find guides, API references, and examples
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchComponent;
