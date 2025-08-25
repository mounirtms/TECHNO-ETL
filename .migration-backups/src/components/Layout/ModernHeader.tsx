import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { IconButton } from '../ui/modern';
import { Typography } from '../ui/modern/Typography';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTab } from '../../contexts/TabContext';
import ModernUserMenu from './ModernUserMenu';

interface ModernHeaderProps {
  isDrawerCollapsed: boolean;
  handleDrawerToggle: () => void;
  handleProfileMenuOpen?: () => void;
  handleProfileMenuClose?: () => void;
  anchorEl?: HTMLElement | null;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  isDrawerCollapsed,
  handleDrawerToggle,
  handleProfileMenuOpen,
  handleProfileMenuClose,
  anchorEl
}) => {
  const { currentUser } = useAuth();
  const { openTab } = useTab();
  const { currentLanguage, translate } = useLanguage();
  const isRTL = currentLanguage === 'ar';

  const handleLogout = async () => {
    try {
      // await logout(); // Uncomment when logout function is available
      handleProfileMenuClose?.();
      // Optionally redirect to login page
    } catch (error) {
      console.error('Logout failed', error);
      // Optionally show an error notification
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out',
        'dark:bg-gray-900/80 dark:border-gray-700',
        // Dynamic width and margin based on drawer state
        'sm:ml-16', // Base collapsed width
        isDrawerCollapsed 
          ? `sm:w-[calc(100%-${COLLAPSED_WIDTH}px)] sm:ml-[${COLLAPSED_WIDTH}px]`
          : `sm:w-[calc(100%-${DRAWER_WIDTH}px)] sm:ml-[${DRAWER_WIDTH}px]`,
        // Mobile full width
        'w-full ml-0'
      )}
      style={{
        width: window.innerWidth >= 640 
          ? `calc(100% - ${isDrawerCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)`
          : '100%',
        marginLeft: window.innerWidth >= 640 
          ? isDrawerCollapsed ? `${COLLAPSED_WIDTH}px` : `${DRAWER_WIDTH}px`
          : '0',
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu toggle */}
        <div className="flex items-center gap-4">
          <IconButton
            size="md"
            variant="ghost"
            onClick={handleDrawerToggle}
            aria-label={isDrawerCollapsed ? translate('common.expandMenu') : translate('common.collapseMenu')}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDrawerCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </IconButton>

          {/* App Title */}
          <Typography 
            variant="h6" 
            className="font-semibold text-gray-900 dark:text-white hidden sm:block"
            noWrap
          >
            {translate('common.appTitle')}
          </Typography>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center">
          <ModernUserMenu />
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
