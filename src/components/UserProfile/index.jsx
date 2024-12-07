import React, { useState } from 'react';
import {
    Paper,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import ApiIcon from '@mui/icons-material/Api';
import PersonalInfoTab from './tabs/PersonalInfoTab';
import ApiSettingsTab from './tabs/ApiSettingsTab';
import PreferencesTab from './tabs/PreferencesTab';
import { useProfileController } from './ProfileController';

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState(0);
    const {
        userData,
        loading,
        error,
        updateUserData
    } = useProfileController();

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

 

    return (
        <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab icon={<ApiIcon />} label="API Settings" />
                <Tab icon={<LanguageIcon />} label="Preferences" />
                <Tab icon={<PersonIcon />} label="Personal Info" />

            </Tabs>
            <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflowY: 'auto' }}>
                {activeTab === 2 && (
                    <PersonalInfoTab
                        userData={userData}
                        onUpdateUserData={updateUserData}
                    />
                )}
                {activeTab === 0 && (
                    <ApiSettingsTab />
                )}
                {activeTab === 1 && (
                    <PreferencesTab
                        onUpdateUserData={updateUserData}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default UserProfile;