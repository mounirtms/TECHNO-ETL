import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageIcon from '@mui/icons-material/Language';
import { saveUnifiedSettings } from '../../utils/unifiedSettingsManager';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
];

const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentLanguage, setLanguage, translate } = useLanguage();

  const handleLanguageChange = (languageCode) => {
    setLanguage(languageCode);
    saveUnifiedSettings({ language: languageCode });
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={translate('common.changeLanguage') || 'Change Language'}>
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
            selected={currentLanguage === lang.code}
          >
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
