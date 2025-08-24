import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    Tabs,
    Tab,
    Box,
    Backdrop,
    CircularProgress,
    Alert,
    Snackbar,
    Fade
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import ApiIcon from '@mui/icons-material/Api';
import SaveIcon from '@mui/icons-material/Save';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import ApiSettingsTab from './tabs/ApiSettingsTab';
import PreferencesTab from './tabs/PreferencesTab';
import { useProfileController } from './ProfileController';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState(0); // Change from 'UserProfile' to 0
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef(null);
    const {
        userData,
        loading,
        error,
        updateUserData,
        saveUserData,
        isDirty,
        lastSyncTime
    } = useProfileController();

    const [showSaveIndicator, setShowSaveIndicator] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Show save indicator when changes are made
    useEffect(() => {
        if (isDirty) {
            setShowSaveIndicator(true);
            const timer = setTimeout(() => {
                setShowSaveIndicator(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isDirty]);

    const handleTabChange = async (event, newValue) => {
        // Auto-save before switching tabs if there are unsaved changes
        if (isDirty && activeTab !== newValue) {
            try {
                await saveUserData();
            } catch (error) {
                console.error('Failed to save before tab switch:', error);
            }
        }
        setActiveTab(newValue);
    };

    // Handle updates for each section
    const handleUpdatePersonalInfo = (updates) => {
        updateUserData(updates, 'personalInfo');
    };

    const handleUpdateApiSettings = (updates) => {
        updateUserData(updates, 'apiSettings');
    };

    const handleUpdatePreferences = (updates) => {
        updateUserData(updates, 'preferences');
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading profile: {error.message}
            </Alert>
        );
    }

    const renderActiveTab = () => {
        switch(activeTab) {
            case 2:
                return (
                    <PersonalInfoTab 
                        userData={userData?.personalInfo} 
                        onUpdateUserData={handleUpdatePersonalInfo}
                        onSave={saveUserData}
                        isDirty={isDirty}
                    />
                );
            case 0:
                return (
                    <ApiSettingsTab 
                        userData={userData?.apiSettings}
                        onUpdateUserData={handleUpdateApiSettings}
                        onSave={saveUserData}
                        isDirty={isDirty}
                    />
                );
            case 1:
                return (
                    <PreferencesTab 
                        userData={userData?.preferences}
                        onUpdateUserData={handleUpdatePreferences}
                        onSave={saveUserData}
                        isDirty={isDirty}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2 }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab icon={<ApiIcon />} label="API Settings" value={0} />
                <Tab icon={<LanguageIcon />} label="Preferences" value={1} />
                <Tab icon={<PersonIcon />} label="Personal Info" value={2} />
            </Tabs>
            <Box
                ref={contentRef}
                sx={{
                    p: 3,
                    flexGrow: 1,
                    height: 'calc(100vh - 200px)', // 固定高度而非最小高度
                    overflowY: 'hidden' // 隐藏垂直滚动条
                }}
            >
                {mounted && (
                    <Fade
                        in={!loading && mounted}
                        timeout={300}
                    >
                        <Box sx={{ height: '100%' }}>
                            {renderActiveTab()}
                        </Box>
                    </Fade>
                )}
            </Box>

            {/* Loading backdrop */}
            <Backdrop
                sx={{ 
                    color: '#fff', 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    position: 'absolute'
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Save indicator */}
            <Snackbar
                open={showSaveIndicator}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                message={isDirty ? "Changes not saved" : "All changes saved"}
            >
                <Alert 
                    icon={<SaveIcon />}
                    severity={isDirty ? "warning" : "success"}
                    sx={{ width: '100%' }}
                >
                    {isDirty ? "Changes not saved" : "All changes saved"}
                    {lastSyncTime && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.8em', opacity: 0.8 }}>
                            Last synced: {new Date(parseInt(lastSyncTime)).toLocaleTimeString()}
                        </Box>
                    )}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default UserProfile;