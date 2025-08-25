/**
 * Bug Report Form Component
 * Allows users to submit detailed bug reports
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BugReport as BugIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import bugBountyService, { BUG_CATEGORIES } from '../../services/bugBountyService';

const steps = ['Bug Details', 'Steps to Reproduce', 'Environment & Contact'];

interface BugReportFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (result: any) => void;
}

const BugReportForm: React.FC<BugReportFormProps> = ({ open, onClose, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    stepsToReproduce: [''],
    expectedBehavior: '',
    actualBehavior: '',
    testerName: '',
    testerEmail: '',
    testerExperience: 'beginner',
    attachments: []
  });

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev,
      [field]: value
    }));
  };

  const handleStepChange = (field: string, index: number, value: string): void => {
    const newSteps = [...formData.stepsToReproduce];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev,
      stepsToReproduce: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({ ...prev,
      stepsToReproduce: [...prev.stepsToReproduce, '']
    }));
  };

  const removeStep = (index: number): void => {
    if(formData.stepsToReproduce.length > 1) {
      const newSteps = formData.stepsToReproduce.filter((_, i: any: any: any: any) => i !== index);
      setFormData(prev => ({ ...prev,
        stepsToReproduce: newSteps
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate tester ID
      const testerId = `tester_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const bugData = { ...formData,
        testerId,
        environment: {
          browser: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          screenResolution: `${window.screen.width}x${window.screen.height}`
        }
      };

      const result = await bugBountyService.submitBug(bugData);
      
      if(result.success) {
        setSuccess(`Bug report submitted successfully! Bug ID: ${result.bugId}`);
        setTimeout(() => {
          onSubmit?.(result);
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit bug report');
      }
    } catch(err: any) {
      setError('An unexpected error occurred');
      console.error('Bug submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      category: '',
      severity: '',
      stepsToReproduce: [''],
      expectedBehavior: '',
      actualBehavior: '',
      testerName: '',
      testerEmail: '',
      testerExperience: 'beginner',
      attachments: []
    });
    setError('');
    setSuccess('');
    onClose();
  };

  const isStepValid = (step: number): boolean => {
    switch(step) {
      case 0:
        return Boolean((Boolean(formData.title && formData.description && formData.category && formData.severity)))));
      case 1:
        return Boolean((Boolean(formData.stepsToReproduce.some((stepItem: string: any: any: any: any) => stepItem.trim()) && 
               formData.expectedBehavior && formData.actualBehavior)))));
      case 2:
        return Boolean(formData.testerName && formData.testerEmail);
      default:
        return false;
    }
  };

  const getRewardEstimate = () => {
    if(formData.category && formData.severity) {
      return bugBountyService.calculateReward(formData.category, formData.severity);
    }
    return 0;
  };

  const renderStepContent = (step: number): React.JSX.Element | null => {
    switch(step) {
      case 0:
        return(<Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {Object.entries(BUG_CATEGORIES).map(([key: any category]: any: any: any: any) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          label={category.name}
                          sx={{ display: "flex", backgroundColor: category.color, color: 'white' }}
                        />
                        <Typography variant="body2">{category.description}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                >
                  <MenuItem value="critical">Critical - System unusable</MenuItem>
                  <MenuItem value="high">High - Major functionality affected</MenuItem>
                  <MenuItem value="medium">Medium - Minor functionality affected</MenuItem>
                  <MenuItem value="low">Low - Cosmetic or minor issue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.category && formData.severity && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" icon={<InfoIcon />}>
                  <Typography variant="body2">
                    <strong>Estimated Reward: ${getRewardEstimate()}</strong>
                    <br />
                    Final reward depends on bug quality and verification.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Steps to Reproduce
              </Typography>
              {formData.stepsToReproduce.map((step: string: any index: number: any: any: any: any) => (<Box key={index} sx={{ display: "flex", display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Step ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange('stepsToReproduce', index, e.target.value)}
                    placeholder
                    onClick={() => removeStep(index)}
                    disabled={formData.stepsToReproduce.length ===1}
                    color
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addStep}
                variant="body2"
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label
                value={formData.expectedBehavior}
                onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
                placeholder
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label
                value={formData.actualBehavior}
                onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
                placeholder
        return(<Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label
                value={formData.testerName}
                onChange={(e) => handleInputChange('testerName', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type
                value={formData.testerEmail}
                onChange={(e) => handleInputChange('testerEmail', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Testing Experience</InputLabel>
                <Select
                  value={formData.testerExperience}
                  onChange={(e) => handleInputChange('testerExperience', e.target.value)}
                >
                  <MenuItem value="beginner">Beginner (0-1 years)</MenuItem>
                  <MenuItem value="intermediate">Intermediate (1-3 years)</MenuItem>
                  <MenuItem value="advanced">Advanced (3-5 years)</MenuItem>
                  <MenuItem value="expert">Expert (5+ years)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Environment Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Browser:</strong> {navigator.userAgent}
                    <br />
                    <strong>Screen Resolution:</strong> {window.screen.width}x{window.screen.height}
                    <br />
                    <strong>Current URL:</strong> {window.location.href}
                    <br />
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return(<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon color="primary" />
          <Typography variant="h6">Report a Bug</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label: any: any: any: any) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ display: "flex", mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ display: "flex", mb: 2 }}>
            {success}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleBack}
          disabled={activeStep ===0}
        >
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!isStepValid(activeStep)}
            variant="body2"
            onClick={handleSubmit}
            disabled={!isStepValid(activeStep) || loading}
            variant="body2"
            {loading ? 'Submitting...' : 'Submit Bug Report'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BugReportForm;
