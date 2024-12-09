import React, { useState } from 'react';
import { 
    Menu, 
    MenuItem, 
    IconButton, 
    Tooltip 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
];

const LanguageSwitcher = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { i18n } = useTranslation();

    const handleLanguageChange = (languageCode) => {
        i18n.changeLanguage(languageCode);
        localStorage.setItem('language', languageCode);
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Change Language">
                <IconButton 
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                >
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {languages.map((lang) => (
                    <MenuItem 
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        selected={i18n.language === lang.code}
                    >
                        {lang.name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguageSwitcher;
