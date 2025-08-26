import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Avatar,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  CheckCircle as CompleteIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon,
  Cancel as CancelledIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as PriorityIcon
} from '@mui/icons-material';
import { useCustomTheme } from '../../contexts/ThemeContext';

/**
 * Task Management Widget for Dashboard
 * Provides quick task management functionality
 */
const TaskManagementWidget = () => {
  const { animations, density } = useCustomTheme();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Update product catalog',
      description: 'Sync latest products from Magento',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-01-15',
      assignee: 'System'
    },
    {
      id: 2,
      title: 'Review inventory levels',
      description: 'Check low stock items and reorder',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-16',
      assignee: 'Admin'
    },
    {
      id: 3,
      title: 'Generate monthly report',
      description: 'Create sales and performance report',
      status: 'completed',
      priority: 'low',
      dueDate: '2024-01-10',
      assignee: 'System'
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CompleteIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="primary" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
  };

  const handleTaskToggle = (taskId) => {
    setTasks(prev => prev.map((task) => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        status: 'pending',
        assignee: 'User'
      };
      setTasks(prev => [task, ...prev]);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      setDialogOpen(false);
  };

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleDeleteTask = () => {
    if(selectedTask) {
      setTasks(prev => prev.filter((task) => task.id !== selectedTask.id));
    handleMenuClose();
  };

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card sx={{ 
      display: "flex", 
      borderRadius: density === 'compact' ? 2 : 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}></
      <CardHeader avatar
          <Avatar sx={{ display: "flex", bgcolor: 'primary.main' }}></
            <TaskIcon /></TaskIcon>
        title
        subheader={`${completedTasks}/${totalTasks} tasks completed`}
        action
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              '&:hover': animations ? { transform: 'scale(1.05)' } : {}
            }}
          >
            Add Task
          </Button>
        sx={{ display: "flex", pb: 1 }}
      />

      <CardContent sx={{ 
        display: "flex", 
        flexGrow: 1, 
        pt: 0, 
        p: density === 'compact' ? 1 : 2,
        '&:last-child': { pb: density === 'compact' ? 1 : 2 }
      }}>
        {/* Progress Overview */}
        <Box sx={{ display: "flex", mb: 2 }}></
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="outlined" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="outlined" fontWeight={600} color="primary.main">
              {Math.round(completionRate)}%
            </Typography>
          </Box>
          <LinearProgress variant="outlined"
            value={completionRate}
            sx={{
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3
            }}
          /></LinearProgress>

        {/* Task List */}
        <List dense sx={{ display: "flex", maxHeight: 300, overflow: 'auto' }}>
          {tasks.slice(0, 5).map((task) => (
            <ListItem key={task.id}
              sx={{
                transition: animations ? 'all 0.2s ease' : 'none',
                '&:hover': animations ? {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)'
                } : { bgcolor: 'action.hover' }
              }}></
              <ListItemIcon>
                <Checkbox checked={task.status === 'completed'}
                  onChange={(e) => () => handleTaskToggle(task.id)}
                  icon={getStatusIcon(task.status)}
                  checkedIcon={<CompleteIcon color="success" />}
                />
              </ListItemIcon>
              
              <ListItemText primary
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}></
                    <Typography variant="outlined"
                      }}>
                      {task.title}
                    </Typography>
                    <Chip label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      sx={{ display: "flex", height: 16, fontSize: '0.7rem' }}
                    /></Chip>
                secondary
                    {task.description} • Due: {task.dueDate}
                  </Typography>
              />
              
              <ListItemSecondaryAction></
                <IconButton size="small"
                  onClick={(e) => handleMenuClick(e, task)}
                >
                  <MoreIcon fontSize="small" /></MoreIcon>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {tasks.length > 5 && (
          <Box sx={{ display: "flex", textAlign: 'center', mt: 1 }}></
            <Button size="small" color="primary">
              View All Tasks ({tasks.length})
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent></
          <TextField autoFocus
            margin
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            sx={{ display: "flex", mb: 2 }}
          />
          <TextField margin
            rows={2}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            sx={{ display: "flex", mb: 2 }}
          />
          <TextField margin
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </DialogContent>
        <DialogActions></
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>

      {/* Task Menu */}
      <Menu anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}></
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ display: "flex", mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteTask}></
          <DeleteIcon fontSize="small" sx={{ display: "flex", mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskManagementWidget;
