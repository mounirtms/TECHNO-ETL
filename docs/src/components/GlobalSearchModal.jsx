import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Badge,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
  Star as StarIcon,
  KeyboardArrowRight as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../contexts/SearchContext';

const GlobalSearchModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { searchQuery, searchResults, isSearching, performSearch, clearSearch, getHighlightedText, documentationContent } = useSearch();
  const [tabValue, setTabValue] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularPages, setPopularPages] = useState([]);

  useEffect(() => {
    if (open) {
      // Load recent searches
      const saved = localStorage.getItem('techno-etl-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }

      // Set popular pages (most commonly accessed)
      setPopularPages([
        documentationContent.find(doc => doc.id === 'getting-started'),
        documentationContent.find(doc => doc.id === 'system-overview'),
        documentationContent.find(doc => doc.id === 'api-documentation'),
        documentationContent.find(doc => doc.id === 'features-showcase'),
        documentationContent.find(doc => doc.id === 'magento-integration'),
        documentationContent.find(doc => doc.id === 'troubleshooting')
      ].filter(Boolean));
    }
  }, [open, documentationContent]);

  const handleSearchChange = (event) => {
    performSearch(event.target.value);
  };

  const handleResultClick = (item) => {
    navigate(item.path);
    saveRecentSearch(searchQuery);
    onClose();
    clearSearch();
  };

  const handleRecentSearchClick = (query) => {
    performSearch(query);
    setTabValue(0); // Switch to results tab
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('techno-etl-recent-searches', JSON.stringify(updated));
  };

  const handleClose = () => {
    clearSearch();
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
    return colors[category?.toLowerCase()] || 'default';
  };

  const getResultIcon = (category) => {
    const icons = {
      overview: <DocumentIcon />,
      setup: <TrendingIcon />,
      features: <StarIcon />,
      architecture: <DocumentIcon />,
      api: <DocumentIcon />,
      integration: <TrendingIcon />,
      devops: <DocumentIcon />,
      support: <DocumentIcon />
    };
    return icons[category?.toLowerCase()] || <DocumentIcon />;
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const category = result.item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(result);
    return acc;
  }, {});

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              placeholder="Search all documentation..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: isSearching && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Search Stats */}
          {searchQuery && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {isSearching ? 'Searching...' : `${searchResults.length} results found`}
              </Typography>
              {searchResults.length > 0 && (
                <Chip
                  label={`${Object.keys(groupedResults).length} categories`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Content Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={
                <Badge badgeContent={searchResults.length} color="primary" invisible={!searchQuery || searchResults.length === 0}>
                  Results
                </Badge>
              } 
            />
            <Tab label="Recent" />
            <Tab label="Popular" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {/* Results Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 2 }}>
              {searchQuery ? (
                searchResults.length > 0 ? (
                  <AnimatePresence>
                    {Object.entries(groupedResults).map(([category, results]) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                          {category} ({results.length})
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {results.map((result, index) => (
                            <Grid item xs={12} sm={6} key={result.item.id}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 4
                                  }
                                }}
                                onClick={() => handleResultClick(result.item)}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    {getResultIcon(result.item.category)}
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ ml: 1, flexGrow: 1 }}
                                      dangerouslySetInnerHTML={{
                                        __html: getHighlightedText(
                                          result.item.title,
                                          result.matches?.find(m => m.key === 'title')?.indices
                                        )
                                      }}
                                    />
                                    <ArrowIcon color="action" />
                                  </Box>
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
                                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                      label={result.item.category}
                                      size="small"
                                      color={getCategoryColor(result.item.category)}
                                      variant="outlined"
                                    />
                                    <Typography variant="caption" color="primary.main">
                                      {Math.round((1 - result.score) * 100)}% match
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                        <Divider sx={{ mb: 3 }} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : !isSearching ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No results found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Try different keywords or check spelling
                    </Typography>
                  </Box>
                ) : null
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Start typing to search
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Search through all documentation pages
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Recent Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              {recentSearches.length > 0 ? (
                <List>
                  {recentSearches.map((search, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => handleRecentSearchClick(search)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={search}
                        secondary={`Search #${index + 1}`}
                      />
                      <ArrowIcon color="action" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No recent searches
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Your search history will appear here
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Popular Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {popularPages.map((page, index) => (
                  <Grid item xs={12} sm={6} key={page.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => handleResultClick(page)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <StarIcon color="warning" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            {page.title}
                          </Typography>
                          <ArrowIcon color="action" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {page.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={page.category}
                            size="small"
                            color={getCategoryColor(page.category)}
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Press <kbd style={{ padding: '2px 6px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '3px' }}>Ctrl+K</kbd> to open search anywhere
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearchModal;
