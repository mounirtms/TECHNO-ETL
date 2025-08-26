import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from './Constants';
import { useTab } from '../../contexts/TabContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import technoIcon from '../../assets/images/techno.png';
import logoTechno from '../../assets/images/logo_techno.png';
import TreeMenuNavigation from './TreeMenuNavigation';

interface ModernSidebarProps {
  open: boolean;
  toggleDrawer: () => void;
  isRTL?: boolean;
const ModernSidebar: React.FC<ModernSidebarProps> = ({ 
  open, 
  toggleDrawer, 
  isRTL
}) => {
  const { activeTab, openTab } = useTab();
  const { translate } = useLanguage();
  const { currentUser } = useAuth();

  const handleTabClick = (tabId: string) => {
    openTab(tabId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleDrawer}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 h-full z-50 transition-all duration-300 ease-in-out',
          'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
          'border-r border-gray-200 dark:border-gray-700',
          'shadow-lg',
          // Width and positioning
          open 
            ? `w-[${DRAWER_WIDTH}px]` 
            : `w-[${COLLAPSED_WIDTH}px]`,
          // Mobile behavior
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // RTL support
          isRTL ? 'right-0 border-r-0 border-l' : 'left-0'
        )}
      >
        {/* Logo Container */}
        <div className={cn(
          'h-16 flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700',
          'bg-gradient-to-r from-techno-orange-50 to-orange-50 dark:from-techno-orange-900/20 dark:to-orange-900/20'
        )}>
          <img
            src={open ? logoTechno : technoIcon}
            alt={open ? 'Techno ETL Logo' : 'Techno ETL Icon'}
            className={cn(
              'transition-all duration-300 ease-in-out',
              open ? 'h-8 w-auto' : 'h-8 w-8',
              'object-contain'
            )}
          />
        </div>

        {/* Navigation Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <TreeMenuNavigation
            open={open}
            isRTL={isRTL}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            currentUser={currentUser}
            translate={translate}
          />
        </div>

        {/* Scrollbar Styling */}
        <style jsx>{`
          aside::-webkit-scrollbar {
            width: 4px;
          aside::-webkit-scrollbar-thumb {
            background-color: rgb(229, 231, 235);
            border-radius: 2px;
          .dark aside::-webkit-scrollbar-thumb {
            background-color: rgb(107, 114, 128);
          aside::-webkit-scrollbar-track {
            background: transparent;
        `}</style>
      </aside>
    </>
  );
};

export default ModernSidebar;