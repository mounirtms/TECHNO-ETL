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
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

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

const PersonalInfoTab = ({ onSave, loading, userData }) => {
  const { translate } = useLanguage();
  const { mode } = useTheme();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    country: userData?.country || '',
    postalCode: userData?.postalCode || '',
    birthDate: userData?.birthDate || '',
    gender: userData?.gender || '',
  });
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Load user data from currentUser
      setFormData(prevData => ({
        ...prevData,
        email: currentUser.email || '',
        firstName: currentUser.displayName?.split(' ')[0] || '',
        lastName: currentUser.displayName?.split(' ')[1] || '',
        // Add other fields from your user data
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsEdited(true);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave({
        type: 'personalInfo',
        data: formData
      });
      setIsEdited(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle avatar upload
      console.log('Avatar file:', file);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Header with Avatar and Save Button */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
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
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <UploadButton
                    component="span"
                    size="small"
                    color="primary"
                    aria-label="upload picture"
                  >
                    <PhotoCamera fontSize="small" />
                  </UploadButton>
                </label>
              </Box>
              <Stack>
                <Typography variant="h6" gutterBottom>
                  {translate('profile.personalInfo.title')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentUser?.email}
                </Typography>
              </Stack>
            </Stack>
            {isEdited && (
              <SaveButton
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={loading}
                startIcon={<SaveIcon />}
                size="small"
              >
                {translate('common.save')}
              </SaveButton>
            )}
          </Stack>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Form Fields */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.firstName')}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.lastName')}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.birthDate')}
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                select
                label={translate('profile.personalInfo.gender')}
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="male">{translate('profile.personalInfo.male')}</option>
                <option value="female">{translate('profile.personalInfo.female')}</option>
                <option value="other">{translate('profile.personalInfo.other')}</option>
              </StyledTextField>
            </Grid>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.city')}
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.country')}
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledTextField
                fullWidth
                size="small"
                label={translate('profile.personalInfo.postalCode')}
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
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