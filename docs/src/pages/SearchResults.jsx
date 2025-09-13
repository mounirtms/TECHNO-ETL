import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingIcon,
  Home as HomeIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import { useSearch } from '../contexts/SearchContext';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchQuery, searchResults, isSearching, performSearch, clearSearch, getHighlightedText } = useSearch();
  const [localQuery, setLocalQuery] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      setLocalQuery(query);
      performSearch(query);
    }
  }, [query, performSearch]);

  const handleSearchChange = (event) => {
    setLocalQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearSearch();
    setSearchParams({});
  };

  const handleResultClick = (result) => {
    navigate(result.path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
      support: 'warning',
    };

    return colors[category?.toLowerCase()] || 'default';
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
      support: <DocumentIcon />,
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Breadcrumbs */}
        <motion.div variants={itemVariants}>
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Typography color="text.primary">Search Results</Typography>
          </Breadcrumbs>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            🔍 Search Results
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {query ? `Results for "${query}"` : 'Enter a search term to find documentation'}
          </Typography>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search documentation..."
                value={localQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: localQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </form>
          </Paper>
        </motion.div>

        {/* Search Stats */}
        {query && (
          <motion.div variants={itemVariants}>
            <Alert severity="info" sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1">
                  {isSearching ? 'Searching...' : `Found ${searchResults.length} results in ${Object.keys(groupedResults).length} categories`}
                </Typography>
                {searchResults.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {Object.keys(groupedResults).map((category) => (
                      <Chip
                        key={category}
                        label={`${category} (${groupedResults[category].length})`}
                        size="small"
                        color={getCategoryColor(category)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Alert>
          </motion.div>
        )}

        {/* Results */}
        {query && (
          <motion.div variants={itemVariants}>
            {searchResults.length > 0 ? (
              <AnimatePresence>
                {Object.entries(groupedResults).map(([category, results]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ marginBottom: '2rem' }}
                  >
                    <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      {category} ({results.length} results)
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {results.map((result, index) => (
                        <Grid item xs={12} md={6} key={result.item.id}>
                          <Card
                            sx={{
                              height: '100%',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6,
                              },
                            }}
                            onClick={() => handleResultClick(result.item)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ mr: 2, color: 'primary.main' }}>
                                  {getResultIcon(result.item.category)}
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{ flexGrow: 1, fontWeight: 600 }}
                                  dangerouslySetInnerHTML={{
                                    __html: getHighlightedText(
                                      result.item.title,
                                      result.matches?.find(m => m.key === 'title')?.indices,
                                    ),
                                  }}
                                />
                                <ArrowIcon color="action" />
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                                dangerouslySetInnerHTML={{
                                  __html: getHighlightedText(
                                    result.item.description,
                                    result.matches?.find(m => m.key === 'description')?.indices,
                                  ),
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={result.item.category}
                                  size="small"
                                  color={getCategoryColor(result.item.category)}
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="primary.main" fontWeight={600}>
                                  {Math.round((1 - result.score) * 100)}% match
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ mb: 4 }} />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : !isSearching ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body1" color="text.disabled">
                  Try different keywords or check your spelling
                </Typography>
              </Box>
            ) : null}
          </motion.div>
        )}

        {/* Empty State */}
        {!query && (
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Search Documentation
              </Typography>
              <Typography variant="body1" color="text.disabled">
                Enter a search term above to find relevant documentation
              </Typography>
            </Box>
          </motion.div>
        )}
      </motion.div>
    </Container>
  );
};

export default SearchResults;
