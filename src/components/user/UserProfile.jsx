import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    Tabs,
    Tab,
    IconButton,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LanguageIcon from '@mui/icons-material/Language';
import BrushIcon from '@mui/icons-material/Brush';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '@mui/material/styles';

const ProfileSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[1],
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: theme.shadows[4],
    }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 120,
    height: 120,
    border: `4px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[3],
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: theme.shadows[6],
    }
}));

const TabPanel = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const UserProfile = () => {
    const { currentUser } = useAuth();
    const { language, direction, changeLanguage, translate, supportedLanguages } = useLanguage();
    const theme = useTheme();

    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(false);

    // Use local state for development
    const [userData, setUserData] = useState({
        name: currentUser?.displayName || 'Development User',
        email: currentUser?.email || 'dev@example.com',
        phone: '+1 234 567 8900',
        position: 'Admin',
        avatar: currentUser?.photoURL || 'https://via.placeholder.com/150',
        language: language,
        theme: 'light',
        notifications: true,
    });

    useEffect(() => {
        const loadUserSettings = async () => {
            // In development, just log a message
            console.log('Loading user settings...');
        };

        loadUserSettings();
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSave = () => {
        setEditMode(false);
        // In development, just log the changes
        console.log('Saved user data:', userData);
    };

    const handleInputChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'language') {
            changeLanguage(value);
        }
    };

    const renderPersonalInfo = () => (
        <ProfileSection dir={direction}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 4, 
                mb: 4,
                flexDirection: { xs: 'column', sm: 'row' }
            }}>
                <StyledAvatar
                    src={userData.avatar}
                    alt={userData.name}
                />
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1 }}>{userData.name}</Typography>
                            <Typography 
                                variant="subtitle1" 
                                color="textSecondary"
                                sx={{ mb: 2 }}
                            >
                                {userData.position || 'No position set'}
                            </Typography>
                        </Box>
                        <IconButton 
                            sx={{ 
                                backgroundColor: theme => theme.palette.primary.main,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: theme => theme.palette.primary.dark,
                                }
                            }} 
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? <SaveIcon onClick={handleSave} /> : <EditIcon />}
                        </IconButton>
                    </Box>
                    <Box sx={{ 
                        display: 'grid', 
                        gap: 3,
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
                    }}>
                        <TextField
                            label={translate('profile.fullName')}
                            value={userData.name}
                            onChange={handleInputChange('name')}
                            disabled={!editMode}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label={translate('profile.email')}
                            value={userData.email}
                            onChange={handleInputChange('email')}
                            disabled={!editMode}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label={translate('profile.phone')}
                            value={userData.phone}
                            onChange={handleInputChange('phone')}
                            disabled={!editMode}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label={translate('profile.position')}
                            value={userData.position}
                            onChange={handleInputChange('position')}
                            disabled={!editMode}
                            fullWidth
                            variant="outlined"
                        />
                    </Box>
                </Box>
            </Box>
        </ProfileSection>
    );

    const renderLanguageSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h5" gutterBottom>{translate('profile.language')}</Typography>
            <Select
                value={userData.language}
                onChange={handleInputChange('language')}
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
            >
                {supportedLanguages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                    </MenuItem>
                ))}
            </Select>
            <Typography variant="body2" color="textSecondary">
                {translate('profile.languageDescription')}
            </Typography>
        </ProfileSection>
    );

    const renderThemeSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h5" gutterBottom>{translate('profile.theme')}</Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={userData.theme === 'dark'}
                        onChange={(e) => setUserData({ 
                            ...userData, 
                            theme: e.target.checked ? 'dark' : 'light' 
                        })}
                    />
                }
                label={translate('profile.darkMode')}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {translate('profile.themeDescription')}
            </Typography>
        </ProfileSection>
    );

    const renderSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h5" gutterBottom>{translate('profile.settings')}</Typography>
            <FormControlLabel
                control={
                    <Switch
                        checked={userData.notifications}
                        onChange={(e) => setUserData({ 
                            ...userData, 
                            notifications: e.target.checked 
                        })}
                    />
                }
                label={translate('profile.notifications')}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {translate('profile.notificationsDescription')}
            </Typography>
        </ProfileSection>
    );

    return (
        <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': { minHeight: 64 }
                }}
                dir={direction}
            >
                <Tab icon={<PersonIcon />} label={translate('profile.personalInfo')} />
                <Tab icon={<LanguageIcon />} label={translate('profile.language')} />
                <Tab icon={<BrushIcon />} label={translate('profile.theme')} />
                <Tab icon={<SettingsIcon />} label={translate('profile.settings')} />
            </Tabs>
            <Box sx={{ overflow: 'auto', height: 'calc(100% - 64px)' }}>
                {activeTab === 0 && renderPersonalInfo()}
                {activeTab === 1 && renderLanguageSettings()}
                {activeTab === 2 && renderThemeSettings()}
                {activeTab === 3 && renderSettings()}
            </Box>
        </Paper>
    );
};

export default UserProfile;
