/**
 * Enhanced TabPanel Component
 * Advanced tab system with closable tabs, overflow handling, and RTL support
 * 
 * Features:
 * - Closable tabs with confirmation dialogs
 * - Tab overflow handling with scrolling
 * - Keyboard shortcuts (Ctrl+W, Ctrl+T, Ctrl+Tab)
 * - RTL support with proper positioning
 * - Responsive design with mobile optimization
 * - Performance optimization with virtualization
 * - Accessibility compliance
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect,
  memo
} from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  MoreHoriz as MoreIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Enhanced imports
import { useRTL } from '../../contexts/RTLContext';
import useLayoutResponsive from '../../hooks/useLayoutResponsive';
import useViewportHeight from '../../hooks/useViewportHeight';
import ClosableTab from './ClosableTab';
import TooltipWrapper from '../common/TooltipWrapper';
import { thinScrollbarStyles } from '../../styles/customScrollbars';

// ===== CONSTANTS =====

const TAB_CONSTANTS = {
  MIN_TAB_WIDTH: 120,
  MAX_TAB_WIDTH: 200,
  TAB_HEIGHT: 48,
  SCROLL_BUTTON_WIDTH: 40,
  OVERFLOW_THRESHOLD: 6,
  KEYBOARD_SHORTCUTS: {
    CLOSE_TAB: ['Control+KeyW', 'Meta+KeyW'],
    NEW_TAB: ['Control+KeyT', 'Meta+KeyT'],
    NEXT_TAB: ['Control+Tab', 'Meta+Tab'],
    PREV_TAB: ['Control+Shift+Tab', 'Meta+Shift+Tab']
  }
};

// ===== STYLED COMPONENTS =====

const TabContainer = styled(Box, {
  shouldForwardProp: (prop) => !['sidebarWidth', 'isRTL', 'isTemporary'].includes(prop)
})(({ theme, sidebarWidth, isRTL, isTemporary }) => ({
  position: 'fixed',
  top: 64, // Header height
  [isRTL ? 'right' : 'left']: isTemporary ? 0 : sidebarWidth,
  width: `calc(100% - ${isTemporary ? 0 : sidebarWidth}px)`,
  height: TAB_CONSTANTS.TAB_HEIGHT,
  zIndex: theme.zIndex.appBar - 1,
  
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  
  display: 'flex',
  alignItems: 'center',
  
  transition: theme.transitions.create(['left', 'right', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard
  }),
  
  // Mobile responsive
  [theme.breakpoints.down('md')]: {
    top: 56, // Smaller header on mobile
    height: 40
  }
}));

const ScrollableTabsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  position: 'relative'
}));

const TabsWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['canScrollLeft', 'canScrollRight', 'isRTL'].includes(prop)
})(({ theme, canScrollLeft, canScrollRight, isRTL }) => ({
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
  
  // Fade effects for overflow indication
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    [isRTL ? 'right' : 'left']: 0,
    width: 20,
    background: `linear-gradient(to ${isRTL ? 'left' : 'right'}, ${alpha(theme.palette.background.paper, 1)}, transparent)`,
    zIndex: 1,
    pointerEvents: 'none',
    opacity: canScrollLeft ? 1 : 0,
    transition: theme.transitions.create('opacity')
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    [isRTL ? 'left' : 'right']: 0,
    width: 20,
    background: `linear-gradient(to ${isRTL ? 'right' : 'left'}, ${alpha(theme.palette.background.paper, 1)}, transparent)`,
    zIndex: 1,
    pointerEvents: 'none',
    opacity: canScrollRight ? 1 : 0,
    transition: theme.transitions.create('opacity')
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: TAB_CONSTANTS.TAB_HEIGHT,
  
  '& .MuiTabs-flexContainer': {
    height: TAB_CONSTANTS.TAB_HEIGHT
  },
  
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
  },
  
  // Custom scrollbar
  ...thinScrollbarStyles(theme)
}));

const ScrollButton = styled(IconButton)(({ theme }) => ({
  width: TAB_CONSTANTS.SCROLL_BUTTON_WIDTH,
  height: TAB_CONSTANTS.TAB_HEIGHT,
  borderRadius: 0,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08)
  },
  
  '&:disabled': {
    opacity: 0.3
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: TAB_CONSTANTS.SCROLL_BUTTON_WIDTH,
  height: TAB_CONSTANTS.TAB_HEIGHT,
  borderRadius: 0,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'scale(1.05)'
  }
}));

const TabContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: TAB_CONSTANTS.TAB_HEIGHT + 64, // Tab height + header height
  left: 0,
  right: 0,
  bottom: 48, // Footer height
  overflow: 'auto',
  
  // Custom scrollbar
  ...thinScrollbarStyles(theme),
  
  [theme.breakpoints.down('md')]: {
    top: 40 + 56 // Mobile tab height + mobile header height
  }
}));

// ===== MAIN COMPONENT =====

/**
 * Enhanced TabPanel Component
 */
const EnhancedTabPanel = memo(({
  tabs = [],
  activeTab = null,
  onTabChange = null,
  onTabClose = null,
  onTabAdd = null,
  onTabRefresh = null,
  maxTabs = 10,
  enableKeyboardShortcuts = true,
  enableTabScrolling = true,
  showAddButton = true,
  showOverflowMenu = true,
  children
}) => {
  const theme = useTheme();
  const { isRTL } = useRTL();
  const tabsRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [overflowMenuAnchor, setOverflowMenuAnchor] = useState(null);
  
  const {
    sidebarState,
    dimensions,
    layoutConfig
  } = useLayoutResponsive();

  // Calculate tab dimensions
  const tabDimensions = useMemo(() => {
    const containerWidth = dimensions.content?.width || window.innerWidth;
    const availableWidth = containerWidth - 
      (showAddButton ? TAB_CONSTANTS.SCROLL_BUTTON_WIDTH : 0) -
      (showOverflowMenu ? TAB_CONSTANTS.SCROLL_BUTTON_WIDTH : 0) -
      (enableTabScrolling ? TAB_CONSTANTS.SCROLL_BUTTON_WIDTH * 2 : 0);
    
    const tabCount = tabs.length;
    const idealTabWidth = Math.max(
      TAB_CONSTANTS.MIN_TAB_WIDTH,
      Math.min(TAB_CONSTANTS.MAX_TAB_WIDTH, availableWidth / tabCount)
    );
    
    return {
      tabWidth: idealTabWidth,
      totalWidth: tabCount * idealTabWidth,
      containerWidth: availableWidth,
      needsScrolling: tabCount * idealTabWidth > availableWidth
    };
  }, [tabs.length, dimensions.content?.width, showAddButton, showOverflowMenu, enableTabScrolling]);

  // Update scroll indicators
  const updateScrollIndicators = useCallback(() => {
    if (!tabsRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setScrollPosition(scrollLeft);
  }, []);

  // Scroll tabs
  const scrollTabs = useCallback((direction) => {
    if (!tabsRef.current) return;
    
    const scrollAmount = TAB_CONSTANTS.MIN_TAB_WIDTH * 2;
    const newScrollLeft = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    tabsRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, [scrollPosition]);

  // Scroll to active tab
  const scrollToActiveTab = useCallback(() => {
    if (!tabsRef.current || !activeTab) return;
    
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex === -1) return;
    
    const tabElement = tabsRef.current.querySelector(`[data-tab-index="${activeIndex}"]`);
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab, tabs]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    onTabChange?.(newValue);
    setTimeout(scrollToActiveTab, 100);
  }, [onTabChange, scrollToActiveTab]);

  // Handle tab close
  const handleTabClose = useCallback((tabId, event) => {
    event?.stopPropagation();
    onTabClose?.(tabId);
  }, [onTabClose]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (!enableKeyboardShortcuts) return;
    
    const key = `${event.ctrlKey || event.metaKey ? 'Control+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.code}`;
    
    if (TAB_CONSTANTS.KEYBOARD_SHORTCUTS.CLOSE_TAB.includes(key)) {
      event.preventDefault();
      if (activeTab) {
        handleTabClose(activeTab);
      }
    } else if (TAB_CONSTANTS.KEYBOARD_SHORTCUTS.NEW_TAB.includes(key)) {
      event.preventDefault();
      onTabAdd?.();
    } else if (TAB_CONSTANTS.KEYBOARD_SHORTCUTS.NEXT_TAB.includes(key)) {
      event.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      if (tabs[nextIndex]) {
        onTabChange?.(tabs[nextIndex].id);
      }
    } else if (TAB_CONSTANTS.KEYBOARD_SHORTCUTS.PREV_TAB.includes(key)) {
      event.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      if (tabs[prevIndex]) {
        onTabChange?.(tabs[prevIndex].id);
      }
    }
  }, [enableKeyboardShortcuts, activeTab, tabs, handleTabClose, onTabAdd, onTabChange]);

  // Handle overflow menu
  const handleOverflowMenuOpen = useCallback((event) => {
    setOverflowMenuAnchor(event.currentTarget);
  }, []);

  const handleOverflowMenuClose = useCallback(() => {
    setOverflowMenuAnchor(null);
  }, []);

  // Setup event listeners
  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      tabsElement.addEventListener('scroll', updateScrollIndicators);
      updateScrollIndicators();
      
      return () => {
        tabsElement.removeEventListener('scroll', updateScrollIndicators);
      };
    }
  }, [updateScrollIndicators]);

  useEffect(() => {
    if (enableKeyboardShortcuts) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableKeyboardShortcuts]);

  // Scroll to active tab when it changes
  useEffect(() => {
    scrollToActiveTab();
  }, [activeTab, scrollToActiveTab]);

  // Render tabs
  const renderTabs = () => (
    <StyledTabs
      value={activeTab}
      onChange={handleTabChange}
      variant="scrollable"
      scrollButtons={false}
      allowScrollButtonsMobile
      sx={{
        flex: 1,
        minHeight: TAB_CONSTANTS.TAB_HEIGHT,
        '& .MuiTabs-scroller': {
          overflow: 'hidden !important'
        }
      }}
    >
      {tabs.map((tab, index) => (
        <ClosableTab
          key={tab.id}
          value={tab.id}
          label={tab.title}
          icon={tab.icon}
          closable={tab.closable !== false}
          hasUnsavedChanges={tab.hasUnsavedChanges}
          onClose={(tabId) => handleTabClose(tabId)}
          tooltip={tab.tooltip || tab.title}
          maxWidth={tabDimensions.tabWidth}
          data-tab-index={index}
          sx={{
            minWidth: TAB_CONSTANTS.MIN_TAB_WIDTH,
            maxWidth: tabDimensions.tabWidth
          }}
        />
      ))}
    </StyledTabs>
  );

  // Render overflow menu
  const renderOverflowMenu = () => (
    <Menu
      anchorEl={overflowMenuAnchor}
      open={Boolean(overflowMenuAnchor)}
      onClose={handleOverflowMenuClose}
      PaperProps={{
        sx: {
          maxHeight: 300,
          minWidth: 200
        }
      }}
    >
      {tabs.map((tab) => (
        <MenuItem
          key={tab.id}
          selected={tab.id === activeTab}
          onClick={() => {
            onTabChange?.(tab.id);
            handleOverflowMenuClose();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {tab.icon}
          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
            {tab.title}
          </Typography>
          {tab.closable !== false && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(tab.id);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </MenuItem>
      ))}
      
      {tabs.length > 0 && (
        <>
          <Divider />
          <MenuItem onClick={() => { onTabRefresh?.(activeTab); handleOverflowMenuClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} />
            Refresh Active Tab
          </MenuItem>
        </>
      )}
    </Menu>
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <TabContainer
        ref={containerRef}
        sidebarWidth={dimensions.sidebar.width}
        isRTL={isRTL}
        isTemporary={sidebarState.isTemporary}
      >
        {/* Left scroll button */}
        {enableTabScrolling && tabDimensions.needsScrolling && (
          <ScrollButton
            onClick={() => scrollTabs(isRTL ? 'right' : 'left')}
            disabled={!canScrollLeft}
            size="small"
          >
            {isRTL ? <ArrowRightIcon /> : <ArrowLeftIcon />}
          </ScrollButton>
        )}

        {/* Tabs container */}
        <ScrollableTabsContainer>
          <TabsWrapper
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            isRTL={isRTL}
          >
            <Box
              ref={tabsRef}
              sx={{
                display: 'flex',
                overflow: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {renderTabs()}
            </Box>
          </TabsWrapper>
        </ScrollableTabsContainer>

        {/* Right scroll button */}
        {enableTabScrolling && tabDimensions.needsScrolling && (
          <ScrollButton
            onClick={() => scrollTabs(isRTL ? 'left' : 'right')}
            disabled={!canScrollRight}
            size="small"
          >
            {isRTL ? <ArrowLeftIcon /> : <ArrowRightIcon />}
          </ScrollButton>
        )}

        {/* Add tab button */}
        {showAddButton && tabs.length < maxTabs && (
          <TooltipWrapper title="Add new tab (Ctrl+T)">
            <ActionButton onClick={onTabAdd} size="small">
              <AddIcon />
            </ActionButton>
          </TooltipWrapper>
        )}

        {/* Overflow menu button */}
        {showOverflowMenu && tabs.length > TAB_CONSTANTS.OVERFLOW_THRESHOLD && (
          <TooltipWrapper title="More tabs">
            <ActionButton onClick={handleOverflowMenuOpen} size="small">
              <MoreIcon />
            </ActionButton>
          </TooltipWrapper>
        )}
      </TabContainer>

      {/* Tab content */}
      <TabContent>
        <Fade in timeout={200}>
          <Box sx={{ height: '100%' }}>
            {children}
          </Box>
        </Fade>
      </TabContent>

      {/* Overflow menu */}
      {renderOverflowMenu()}
    </>
  );
});

EnhancedTabPanel.displayName = 'EnhancedTabPanel';

export default EnhancedTabPanel;