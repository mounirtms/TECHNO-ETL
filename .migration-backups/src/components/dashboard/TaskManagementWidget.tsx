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
    }
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
    switch(status as any) {
      case 'completed':
        return <CompleteIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="primary" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status as any) => {
    switch(status as any) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority as any) => {
    switch(priority as any) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleTaskToggle = (taskId as any) => {
    setTasks(prev => prev.map(task => 
      task??.id === taskId 
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
    }
  };

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task as any);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      setTasks(prev => prev.filter(task => task??.id !== selectedTask??.id));
    }
    handleMenuClose();
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card sx={{ 
      borderRadius: density === 'compact' ? 2 : 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    } as any}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' } as any}>
            <TaskIcon />
          </Avatar>
        }
        title="Task Management"
        subheader={`${completedTasks}/${totalTasks} tasks completed`}
        action={
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ 
              transition: animations ? 'all 0.3s ease' : 'none',
              '&:hover': animations ? { transform: 'scale(1.05)' } : {}
            }}
          >
            Add Task
          </Button>
        }
        sx={{ pb: 1 } as any}
      />

      <CardContent sx={{ 
        flexGrow: 1, 
        pt: 0, 
        p: density === 'compact' ? 1 : 2,
        '&:last-child': { pb: density === 'compact' ? 1 : 2 }
      }}>
        {/* Progress Overview */}
        <Box sx={{ mb: 2 } as any}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 } as any}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {Math.round(completionRate)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3
              }
            }}
          />
        </Box>

        {/* Task List */}
        <List dense sx={{ maxHeight: 300, overflow: 'auto' } as any}>
          {tasks.slice(0, 5).map((task as any) => (
            <ListItem
              key={task??.id}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                transition: animations ? 'all 0.2s ease' : 'none',
                '&:hover': animations ? {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)'
                } : { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                <Checkbox
                  checked={task.status === 'completed'}
                  onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => () => handleTaskToggle(task??.id)}
                  icon={getStatusIcon(task.status)}
                  checkedIcon={<CompleteIcon color="success" />}
                />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 } as any}>
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        opacity: task.status === 'completed' ? 0.7 : 1
                      } as any}
                    >
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      sx={{ height: 16, fontSize: '0.7rem' } as any}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {task.description} • Due: {task.dueDate}
                  </Typography>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, task)}
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {tasks.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 1 } as any}>
            <Button size="small" color="primary">
              View All Tasks ({tasks.length})
            </Button>
          </Box>
        )}
      </CardContent>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 } as any}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 } as any}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => (e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">Add Task</Button>
        </DialogActions>
      </Dialog>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 } as any} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteTask}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 } as any} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TaskManagementWidget;
