import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Grid } from '@mui/material';
import { usePermissions } from '../../hooks/usePermissions';
import { useLicense } from '../../hooks/useLicense';

const PermissionTest = () => {
    const {
        permissions,
        loading,
        initialized,
        hasPermission,
        canView,
        canEdit,
        canDelete,
        canAdd,
        isAdmin,
        permissionSummary
    } = usePermissions();

    const {
        licenseStatus,
        licenseInfo,
        isLicenseValid,
        getLicenseLevel,
        hasFeature
    } = useLicense();

    if (loading) {
        return (
            <Box p={2}>
                <Typography>Loading permissions...</Typography>
            </Box>
        );
    }

    if (!initialized) {
        return (
            <Box p={2}>
                <Typography color="error">Permission system not initialized</Typography>
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                Permission System Test
            </Typography>

            <Grid container spacing={3}>
                {/* Permission Summary */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Permission Summary
                            </Typography>
                            {permissionSummary && (
                                <Box>
                                    <Typography variant="body2">
                                        <strong>Role:</strong> {permissionSummary.role}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>License Level:</strong> {permissionSummary.licenseLevel}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Valid:</strong> {permissionSummary.isValid ? 'Yes' : 'No'}
                                    </Typography>
                                    <Box mt={1}>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Permissions:</strong>
                                        </Typography>
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            <Chip 
                                                label="Read" 
                                                color={permissionSummary.permissions.canRead ? 'success' : 'default'}
                                                size="small"
                                            />
                                            <Chip 
                                                label="Edit" 
                                                color={permissionSummary.permissions.canEdit ? 'success' : 'default'}
                                                size="small"
                                            />
                                            <Chip 
                                                label="Delete" 
                                                color={permissionSummary.permissions.canDelete ? 'success' : 'default'}
                                                size="small"
                                            />
                                            <Chip 
                                                label="Add" 
                                                color={permissionSummary.permissions.canAdd ? 'success' : 'default'}
                                                size="small"
                                            />
                                            <Chip 
                                                label="Manage Users" 
                                                color={permissionSummary.permissions.canManageUsers ? 'success' : 'default'}
                                                size="small"
                                            />
                                            <Chip 
                                                label="Admin" 
                                                color={isAdmin() ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* License Information */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                License Information
                            </Typography>
                            {licenseInfo && (
                                <Box>
                                    <Typography variant="body2">
                                        <strong>Type:</strong> {licenseInfo.typeName}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Level:</strong> {licenseInfo.level}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Valid:</strong> {licenseInfo.isValid ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Expired:</strong> {licenseInfo.isExpired ? 'Yes' : 'No'}
                                    </Typography>
                                    {licenseInfo.daysUntilExpiry !== null && (
                                        <Typography variant="body2">
                                            <strong>Days until expiry:</strong> {licenseInfo.daysUntilExpiry}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Premium Access:</strong> {licenseInfo.canAccessPremium ? 'Yes' : 'No'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Enterprise Access:</strong> {licenseInfo.canAccessEnterprise ? 'Yes' : 'No'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Permission Tests */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Permission Tests
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2">
                                        Can View: <Chip 
                                            label={canView() ? 'Yes' : 'No'} 
                                            color={canView() ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2">
                                        Can Edit: <Chip 
                                            label={canEdit() ? 'Yes' : 'No'} 
                                            color={canEdit() ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2">
                                        Can Delete: <Chip 
                                            label={canDelete() ? 'Yes' : 'No'} 
                                            color={canDelete() ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2">
                                        Can Add: <Chip 
                                            label={canAdd() ? 'Yes' : 'No'} 
                                            color={canAdd() ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Feature Tests */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Feature Access Tests
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2">
                                        Bug Bounty: <Chip 
                                            label={hasFeature('bug_bounty') ? 'Yes' : 'No'} 
                                            color={hasFeature('bug_bounty') ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2">
                                        Task Voting: <Chip 
                                            label={hasFeature('task_voting') ? 'Yes' : 'No'} 
                                            color={hasFeature('task_voting') ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Typography variant="body2">
                                        Premium Analytics: <Chip 
                                            label={hasFeature('analytics_premium') ? 'Yes' : 'No'} 
                                            color={hasFeature('analytics_premium') ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Raw Data */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Raw Data (Debug)
                            </Typography>
                            <Box component="pre" sx={{ 
                                fontSize: '0.75rem', 
                                overflow: 'auto',
                                backgroundColor: 'grey.100',
                                p: 1,
                                borderRadius: 1
                            }}>
                                {JSON.stringify({
                                    permissions: permissions.slice(0, 3), // Show first 3 permissions
                                    licenseStatus: licenseStatus ? {
                                        ...licenseStatus,
                                        permissions: licenseStatus.permissions?.slice(0, 3) // Limit for display
                                    } : null
                                }, null, 2)}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PermissionTest;