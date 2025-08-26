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
    Fade,
    LinearProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import ApiIcon from '@mui/icons-material/Api';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import ApiSettingsTab from './tabs/ApiSettingsTab';
import PreferencesTab from './tabs/PreferencesTab';
import { useProfileController } from './ProfileController';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState(0); // Personal Info tab (0) is now first
    const [mounted, setMounted] = useState(false);
    const [tabLoading, setTabLoading] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const contentRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);
    
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
        return () => {
            setMounted(false);
            // Clear any pending auto-save timeouts
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    // Auto-save functionality with debouncing
    useEffect(() => {
        if (isDirty && !autoSaving) {
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            
            // Set new timeout for auto-save (2 seconds after last change)
            autoSaveTimeoutRef.current = setTimeout(async () => {
                try {
                    setAutoSaving(true);
                    setSaveError(null);
                    await saveUserData();
                    console.log('Auto-save completed successfully');
                } catch (error) {
                    console.error('Auto-save failed:', error);
                    setSaveError(error.message || 'Auto-save failed');
                } finally {
                    setAutoSaving(false);
                }
            }, 2000);
        }
        
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [isDirty, autoSaving, saveUserData]);

    // Show save indicator when changes are made
    useEffect(() => {
        if (isDirty || autoSaving) {
            setShowSaveIndicator(true);
            const timer = setTimeout(() => {
                if (!isDirty && !autoSaving) {
                    setShowSaveIndicator(false);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isDirty, autoSaving]);

    const handleTabChange = async (event, newValue) => {
        if (activeTab === newValue) return;
        
        try {
            setTabLoading(true);
            setSaveError(null);
            
            // Auto-save before switching tabs if there are unsaved changes
            if (isDirty) {
                setAutoSaving(true);
                await saveUserData();
                console.log('Settings saved before tab switch');
            }
            
            // Small delay for smooth transition
            await new Promise(resolve => setTimeout(resolve, 100));
            setActiveTab(newValue);
            
        } catch (error) {
            console.error('Failed to save before tab switch:', error);
            setSaveError(error.message || 'Failed to save changes');
            // Still allow tab switch even if save fails
            setActiveTab(newValue);
        } finally {
            setTabLoading(false);
            setAutoSaving(false);
        }
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
            <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2, p: 3 }}>
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    action={
                        <button onClick={() => window.location.reload()}>
                            Retry
                        </button>
                    }
                >
                    Error loading profile: {error.message || 'Unknown error occurred'}
                </Alert>
            </Paper>
        );
    }

    const renderActiveTab = () => {
        // Correct tab order: Personal Info (0), API Settings (1), Appearance & Preferences (2)
        switch(activeTab) {
            case 0:
                return (
                    <PersonalInfoTab 
                        userData={userData?.personalInfo} 
                        onUpdateUserData={handleUpdatePersonalInfo}
                        onSave={saveUserData}
                        isDirty={isDirty}
                        loading={loading || tabLoading}
                    />
                );
            case 1:
                return (
                    <ApiSettingsTab 
                        userData={userData?.apiSettings}
                        onUpdateUserData={handleUpdateApiSettings}
                        onSave={saveUserData}
                        isDirty={isDirty}
                        loading={loading || tabLoading}
                    />
                );
            case 2:
                return (
                    <PreferencesTab 
                        userData={userData?.preferences}
                        onUpdateUserData={handleUpdatePreferences}
                        onSave={saveUserData}
                        isDirty={isDirty}
                        loading={loading || tabLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2 }}>
            {/* Loading progress bar */}
            {(loading || tabLoading || autoSaving) && (
                <LinearProgress 
                    sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 1 
                    }} 
                />
            )}
            
            {/* Error notification */}
            {saveError && (
                <Alert 
                    severity="error" 
                    sx={{ m: 2, mb: 0 }}
                    onClose={() => setSaveError(null)}
                >
                    {saveError}
                </Alert>
            )}
            
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                        minHeight: 72,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500
                    }
                }}
            >
                {/* Correct tab order: Personal Info (0), API Settings (1), Appearance & Preferences (2) */}
                <Tab 
                    icon={<PersonIcon />} 
                    label="Personal Info" 
                    value={0}
                    disabled={loading || tabLoading}
                />
                <Tab 
                    icon={<ApiIcon />} 
                    label="API Settings" 
                    value={1}
                    disabled={loading || tabLoading}
                />
                <Tab 
                    icon={<LanguageIcon />} 
                    label="Appearance & Preferences" 
                    value={2}
                    disabled={loading || tabLoading}
                />
            </Tabs>
            <Box
                ref={contentRef}
                sx={{
                    p: 3,
                    flexGrow: 1,
                    minHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto'
                }}
            >
                {mounted && (
                    <Fade
                        in={!loading && mounted}
                        timeout={300}
                    >
                        <Box>
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
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={() => setShowSaveIndicator(false)}
            >
                <Alert 
                    icon={
                        autoSaving ? <CircularProgress size={16} /> :
                        isDirty ? <SaveIcon /> :
                        <CheckCircleIcon />
                    }
                    severity={
                        autoSaving ? "info" :
                        isDirty ? "warning" : 
                        "success"
                    }
                    sx={{ width: '100%' }}
                    onClose={() => setShowSaveIndicator(false)}
                >
                    {autoSaving ? "Auto-saving..." :
                     isDirty ? "Changes pending..." : 
                     "All changes saved"}
                    {lastSyncTime && !autoSaving && (
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