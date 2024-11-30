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
import { database } from '../../config/firebase';
import { ref, set, get } from 'firebase/database';

const ProfileSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const UserProfile = () => {
    const { currentUser } = useAuth();
    const { language, direction, changeLanguage, translate, supportedLanguages } = useLanguage();
    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [userData, setUserData] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        phone: '',
        position: '',
        avatar: currentUser?.photoURL || '/src/resources/imgs/customer01.jpg',
        language: language,
        theme: 'light',
        notifications: true,
    });

    useEffect(() => {
        const loadUserSettings = async () => {
            if (currentUser) {
                const userRef = ref(database, `users/${currentUser.uid}/settings`);
                try {
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const settings = snapshot.val();
                        setUserData(prev => ({
                            ...prev,
                            ...settings,
                            name: currentUser.displayName || settings.name,
                            email: currentUser.email || settings.email,
                            avatar: currentUser.photoURL || settings.avatar,
                        }));
                    }
                } catch (error) {
                    console.error('Error loading user settings:', error);
                }
            }
        };

        loadUserSettings();
    }, [currentUser]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSave = async () => {
        if (currentUser) {
            try {
                const userRef = ref(database, `users/${currentUser.uid}/settings`);
                await set(userRef, userData);
                if (userData.language !== language) {
                    await changeLanguage(userData.language);
                }
                setEditMode(false);
            } catch (error) {
                console.error('Error saving user settings:', error);
            }
        }
    };

    const handleInputChange = (field) => (event) => {
        setUserData({ ...userData, [field]: event.target.value });
    };

    const renderPersonalInfo = () => (
        <ProfileSection dir={direction}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                    src={userData.avatar}
                    sx={{ width: 100, height: 100 }}
                />
                <Box>
                    <Typography variant="h5">{userData.name}</Typography>
                    <Typography color="textSecondary">{userData.position}</Typography>
                </Box>
                <IconButton 
                    sx={{ ml: 'auto' }} 
                    onClick={() => setEditMode(!editMode)}
                >
                    {editMode ? <SaveIcon onClick={handleSave} /> : <EditIcon />}
                </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label={translate('profile.fullName')}
                    value={userData.name}
                    onChange={handleInputChange('name')}
                    disabled={!editMode}
                    fullWidth
                />
                <TextField
                    label={translate('profile.email')}
                    value={userData.email}
                    onChange={handleInputChange('email')}
                    disabled={!editMode}
                    fullWidth
                />
                <TextField
                    label={translate('profile.phone')}
                    value={userData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!editMode}
                    fullWidth
                />
                <TextField
                    label={translate('profile.position')}
                    value={userData.position}
                    onChange={handleInputChange('position')}
                    disabled={!editMode}
                    fullWidth
                />
            </Box>
        </ProfileSection>
    );

    const renderLanguageSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h6" gutterBottom>{translate('profile.language')}</Typography>
            <Select
                value={userData.language}
                onChange={handleInputChange('language')}
                fullWidth
            >
                {supportedLanguages.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                        {lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'العربية'}
                    </MenuItem>
                ))}
            </Select>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                {translate('profile.save')}
            </Typography>
        </ProfileSection>
    );

    const renderThemeSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h6" gutterBottom>{translate('profile.theme')}</Typography>
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
        </ProfileSection>
    );

    const renderSettings = () => (
        <ProfileSection dir={direction}>
            <Typography variant="h6" gutterBottom>{translate('profile.settings')}</Typography>
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
            <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={handleSave}
            >
                {translate('profile.save')}
            </Button>
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
