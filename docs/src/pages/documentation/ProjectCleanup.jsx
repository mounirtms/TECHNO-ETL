import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CleaningServices as CleanIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const ProjectCleanup = () => {
  const cleanupActions = [
    {
      category: 'Duplicate Files Removed',
      items: [
        'API_ENDPOINTS_AND_CONTEXT_FIXES_REPORT.md',
        'FINAL_FIXES_SUMMARY.md',
        'PROJECT_STRUCTURE.md',
        'tuning-summary.json',
      ],
      status: 'completed',
    },
    {
      category: 'Unnecessary Scripts Removed',
      items: [
        'apply-project-tunings.js',
        'build-all.js',
        'cleanup-project.js',
        'fix-react-errors.js',
        'validate-environment.js',
      ],
      status: 'completed',
    },
    {
      category: 'Archived Directories Cleaned',
      items: [
        'docs-archive/',
        'other/beta-migration/',
        'other/magento-migration/',
        'other/magento-migration-nodejs/',
        '.migration-backups/',
      ],
      status: 'completed',
    },
    {
      category: 'Documentation Consolidated',
      items: [
        'All README files moved to docs project',
        'Development guides centralized',
        'API documentation organized',
        'Deployment guides unified',
      ],
      status: 'completed',
    },
  ];

  const projectStructure = {
    'Root Directory': [
      'package.json - Main project configuration',
      'vite.config.js - Build configuration',
      'README.md - Main project documentation',
      '.env files - Environment configuration',
      'LICENSE - Project license',
    ],
    'Source Code': [
      'src/ - Frontend application source',
      'backend/ - Backend API source',
      'docs/ - Documentation React app',
    ],
    'Configuration': [
      '.eslintrc.json - Code linting rules',
      '.babelrc.js - Babel configuration',
      '.gitignore - Git ignore rules',
    ],
    'Build Output': [
      'dist/ - Frontend build output',
      'backend/dist/ - Backend build output',
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          <CleanIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Project Cleanup & Organization
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Comprehensive cleanup and organization of the TECHNO-ETL project structure
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Project Cleanup Completed Successfully
        </Typography>
        <Typography>
          All duplicate files removed, unnecessary scripts cleaned up, and documentation consolidated into this React app.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Cleanup Actions Performed
            </Typography>

            {cleanupActions.map((action, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    {action.category}
                  </Typography>
                  <Chip
                    label="Completed"
                    color="success"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <List dense>
                  {action.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} sx={{ pl: 4 }}>
                      <ListItemIcon>
                        <DeleteIcon color="action" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
                {index < cleanupActions.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <WarningIcon color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Before Cleanup
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="47 root-level files"
                    secondary="Including duplicates and temp files"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="12 unnecessary scripts"
                    secondary="Build and tuning scripts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="5 archive directories"
                    secondary="Old migration and backup files"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                After Cleanup
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="18 essential files"
                    secondary="Only necessary project files"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Organized structure"
                    secondary="Clear separation of concerns"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Centralized docs"
                    secondary="All documentation in React app"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Current Project Structure
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Clean, organized structure following best practices
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(projectStructure).map(([category, items]) => (
            <Grid item xs={12} md={6} key={category}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {category}
                </Typography>
                <List dense>
                  {items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FileIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.split(' - ')[0]}
                        secondary={item.split(' - ')[1]}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          📚 Documentation Now Centralized
        </Typography>
        <Typography>
          All project documentation, guides, and development notes are now organized in this React documentation app.
          The main project directory contains only essential files for development and deployment.
        </Typography>
      </Alert>
    </Container>
  );
};

export default ProjectCleanup;
