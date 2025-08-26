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
    } catch(error: any) {
      console.error('Logout failed', error);
      // Optionally show an error notification
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 z-40 h-16 transition-all duration-300 ease-in-out',
        'bg-white/80 backdrop-blur-sm border-b border-gray-200',
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
          <IconButton size="small"
            onClick={handleDrawerToggle}
            aria-label={isDrawerCollapsed ? translate('common.expandMenu') : translate('common.collapseMenu')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            {isRTL ? (
              isDrawerCollapsed ? <ChevronLeft /> : <ChevronRight />
            ) : (
              isDrawerCollapsed ? <ChevronRight /> : <ChevronLeft />
            )}
          </IconButton>

          {/* App Title */}
          <Typography variant="h6" component="h1" className="font-semibold text-gray-800 dark:text-white">
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