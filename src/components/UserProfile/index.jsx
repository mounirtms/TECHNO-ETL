import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    LinearProgress,
    Typography,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import ApiIcon from '@mui/icons-material/Api';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import ApiSettingsTab from './tabs/ApiSettingsTab';
import AppearancePreferencesTab from './tabs/AppearancePreferencesTab';
import { useProfileController } from './ProfileController';
import { useSettings } from '../../contexts/SettingsContext';
import SyncStatusIndicator from '../common/SyncStatusIndicator';
import SettingsErrorBoundary from '../common/SettingsErrorBoundary';
import { LoadingSpinner, SettingsLoadingIndicator } from '../common/LoadingStates';
import { SettingsSuccessFeedback, useFeedback } from '../common/FeedbackSystem';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { getDirectionalAnimation } from '../../utils/rtlAnimations';

const UserProfile = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { translate, currentLanguage, languages } = useLanguage();
    const { animations } = useCustomTheme();
    const isRTL = languages[currentLanguage]?.dir === 'rtl';
    
    const [activeTab, setActiveTab] = useState(0); // Personal Info tab (0) is now first
    const [mounted, setMounted] = useState(false);
    const [tabLoading, setTabLoading] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [tabErrors, setTabErrors] = useState({});
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

    const { settings, loading: settingsLoading, isDirty: settingsIsDirty } = useSettings();
    const [showSaveIndicator, setShowSaveIndicator] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    // Enhanced feedback system
    const { 
        feedback, 
        showSuccess, 
        hideSuccess, 
        showConfirmation, 
        hideConfirmation 
    } = useFeedback();

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

    // Enhanced auto-save functionality with retry logic and feedback
    const performAutoSave = useCallback(async () => {
        try {
            setAutoSaving(true);
            setSaveError(null);
            await saveUserData();
            setRetryCount(0);
            
            // Show success feedback
            showSuccess(
                translate('feedback.settings.saved'), 
                'save',
                translate('feedback.settings.autoSaveDetails')
            );
            
            console.log('Auto-save completed successfully');
        } catch (error) {
            console.error('Auto-save failed:', error);
            const errorMessage = error.message || translate('errors.settings.operations.saving');
            setSaveError(errorMessage);
            
            // Implement retry logic for transient errors
            if (retryCount < 3 && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT')) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => performAutoSave(), Math.pow(2, retryCount) * 1000); // Exponential backoff
            }
        } finally {
            setAutoSaving(false);
        }
    }, [saveUserData, retryCount, showSuccess, translate]);

    useEffect(() => {
        if ((isDirty || settingsIsDirty) && !autoSaving) {
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            
            // Set new timeout for auto-save (2 seconds after last change)
            autoSaveTimeoutRef.current = setTimeout(performAutoSave, 2000);
        }
        
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [isDirty, settingsIsDirty, autoSaving, performAutoSave]);

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

    const handleTabChange = useCallback(async (event, newValue) => {
        if (activeTab === newValue) return;
        
        try {
            setTabLoading(true);
            setSaveError(null);
            setTabErrors(prev => ({ ...prev, [activeTab]: null })); // Clear current tab errors
            
            // Auto-save before switching tabs if there are unsaved changes
            if (isDirty || settingsIsDirty) {
                setAutoSaving(true);
                try {
                    await saveUserData();
                    console.log('Settings saved before tab switch');
                    showSuccess(
                        translate('feedback.settings.saved'), 
                        'save'
                    );
                } catch (saveError) {
                    console.warn('Save failed before tab switch, but continuing:', saveError);
                    // Show warning but don't block tab switch
                    setSaveError(translate('errors.settings.operations.saving'));
                }
            }
            
            // Validate current tab before switching
            const currentTabValid = await validateCurrentTab();
            if (!currentTabValid) {
                setTabErrors(prev => ({ 
                    ...prev, 
                    [activeTab]: translate('errors.validation.tabSwitch') 
                }));
                return;
            }
            
            // Small delay for smooth transition with RTL support
            await new Promise(resolve => setTimeout(resolve, animations ? 150 : 50));
            setActiveTab(newValue);
            
            // Scroll to top of new tab content with smooth behavior
            if (contentRef.current) {
                contentRef.current.scrollTo({
                    top: 0,
                    behavior: animations ? 'smooth' : 'auto'
                });
            }
            
        } catch (error) {
            console.error('Failed to switch tabs:', error);
            setSaveError(error.message || translate('errors.settings.operations.tabSwitch'));
            // Still allow tab switch even if save fails
            setActiveTab(newValue);
        } finally {
            setTabLoading(false);
            setAutoSaving(false);
        }
    }, [activeTab, isDirty, settingsIsDirty, saveUserData, showSuccess, translate, animations]);

    const validateCurrentTab = useCallback(async () => {
        // Add tab-specific validation logic here
        switch (activeTab) {
            case 0: // Personal Info
                // Validate personal info fields
                return true;
            case 1: // API Settings
                // Validate API configuration
                return true;
            case 2: // Appearance & Preferences
                // Validate preferences
                return true;
            default:
                return true;
        }
    }, [activeTab]);

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

    const handleRetry = useCallback(() => {
        setSaveError(null);
        setTabErrors({});
        setRetryCount(0);
        window.location.reload();
    }, []);

    // Loading state with enhanced UI
    if (loading && !mounted) {
        return (
            <SettingsLoadingIndicator 
                operation="loading"
                message={translate('settings.operations.loading')}
            />
        );
    }

    if (error) {
        return (
            <SettingsErrorBoundary componentName="UserProfile">
                <Paper elevation={3} sx={{ maxWidth: 1200, margin: 'auto', mt: 2, p: 3 }}>
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        action={
                            <Tooltip title={translate('errors.boundary.reload')}>
                                <IconButton onClick={handleRetry} size="small">
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        }
                    >
                        <Typography variant="subtitle2" gutterBottom>
                            {translate('errors.settings.title')}
                        </Typography>
                        <Typography variant="body2">
                            {error.message || translate('errors.unknown')}
                        </Typography>
                    </Alert>
                </Paper>
            </SettingsErrorBoundary>
        );
    }

    const renderActiveTab = () => {
        const commonProps = {
            onSave: saveUserData,
            isDirty: isDirty || settingsIsDirty,
            loading: loading || tabLoading || settingsLoading,
            error: tabErrors[activeTab]
        };

        // Correct tab order: Personal Info (0), API Settings (1), Appearance & Preferences (2)
        switch(activeTab) {
            case 0:
                return (
                    <PersonalInfoTab 
                        userData={userData?.personalInfo} 
                        onUpdateUserData={handleUpdatePersonalInfo}
                        {...commonProps}
                    />
                );
            case 1:
                return (
                    <ApiSettingsTab 
                        userData={userData?.apiSettings}
                        onUpdateUserData={handleUpdateApiSettings}
                        {...commonProps}
                    />
                );
            case 2:
                return (
                    <AppearancePreferencesTab 
                        userData={settings?.preferences || userData?.preferences}
                        onUpdateUserData={handleUpdatePreferences}
                        {...commonProps}
                    />
                );
            default:
                return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Tab not found
                        </Typography>
                    </Box>
                );
        }
    };

    return (
        <SettingsErrorBoundary componentName="UserProfile">
            <Paper 
                elevation={3} 
                sx={{ 
                    maxWidth: 1200, 
                    margin: 'auto', 
                    mt: { xs: 1, sm: 2 },
                    mx: { xs: 0, sm: 'auto' },
                    borderRadius: { xs: 2, sm: 3 },
                    direction: isRTL ? 'rtl' : 'ltr',
                    ...getDirectionalAnimation('fadeIn', 'up', isRTL, {
                        duration: animations ? '0.4s' : '0s',
                        easing: 'ease-out'
                    })
                }}
            >
            {/* Loading progress bar */}
            {(loading || tabLoading || autoSaving) && (
                <LinearProgress 
                    sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        zIndex: 1,
                        borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0' }
                    }} 
                />
            )}
            
            {/* Error notification */}
            {saveError && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        m: { xs: 1, sm: 2 }, 
                        mb: 0,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                    onClose={() => setSaveError(null)}
                    action={
                        retryCount > 0 && (
                            <Tooltip title={`Retry attempt ${retryCount}/3`}>
                                <IconButton size="small" onClick={performAutoSave}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        )
                    }
                >
                    <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {saveError}
                    </Typography>
                    {retryCount > 0 && (
                        <Typography variant="caption" display="block">
                            Retry attempt {retryCount}/3
                        </Typography>
                    )}
                </Alert>
            )}

            {/* Tab-specific errors */}
            {tabErrors[activeTab] && (
                <Alert 
                    severity="warning" 
                    sx={{ 
                        m: { xs: 1, sm: 2 }, 
                        mb: 0,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                    onClose={() => setTabErrors(prev => ({ ...prev, [activeTab]: null }))}
                >
                    {tabErrors[activeTab]}
                </Alert>
            )}
            
            {/* Header with sync status - responsive */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                px: { xs: 1.5, sm: 2 }, 
                py: { xs: 1, sm: 1.5 },
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
            }}>
                <Typography 
                    variant="h6" 
                    color="text.primary"
                    sx={{ 
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        textAlign: { xs: 'center', sm: 'left' }
                    }}
                >
                    User Profile Settings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Sync Status Indicator with fallback */}
                    <React.Suspense fallback={
                        <Chip 
                            label="Sync Status" 
                            size="small" 
                            variant="outlined" 
                            color="default"
                        />
                    }>
                        <SyncStatusIndicator 
                            variant="chip" 
                            showDetails={!isMobile}
                            allowManualSync={true}
                        />
                    </React.Suspense>
                </Box>
            </Box>
            
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile={isMobile}
                sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                        minHeight: { xs: 60, sm: 72 },
                        textTransform: 'none',
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        fontWeight: 500,
                        minWidth: { xs: 120, sm: 'auto' },
                        px: { xs: 1, sm: 2 }
                    },
                    '& .MuiTabs-scrollButtons': {
                        '&.Mui-disabled': {
                            opacity: 0.3
                        }
                    }
                }}
            >
                {/* Correct tab order: Personal Info (0), API Settings (1), Appearance & Preferences (2) */}
                <Tab 
                    icon={<PersonIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />} 
                    label={isMobile ? "Personal" : "Personal Info"}
                    value={0}
                    disabled={loading || tabLoading}
                />
                <Tab 
                    icon={<ApiIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />} 
                    label={isMobile ? "API" : "API Settings"}
                    value={1}
                    disabled={loading || tabLoading}
                />
                <Tab 
                    icon={<LanguageIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />} 
                    label={isMobile ? "Appearance" : "Appearance & Preferences"}
                    value={2}
                    disabled={loading || tabLoading}
                />
            </Tabs>
            <Box
                ref={contentRef}
                sx={{
                    p: { xs: 1.5, sm: 2, md: 3 },
                    flexGrow: 1,
                    minHeight: { 
                        xs: 'calc(100vh - 300px)', 
                        sm: 'calc(100vh - 250px)',
                        md: 'calc(100vh - 200px)'
                    },
                    overflowY: 'auto',
                    overflowX: 'hidden'
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

            {/* Enhanced Success Feedback */}
            <SettingsSuccessFeedback
                open={feedback.success.open}
                operation={feedback.success.operation}
                details={feedback.success.details}
                onClose={hideSuccess}
                showDetails={true}
            />

            {/* Save indicator with RTL support */}
            <Snackbar
                open={showSaveIndicator}
                autoHideDuration={4000}
                anchorOrigin={{ 
                    vertical: 'bottom', 
                    horizontal: isRTL ? 'left' : 'right' 
                }}
                onClose={() => setShowSaveIndicator(false)}
            >
                <Alert 
                    icon={
                        autoSaving ? <CircularProgress size={16} /> :
                        (isDirty || settingsIsDirty) ? <SaveIcon /> :
                        <CheckCircleIcon />
                    }
                    severity={
                        autoSaving ? "info" :
                        (isDirty || settingsIsDirty) ? "warning" : 
                        "success"
                    }
                    sx={{ 
                        width: '100%',
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}
                    onClose={() => setShowSaveIndicator(false)}
                >
                    <Typography variant="body2">
                        {autoSaving ? translate('settings.operations.saving') :
                         (isDirty || settingsIsDirty) ? translate('settings.status.pending') : 
                         translate('settings.status.saved')}
                    </Typography>
                    {lastSyncTime && !autoSaving && (
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                            {translate('settings.lastSync')}: {new Date(parseInt(lastSyncTime)).toLocaleTimeString()}
                        </Typography>
                    )}
                    {retryCount > 0 && (
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                            {translate('errors.settings.retryCount', { count: retryCount })}
                        </Typography>
                    )}
                </Alert>
            </Snackbar>
        </Paper>
        </SettingsErrorBoundary>
    );
};

export default UserProfile;