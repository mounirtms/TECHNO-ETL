import React, { useEffect, useState } from 'react';
import {
    Box, Button, Card, CardContent,
    Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    Switch, FormControlLabel, Alert, CircularProgress,
    Chip, Select, MenuItem, FormControl, InputLabel,
    Grid, Avatar, Accordion, AccordionSummary, AccordionDetails,
    Tooltip, IconButton, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Autocomplete,
    List, ListItem, ListItemText, ListItemSecondaryAction,
    ListItemAvatar, CardActions, Fab, Snackbar
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ChevronRight as ChevronRightIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Edit as EditIcon,
    SupervisorAccount as SuperAdminIcon,
    Assignment as AssignmentIcon,
    Security as SecurityIcon,
    Groups as GroupsIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../config/firebase';
import { ref, get, set, onValue, remove, update } from 'firebase/database';
import { MENU_TREE } from '../Layout/MenuTree';
import { 
    USER_ROLES, 
    ROLE_HIERARCHY, 
    getRolePermissions,
    DEFAULT_LICENSED_PROGRAMS,
    initializeFirebaseDefaults,
    createDefaultUserLicense
} from '../../config/firebaseDefaults';
import {
    check_license_status,
    set_license_status,
    get_license_details
} from '../../utils/licenseUtils';

const LicenseManagement = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch users from Firebase Realtime Database
                const usersRef = ref(database, 'users');
                const licensesRef = ref(database, 'licenses');
                
                // Listen for users data
                onValue(usersRef, async (usersSnapshot) => {
                    if (usersSnapshot.exists()) {
                        const usersData = usersSnapshot.val();
                        const usersList = [];
                        
                        // Get licenses data
                        const licensesSnapshot = await get(licensesRef);
                        const licensesData = licensesSnapshot.exists() ? licensesSnapshot.val() : {};
                        
                        Object.entries(usersData).forEach(([userId, userData]) => {
                            const userLicense = licensesData[userId] || {};
                            usersList.push({
                                uid: userId,
                                email: userData.email || 'No email',
                                displayName: userData.displayName || 'No name',
                                role: userData.role || 'user',
                                canRead: userLicense.canRead || false,
                                canEdit: userLicense.canEdit || false,
                                canDelete: userLicense.canDelete || false,
                                isValid: userLicense.isValid || false,
                                licenseType: userLicense.licenseType || 'none'
                            });
                        });
                        
                        setUsers(usersList);
                    } else {
                        // If no users in database, create entry for current user
                        if (currentUser) {
                            const userKey = currentUser.uid.replace(/[.#$\[\]]/g, '_');
                            const userRef = ref(database, `users/${userKey}`);
                            await set(userRef, {
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                role: 'admin', // First user becomes admin
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                    setLoading(false);
                }, (error) => {
                    console.error('Error fetching users:', error);
                    setError('Failed to fetch users: ' + error.message);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error in fetchUsers:', error);
                setError('Failed to initialize user management: ' + error.message);
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, [currentUser]);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleLicenseChange = async (userId, permissions) => {
        try {
            setLoading(true);
            const currentLicense = await get_license_details(userId);
            const updatedLicense = {
                ...currentLicense,
                ...permissions
            };
            await set_license_status(userId, updatedLicense);
            setLoading(false);
        } catch (err) {
            setError('Failed to update license permissions');
            setLoading(false);
        }
    };

    const handleUserSelect = (event) => {
        const userId = event.target.value;
        const user = users.find(u => u.uid === userId);
        setSelectedUser(user);
    };

    const renderMenuPermissions = () => {
        if (!selectedUser) return null;
        
        const isLocalhost = window.location.hostname === 'localhost';
        
        return (
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Menu Permissions for {selectedUser.displayName || selectedUser.email}
                    </Typography>
                    
                    {MENU_TREE.map((category) => (
                        <Accordion key={category.id} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <category.icon />
                                    <Typography variant="subtitle1">
                                        {category.label}
                                    </Typography>
                                    <Chip 
                                        label={isLocalhost ? "Licensed" : "Check License"}
                                        color={isLocalhost ? "success" : "warning"}
                                        size="small"
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    {category.children?.map((menuItem) => (
                                        <Grid item xs={12} md={6} key={menuItem.id}>
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <menuItem.icon fontSize="small" />
                                                        <Typography variant="body2">
                                                            {menuItem.label}
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <Tooltip title="Can Read">
                                                            <Switch
                                                                size="small"
                                                                checked={isLocalhost || selectedUser.canRead}
                                                                onChange={(e) => handleLicenseChange(selectedUser.uid, { canRead: e.target.checked })}
                                                                disabled={isLocalhost}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Can Edit">
                                                            <Switch
                                                                size="small"
                                                                checked={isLocalhost || selectedUser.canEdit}
                                                                onChange={(e) => handleLicenseChange(selectedUser.uid, { canEdit: e.target.checked })}
                                                                disabled={isLocalhost}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Can Delete">
                                                            <Switch
                                                                size="small"
                                                                checked={isLocalhost || selectedUser.canDelete}
                                                                onChange={(e) => handleLicenseChange(selectedUser.uid, { canDelete: e.target.checked })}
                                                                disabled={isLocalhost}
                                                            />
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                License Management
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Users Overview */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Users Overview
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select User for Detailed View</InputLabel>
                                <Select
                                    value={selectedUser?.uid || ''}
                                    onChange={handleUserSelect}
                                    label="Select User for Detailed View"
                                >
                                    {users.map(user => (
                                        <MenuItem key={user.uid} value={user.uid}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ width: 24, height: 24 }}>
                                                    {user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2">
                                                        {user.displayName || user.email}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {user.email} • {user.role}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map(user => (
                                            <TableRow key={user.uid}>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 24, height: 24 }}>
                                                            {user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {user.displayName || 'No Name'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={user.role}
                                                        color={user.role === 'admin' ? 'primary' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        icon={user.isValid ? <CheckIcon /> : <CancelIcon />}
                                                        label={user.isValid ? 'Active' : 'Inactive'}
                                                        color={user.isValid ? 'success' : 'error'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Permissions */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Permissions
                            </Typography>
                            {selectedUser ? (
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Managing permissions for {selectedUser.displayName || selectedUser.email}
                                    </Typography>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Box textAlign="center">
                                                <Switch
                                                    checked={selectedUser.canRead}
                                                    onChange={(e) => handleLicenseChange(selectedUser.uid, { canRead: e.target.checked })}
                                                />
                                                <Typography variant="caption" display="block">
                                                    Can Read
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box textAlign="center">
                                                <Switch
                                                    checked={selectedUser.canEdit}
                                                    onChange={(e) => handleLicenseChange(selectedUser.uid, { canEdit: e.target.checked })}
                                                />
                                                <Typography variant="caption" display="block">
                                                    Can Edit
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Box textAlign="center">
                                                <Switch
                                                    checked={selectedUser.canDelete}
                                                    onChange={(e) => handleLicenseChange(selectedUser.uid, { canDelete: e.target.checked })}
                                                />
                                                <Typography variant="caption" display="block">
                                                    Can Delete
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Select a user to manage permissions
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Menu Permissions */}
            {renderMenuPermissions()}
        </Box>
    );
};

export default LicenseManagement;

