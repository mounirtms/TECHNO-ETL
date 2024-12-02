import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Grid, 
    Paper, 
    Avatar, 
    Button, 
    IconButton,
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem 
} from '@mui/material';
import { 
    PhotoCamera as PhotoCameraIcon, 
    Delete as DeleteIcon 
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';

const PersonalInfoTab = ({ userData, onUpdateUserData }) => {
    const { currentUser } = useAuth();
    const { translate } = useLanguage();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        firstName: userData?.firstName || currentUser?.displayName?.split(' ')[0] || '',
        lastName: userData?.lastName || currentUser?.displayName?.split(' ')[1] || '',
        email: userData?.email || currentUser?.email || '',
        phone: userData?.phone || '',
        birthDate: userData?.birthDate || '',
        gender: userData?.gender || '',
        address: userData?.address || '',
        city: userData?.city || '',
        country: userData?.country || '',
        postalCode: userData?.postalCode || '',
        profileImage: userData?.profileImage || currentUser?.photoURL || null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    

    useEffect(() => {
        // Update form data when userData or currentUser changes
        if (userData || currentUser) {
            setFormData(prev => ({
                ...prev,
                firstName: userData?.firstName || currentUser?.displayName?.split(' ')[0] || prev.firstName,
                lastName: userData?.lastName || currentUser?.displayName?.split(' ')[1] || prev.lastName,
                email: userData?.email || currentUser?.email || prev.email,
                profileImage: userData?.profileImage || currentUser?.photoURL || prev.profileImage
            }));
        }
    }, [userData, currentUser]);

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                {translate('profile.personalInfo.title')}
            </Typography>
            
            <Grid container spacing={3}>
                {/* Form Fields (Left Side) */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.firstName')}
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.lastName')}
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.email')}
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                InputProps={{
                                    readOnly: true
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.phone')}
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.birthDate')}
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>{translate('profile.personalInfo.gender')}</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    label={translate('profile.personalInfo.gender')}
                                >
                                    <MenuItem value="male">{translate('profile.personalInfo.male')}</MenuItem>
                                    <MenuItem value="female">{translate('profile.personalInfo.female')}</MenuItem>
                                    <MenuItem value="other">{translate('profile.personalInfo.other')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.address')}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.city')}
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.country')}
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={translate('profile.personalInfo.postalCode')}
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Profile Image (Right Side) */}
                <Grid 
                    item 
                    xs={12} 
                    md={4} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'flex-start',
                        pt: { xs: 2, md: 0 } 
                    }}
                >
                    <Avatar
                        src={formData.profileImage}
                        sx={{ 
                            width: 200, 
                            height: 200, 
                            mb: 3,
                            border: '2px solid',
                            borderColor: 'primary.main'
                        }}
                    />
                    
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PersonalInfoTab;