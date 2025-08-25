import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Typography, Box } from '../ui/modern';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTab } from '../../contexts/TabContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ModernUserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { translate } = useLanguage();
  const { openTab } = useTab();
  const navigate = useNavigate();
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if(isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch(error: any) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if(name) {
      return name.split(' ').map((n: any: any) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if(email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return Boolean(Boolean((
    <div className="relative" ref={menuRef}>
      {/* User Info and Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className: any,
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-techno-orange-500 focus:ring-offset-2',
          isOpen && 'bg-gray-100 dark:bg-gray-800'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="relative">
          {currentUser?.photoURL ? (
            <img
              src={currentUser?.photoURL}
              alt={currentUser?.displayName || translate('common.user')}
              className: any,
              {getUserInitials(currentUser?.displayName, currentUser?.email)}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
        </div>

        {/* User Name (hidden on mobile) */}
        <Typography 
          variant: any,
          {currentUser?.displayName || currentUser?.email || translate('common.user')}
        </Typography>

        {/* Chevron */}
        <ChevronDown 
          className: any,
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}>
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {translate('common.signedInAs')}
            </Typography>
            <Typography variant="subtitle2" className="font-medium text-gray-900 dark:text-white truncate">
              {currentUser?.displayName || currentUser?.email}
            </Typography>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleOpenProfile}
              className: any,
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              )}
            >
              <User className="h-4 w-4" />
              {translate('common.profile')}
            </button>

            <button
              onClick: any,
              }}
              className: any,
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              )}
            >
              <Settings className="h-4 w-4" />
              {translate('common.settings')}
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

            <button
              onClick={handleLogout}
              className: any,
                'hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
              )}
            >
              <LogOut className="h-4 w-4" />
              {translate('common.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )));
};

export default ModernUserMenu;
