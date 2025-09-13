import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugIcon,
  Lightbulb as SuggestionIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * Comprehensive error reporting panel for bulk upload operations
 * Displays validation results, errors, warnings, and actionable suggestions
 */
const ErrorReportingPanel = ({ 
  validationResults, 
  onRetry, 
  onDownloadReport, 
  showSuggestions = true,
  compact = false 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});

  if (!validationResults) {
    return null;
  }

  const { csvValidation, imageValidation, matchingValidation } = validationResults;
  
  // Count total issues
  const totalErrors = [csvValidation, imageValidation, matchingValidation]
    .filter(Boolean)
    .reduce((sum, validation) => sum + (validation.errors?.length || 0), 0);
    
  const totalWarnings = [csvValidation, imageValidation, matchingValidation]
    .filter(Boolean)
    .reduce((sum, validation) => sum + (validation.warnings?.length || 0), 0);

  const hasIssues = totalErrors > 0 || totalWarnings > 0;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderValidationSection = (title, validation, icon, color = 'primary') => {
    if (!validation) return null;

    const errors = validation.errors || [];
    const warnings = validation.warnings || [];
    const suggestions = validation.suggestions || [];
    const hasIssues = errors.length > 0 || warnings.length > 0;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {icon}
            <Typography variant="h6">{title}</Typography>
            {hasIssues && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {errors.length > 0 && (
                  <Chip 
                    label={`${errors.length} Error${errors.length !== 1 ? 's' : ''}`} 
                    color="error" 
                    size="small" 
                  />
                )}
                {warnings.length > 0 && (
                  <Chip 
                    label={`${warnings.length} Warning${warnings.length !== 1 ? 's' : ''}`} 
                    color="warning" 
                    size="small" 
                  />
                )}
              </Box>
            )}
          </Box>

          {!hasIssues && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✓ {title} validation passed successfully
              </Typography>
            </Alert>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error" gutterBottom>
                Errors ({errors.length})
              </Typography>
              {errors.map((error, index) => (
                <Alert severity="error" sx={{ mb: 1 }} key={index}>
                  <AlertTitle>{error.type?.replace(/_/g, ' ') || 'Error'}</AlertTitle>
                  <Typography variant="body2">{error.message}</Typography>
                  {error.suggestion && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      💡 {error.suggestion}
                    </Typography>
                  )}
                  {error.details && (
                    <Accordion sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="caption">View Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" component="pre" sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {typeof error.details === 'string' 
                            ? error.details 
                            : JSON.stringify(error.details, null, 2)
                          }
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Alert>
              ))}
            </Box>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                Warnings ({warnings.length})
              </Typography>
              {warnings.map((warning, index) => (
                <Alert severity="warning" sx={{ mb: 1 }} key={index}>
                  <Typography variant="body2" gutterBottom>
                    <strong>{warning.type?.replace(/_/g, ' ') || 'Warning'}:</strong> {warning.message}
                  </Typography>
                  {warning.suggestion && (
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      💡 {warning.suggestion}
                    </Typography>
                  )}
                  {warning.details && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Details: {Array.isArray(warning.details) 
                          ? warning.details.slice(0, 3).join(', ') + (warning.details.length > 3 ? '...' : '')
                          : warning.details
                        }
                      </Typography>
                    </Box>
                  )}
                </Alert>
              ))}
            </Box>
          )}

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Suggestions ({suggestions.length})
              </Typography>
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SuggestionIcon color="info" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={suggestion.message}
                      secondary={suggestion.suggestion}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Metadata */}
          {validation.metadata && Object.keys(validation.metadata).length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="caption">Validation Metadata</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                  {Object.entries(validation.metadata).map(([key, value]) => (
                    <Box key={key}>
                      <Typography variant="caption" color="text.secondary">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </Typography>
                      <Typography variant="body2">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon color={totalErrors > 0 ? 'error' : totalWarnings > 0 ? 'warning' : 'success'} />
          Validation Summary
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip 
            icon={<ErrorIcon />}
            label={`${totalErrors} Error${totalErrors !== 1 ? 's' : ''}`}
            color={totalErrors > 0 ? 'error' : 'default'}
            variant={totalErrors > 0 ? 'filled' : 'outlined'}
          />
          <Chip 
            icon={<WarningIcon />}
            label={`${totalWarnings} Warning${totalWarnings !== 1 ? 's' : ''}`}
            color={totalWarnings > 0 ? 'warning' : 'default'}
            variant={totalWarnings > 0 ? 'filled' : 'outlined'}
          />
        </Box>

        {totalErrors === 0 && totalWarnings === 0 && (
          <Alert severity="success">
            <AlertTitle>All Validations Passed</AlertTitle>
            <Typography variant="body2">
              Your files and data have been validated successfully. You can proceed with the upload.
            </Typography>
          </Alert>
        )}

        {totalErrors > 0 && (
          <Alert severity="error">
            <AlertTitle>Validation Errors Found</AlertTitle>
            <Typography variant="body2">
              Please fix the errors below before proceeding with the upload.
            </Typography>
          </Alert>
        )}

        {totalErrors === 0 && totalWarnings > 0 && (
          <Alert severity="warning">
            <AlertTitle>Warnings Detected</AlertTitle>
            <Typography variant="body2">
              You can proceed with the upload, but please review the warnings below.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            {renderSummary()}
            {renderValidationSection(
              'CSV File Validation', 
              csvValidation, 
              <InfoIcon color="primary" />
            )}
            {renderValidationSection(
              'Image Files Validation', 
              imageValidation, 
              <InfoIcon color="secondary" />
            )}
            {renderValidationSection(
              'Matching Results Validation', 
              matchingValidation, 
              <InfoIcon color="success" />
            )}
          </Box>
        );
      case 1:
        return renderValidationSection(
          'CSV File Issues', 
          csvValidation, 
          <InfoIcon color="primary" />
        );
      case 2:
        return renderValidationSection(
          'Image File Issues', 
          imageValidation, 
          <InfoIcon color="secondary" />
        );
      case 3:
        return renderValidationSection(
          'Matching Issues', 
          matchingValidation, 
          <InfoIcon color="success" />
        );
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Box>
        {hasIssues && (
          <Alert severity={totalErrors > 0 ? 'error' : 'warning'} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {totalErrors > 0 ? 'Validation errors found' : 'Warnings detected'}
              </Typography>
              <Chip label={`${totalErrors} errors, ${totalWarnings} warnings`} size="small" />
            </Box>
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={totalErrors + totalWarnings} color="error">
                Overview
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={csvValidation?.errors?.length + csvValidation?.warnings?.length || 0} 
                color="error"
              >
                CSV Issues
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={imageValidation?.errors?.length + imageValidation?.warnings?.length || 0} 
                color="error"
              >
                Image Issues
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={matchingValidation?.errors?.length + matchingValidation?.warnings?.length || 0} 
                color="error"
              >
                Matching Issues
              </Badge>
            } 
          />
        </Tabs>
      </Box>

      {renderTabContent()}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {onRetry && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry Validation
          </Button>
        )}
        
        {onDownloadReport && hasIssues && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownloadReport}
          >
            Download Report
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorReportingPanel;