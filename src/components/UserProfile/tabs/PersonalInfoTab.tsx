import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Skeleton,
  Paper,
  Stack,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCustomTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfileController } from '../ProfileController';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `3px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[8],
  },
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: -6,
  bottom: 6,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  padding: 6,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    },
  },
  '& .MuiInputBase-input': {
    padding: '8px 14px',
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(0.8, 3),
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: theme.shadows[2],
  },
}));

const PersonalInfoTab = () => {
  const { userData, updateUserData, loading } = useProfileController();
  const { translate } = useLanguage();
  const { mode } = useCustomTheme();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    birthDate: '',
    gender: ''
  });

  // Load data when userData changes
  useEffect(() => {
    const remoteSettings = userData?.personalInfo;
    if(remoteSettings) {
      setFormData(remoteSettings);
  }, [userData?.personalInfo]);

  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData,
      [field]: value
    };
    setFormData(updatedFormData);
    
    // Only update local storage
    localStorage.setItem('userPersonalInfo', JSON.stringify(updatedFormData));
  };

  const handleSyncToFirebase = () => {
    updateUserData({
      personalInfo: formData,
      apiSettings: JSON.parse(localStorage.getItem('userApiSettings')),
      preferences: JSON.parse(localStorage.getItem('userPreferences'))
    });
  };

  return (
    <Paper elevation={0} sx={{ display: "flex", p: 2 } as any}></
      <Grid { ...{container: true}} spacing={2}>
        {/* Header with Avatar and Save Button */}
        <Grid size={{ xs: 12 }}></
          <Stack direction
            spacing={2}
            sx={{ display: "flex", mb: 2 } as any}>
            <Stack direction="row" spacing={2} alignItems="center"></
              <Box position="relative">
                {loading ? (
                  <Skeleton variant="circular" width={100} height={100} />
                ) : (
                  <StyledAvatar
                    alt={formData.firstName}
                    src={currentUser?.photoURL}
                  />
                )}
                <input
                  accept
                  style={{ display: 'none' }}
                  id
                  onChange={(e) => (event) => console.log('Avatar file:', event.target.files[0])}
                />
                <label htmlFor="avatar-upload">
                  <UploadButton
                    component
                  {translate('profile.personalInfo.title')}
                </Typography></
                <Typography variant="outlined" color="textSecondary">
                  {currentUser?.email}
                </Typography>
              </Stack>
            </Stack>
            <Button
              variant="outlined"
              onClick={handleSyncToFirebase}
              startIcon={<SyncIcon />}
              disabled={loading}
            >
              {translate('profile.syncToCloud')}
            </Button>
          </Stack>
          <Divider sx={{ display: "flex", my: 2 } as any} /></Divider>

        {/* Form Fields */}
        <Grid size={{ xs: 12 }}></
          <Grid { ...{container: true}} spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.firstName')}
                name
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.lastName')}
                name
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.phone')}
                name
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.birthDate')}
                name
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.gender')}
                name
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                disabled={loading}
              >
                <option value="male">{translate('profile.personalInfo.male')}</option>
                <option value="female">{translate('profile.personalInfo.female')}</option>
                <option value="other">{translate('profile.personalInfo.other')}</option>
              </StyledTextField>
            </Grid>
            <Grid size={{ xs: 12 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.address')}
                name
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.city')}
                name
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.country')}
                name
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}></
              <StyledTextField fullWidth
                size="small"
                label={translate('profile.personalInfo.postalCode')}
                name
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalInfoTab;