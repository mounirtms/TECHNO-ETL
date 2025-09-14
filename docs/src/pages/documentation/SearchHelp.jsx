import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  Keyboard as KeyboardIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const SearchHelp = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const searchFeatures = [
    {
      title: 'Fuzzy Search',
      description: 'Find results even with typos or partial matches',
      icon: <SearchIcon />,
      examples: ['techno', 'magento', 'api doc', 'setup guide'],
    },
    {
      title: 'Category Filtering',
      description: 'Filter results by documentation categories',
      icon: <FilterIcon />,
      examples: ['Overview', 'Setup', 'API', 'Integration', 'Support'],
    },
    {
      title: 'Search History',
      description: 'Access your recent searches for quick reference',
      icon: <HistoryIcon />,
      examples: ['Last 10 searches', 'Quick access', 'Auto-complete'],
    },
    {
      title: 'Popular Pages',
      description: 'Discover commonly accessed documentation',
      icon: <StarIcon />,
      examples: ['Getting Started', 'API Docs', 'Troubleshooting'],
    },
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl + K', description: 'Open global search modal', context: 'Anywhere' },
    { key: 'Escape', description: 'Close search modal', context: 'Search modal' },
    { key: 'Enter', description: 'Navigate to first result', context: 'Search input' },
    { key: '↑ ↓', description: 'Navigate through results', context: 'Search results' },
    { key: 'Tab', description: 'Switch between search tabs', context: 'Search modal' },
  ];

  const searchTips = [
    {
      tip: 'Use specific keywords',
      description: 'Search for "API authentication" instead of just "auth"',
      example: 'API authentication → Better results than "auth"',
    },
    {
      tip: 'Try different terms',
      description: 'If you don\'t find what you need, try synonyms',
      example: 'setup, installation, configuration, getting started',
    },
    {
      tip: 'Use category filters',
      description: 'Narrow down results by selecting specific categories',
      example: 'Filter by "API" to find only API-related documentation',
    },
    {
      tip: 'Check recent searches',
      description: 'Your search history is saved for quick access',
      example: 'Click on recent searches to repeat previous queries',
    },
  ];

  const searchableContent = [
    { type: 'Page Titles', weight: 'High', description: 'Main page titles and headings' },
    { type: 'Descriptions', weight: 'Medium', description: 'Page descriptions and summaries' },
    { type: 'Content', weight: 'Medium', description: 'Full page content and text' },
    { type: 'Keywords', weight: 'Medium', description: 'Tagged keywords and terms' },
    { type: 'Categories', weight: 'Low', description: 'Documentation categories' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
              🔍 Search Help & Tips
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Master the documentation search to find information quickly and efficiently
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Search Features" color="primary" />
              <Chip label="Keyboard Shortcuts" color="success" />
              <Chip label="Search Tips" color="info" />
            </Box>
          </Box>
        </motion.div>

        {/* Quick Start */}
        <motion.div variants={itemVariants}>
          <Alert severity="success" sx={{ mb: 6 }}>
            <Typography variant="h6" gutterBottom>⚡ Quick Start</Typography>
            <Typography variant="body1">
              Press <kbd style={{ padding: '4px 8px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'monospace' }}>Ctrl+K</kbd> anywhere
              to open the global search, or use the search bar in the top navigation.
              Start typing to see instant results with highlighting and category filtering.
            </Typography>
          </Alert>
        </motion.div>

        {/* Search Features */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🌟 Search Features
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {searchFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {feature.examples.map((example, idx) => (
                        <Chip
                          key={idx}
                          label={example}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Keyboard Shortcuts */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            ⌨️ Keyboard Shortcuts
          </Typography>
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Shortcut</strong></TableCell>
                      <TableCell><strong>Action</strong></TableCell>
                      <TableCell><strong>Context</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {keyboardShortcuts.map((shortcut, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {shortcut.key.split(' ').map((key, idx) => (
                              <kbd
                                key={idx}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#f5f5f5',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {key}
                              </kbd>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>{shortcut.description}</TableCell>
                        <TableCell>
                          <Chip label={shortcut.context} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Tips */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            💡 Search Tips & Best Practices
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {searchTips.map((tip, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingIcon sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        {tip.tip}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tip.description}
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Example:</strong> {tip.example}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* What's Searchable */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            📋 What's Searchable
          </Typography>
          <Card sx={{ mb: 6 }}>
            <CardContent>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Our search engine indexes various types of content with different priority weights:
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Content Type</strong></TableCell>
                      <TableCell><strong>Search Weight</strong></TableCell>
                      <TableCell><strong>Description</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchableContent.map((content, index) => (
                      <TableRow key={index}>
                        <TableCell>{content.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={content.weight}
                            size="small"
                            color={
                              content.weight === 'High' ? 'error' :
                                content.weight === 'Medium' ? 'warning' : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell>{content.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Interface Guide */}
        <motion.div variants={itemVariants}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            🎯 Search Interface Guide
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary.main">
                    Header Search Bar
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Quick search access" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Instant dropdown results" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Category filtering" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Recent searches" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Global Search Modal
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Full-screen search experience" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Tabbed interface (Results, Recent, Popular)" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Grouped results by category" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Match percentage scoring" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Search Results Page
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Comprehensive results view" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Category grouping" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Highlighted search terms" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckIcon color="success" fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Shareable search URLs" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Need More Help */}
        <motion.div variants={itemVariants}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Need More Help?
            </Typography>
            <Typography variant="body1">
              If you can't find what you're looking for, try browsing the documentation categories
              in the sidebar navigation, or contact support at <strong>mounir.ab@techno-dz.com</strong>
              for assistance with specific topics.
            </Typography>
          </Alert>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default SearchHelp;
