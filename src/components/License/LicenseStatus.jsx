import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  CheckCircle as ValidIcon,
  Cancel as InvalidIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  check_license_status,
  get_license_details,
  set_license_status,
} from '../../utils/licenseUtils';
// setupTestLicenses removed - not needed in production

const LicenseStatus = () => {
  const { currentUser } = useAuth();
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkCurrentLicense = async () => {
    if (!currentUser?.uid) {
      setError('No user authenticated');
      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [hasValidLicense, details] = await Promise.all([
        check_license_status(currentUser.uid),
        get_license_details(currentUser.uid),
      ]);

      setLicenseStatus(hasValidLicense);
      setLicenseDetails(details);
    } catch (err) {
      setError(err.message);
      console.error('Error checking license:', err);
    } finally {
      setLoading(false);
    }
  };

  const activateTestLicense = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const testLicense = {
        isValid: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        licenseType: 'premium',
        features: ['dashboard', 'products', 'orders', 'customers', 'analytics', 'charts'],
      };

      await set_license_status(currentUser.uid, testLicense);
      await checkCurrentLicense();
    } catch (err) {
      setError(err.message);
    }
  };

  const deactivateLicense = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      await set_license_status(currentUser.uid, { isValid: false });
      await checkCurrentLicense();
    } catch (err) {
      setError(err.message);
    }
  };

  const setupAllTestLicenses = async () => {
    try {
      setLoading(true);
      // Test license setup removed for production
      console.log('Test license setup disabled in production');
      await checkCurrentLicense();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    checkCurrentLicense();
  }, [currentUser?.uid]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';

    return new Date(dateString).toLocaleDateString();
  };

  const getLicenseIcon = () => {
    if (licenseStatus === true) return <ValidIcon color="success" />;
    if (licenseStatus === false) return <InvalidIcon color="error" />;

    return <WarningIcon color="warning" />;
  };

  const getLicenseStatusText = () => {
    if (licenseStatus === true) return 'Valid';
    if (licenseStatus === false) return 'Invalid';

    return 'Unknown';
  };

  const getLicenseStatusColor = () => {
    if (licenseStatus === true) return 'success';
    if (licenseStatus === false) return 'error';

    return 'warning';
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
                License Status
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getLicenseIcon()}
                <Typography variant="h6">
                                    License Status:
                  <Chip
                    label={getLicenseStatusText()}
                    color={getLicenseStatusColor()}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>

              {licenseDetails && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                                        License Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                                                License Type
                      </Typography>
                      <Typography variant="body1">
                        {licenseDetails.licenseType || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                                                Expiry Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(licenseDetails.expiryDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                                                Created
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(licenseDetails.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                                                Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(licenseDetails.updatedAt)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {licenseDetails.features && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                                                Available Features
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {licenseDetails.features.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                                Test Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Use these buttons to test license functionality
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={activateTestLicense}
                  disabled={loading}
                >
                                    Activate Test License
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={deactivateLicense}
                  disabled={loading}
                >
                                    Deactivate License
                </Button>

                <Button
                  variant="outlined"
                  onClick={checkCurrentLicense}
                  disabled={loading}
                >
                                    Refresh Status
                </Button>

                <Button
                  variant="outlined"
                  onClick={setupAllTestLicenses}
                  disabled={loading}
                >
                                    Setup All Test Licenses
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Current User:</strong> {currentUser?.uid || 'Not authenticated'}
          </Typography>
          <Typography variant="body2">
            <strong>User Type:</strong> {currentUser?.isMagentoUser ? 'Magento' : 'Firebase'}
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default LicenseStatus;
