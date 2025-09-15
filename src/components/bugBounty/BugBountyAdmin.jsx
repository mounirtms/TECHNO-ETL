/**
 * Bug Bounty Admin Panel
 * Admin interface for managing bug reports and rewards
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Rating,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AttachMoney as PayIcon,
} from '@mui/icons-material';
import bugBountyService, { BUG_CATEGORIES, BUG_STATUS, QUALITY_SCORES } from '../../services/bugBountyService.js';

const BugBountyAdmin = ({ open, onClose }) => {
  const [bugs, setBugs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (open) {
      loadBugs();
    }
  }, [open, filter]);

  const loadBugs = async () => {
    setLoading(true);
    try {
      const filters = filter === 'all' ? {} : { status: filter };
      const result = await bugBountyService.getBugs(filters);

      if (result.success) {
        setBugs(result.bugs);
      }
    } catch (error) {
      console.error('Error loading bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bugId, newStatus, qualityScore = null) => {
    try {
      const result = await bugBountyService.updateBugStatus(bugId, newStatus, qualityScore);

      if (result.success) {
        loadBugs(); // Refresh the list
        setSelectedBug(null);
      }
    } catch (error) {
      console.error('Error updating bug status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [BUG_STATUS.SUBMITTED]: 'info',
      [BUG_STATUS.UNDER_REVIEW]: 'warning',
      [BUG_STATUS.CONFIRMED]: 'success',
      [BUG_STATUS.DUPLICATE]: 'default',
      [BUG_STATUS.INVALID]: 'error',
      [BUG_STATUS.FIXED]: 'success',
      [BUG_STATUS.REWARDED]: 'primary',
    };

    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const BugDetailDialog = ({ bug, open, onClose }) => {
    const [newStatus, setNewStatus] = useState(bug?.status || '');
    const [qualityScore, setQualityScore] = useState(bug?.qualityScore || 3);
    const [adminNotes, setAdminNotes] = useState('');

    if (!bug) return null;

    const handleSubmit = () => {
      handleStatusUpdate(bug.id, newStatus, qualityScore);
      onClose();
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminIcon color="primary" />
            <Typography variant="h6">Bug Review: {bug.title}</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Bug Information</Typography>
            <Typography><strong>ID:</strong> {bug.id}</Typography>
            <Typography><strong>Category:</strong>
              <Chip
                size="small"
                label={BUG_CATEGORIES[bug.category]?.name || bug.category}
                sx={{
                  ml: 1,
                  backgroundColor: BUG_CATEGORIES[bug.category]?.color,
                  color: 'white',
                }}
              />
            </Typography>
            <Typography><strong>Severity:</strong> {bug.severity}</Typography>
            <Typography><strong>Submitted:</strong> {new Date(bug.submittedAt).toLocaleString()}</Typography>
            <Typography><strong>Tester:</strong> {bug.tester.name} ({bug.tester.email})</Typography>
          </Box>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Description</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{bug.description}</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Steps to Reproduce</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {bug.stepsToReproduce.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Step ${index + 1}`}
                      secondary={step}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Expected vs Actual Behavior</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="success.main">Expected:</Typography>
                  <Typography>{bug.expectedBehavior}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="error.main">Actual:</Typography>
                  <Typography>{bug.actualBehavior}</Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Environment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography><strong>Browser:</strong> {bug.environment.browser}</Typography>
              <Typography><strong>URL:</strong> {bug.environment.url}</Typography>
              <Typography><strong>Screen:</strong> {bug.environment.screenResolution}</Typography>
              <Typography><strong>Timestamp:</strong> {bug.environment.timestamp}</Typography>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Admin Review</Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value={BUG_STATUS.SUBMITTED}>Submitted</MenuItem>
                <MenuItem value={BUG_STATUS.UNDER_REVIEW}>Under Review</MenuItem>
                <MenuItem value={BUG_STATUS.CONFIRMED}>Confirmed</MenuItem>
                <MenuItem value={BUG_STATUS.DUPLICATE}>Duplicate</MenuItem>
                <MenuItem value={BUG_STATUS.INVALID}>Invalid</MenuItem>
                <MenuItem value={BUG_STATUS.FIXED}>Fixed</MenuItem>
                <MenuItem value={BUG_STATUS.REWARDED}>Rewarded</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Quality Score</Typography>
              <Rating
                value={qualityScore}
                onChange={(event, newValue) => setQualityScore(newValue)}
                max={5}
              />
              <Typography variant="body2" color="text.secondary">
                {Object.values(QUALITY_SCORES).find(q => q.score === qualityScore)?.description}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Admin Notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this bug report..."
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Calculated Reward:</strong> {formatCurrency(bug.reward.calculated)}
                <br />
                <strong>Final Reward (with quality):</strong> {formatCurrency(
                  Math.round(bug.reward.calculated * (Object.values(QUALITY_SCORES).find(q => q.score === qualityScore)?.multiplier || 1)),
                )}
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Update Bug Status
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminIcon color="primary" />
            <Typography variant="h6">Bug Bounty Admin Panel</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Bugs</MenuItem>
                <MenuItem value={BUG_STATUS.SUBMITTED}>Submitted</MenuItem>
                <MenuItem value={BUG_STATUS.UNDER_REVIEW}>Under Review</MenuItem>
                <MenuItem value={BUG_STATUS.CONFIRMED}>Confirmed</MenuItem>
                <MenuItem value={BUG_STATUS.DUPLICATE}>Duplicate</MenuItem>
                <MenuItem value={BUG_STATUS.INVALID}>Invalid</MenuItem>
                <MenuItem value={BUG_STATUS.FIXED}>Fixed</MenuItem>
                <MenuItem value={BUG_STATUS.REWARDED}>Rewarded</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tester</TableCell>
                  <TableCell>Reward</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bugs.map((bug) => (
                  <TableRow key={bug.id}>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {bug.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={BUG_CATEGORIES[bug.category]?.name || bug.category}
                        sx={{
                          backgroundColor: BUG_CATEGORIES[bug.category]?.color,
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>{bug.severity}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={bug.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(bug.status)}
                      />
                    </TableCell>
                    <TableCell>{bug.tester.name}</TableCell>
                    <TableCell>
                      {formatCurrency(bug.reward?.final || bug.reward?.calculated || 0)}
                    </TableCell>
                    <TableCell>
                      {new Date(bug.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => setSelectedBug(bug)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <BugDetailDialog
        bug={selectedBug}
        open={!!selectedBug}
        onClose={() => setSelectedBug(null)}
      />
    </>
  );
};

export default BugBountyAdmin;
