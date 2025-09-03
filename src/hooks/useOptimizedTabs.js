import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

const useOptimizedTabs = (initialTabs = []) => {
  // Tab state
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(initialTabs[0]?.id || null);
  
  // Performance tracking
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  // Memoized tab operations
  const addTab = useCallback((tab) => {
    setTabs(prevTabs => {
      // Check for duplicates
      if (prevTabs.some(t => t.id === tab.id)) {
        setActiveTab(tab.id);
        return prevTabs;
      }
      
      const newTabs = [...prevTabs, tab];
      setActiveTab(tab.id);
      return newTabs;
    });
  }, []);
  
  const removeTab = useCallback((tabId) => {
    setTabs(prevTabs => {
      const index = prevTabs.findIndex(t => t.id === tabId);
      if (index === -1) return prevTabs;
      
      const newTabs = [...prevTabs];
      newTabs.splice(index, 1);
      
      // Update active tab if needed
      if (activeTab === tabId) {
        const nextTab = newTabs[index] || newTabs[index - 1] || newTabs[0];
        setActiveTab(nextTab?.id || null);
      }
      
      return newTabs;
    });
  }, [activeTab]);
  
  const updateTab = useCallback((tabId, updates) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    );
  }, []);
  
  // Memoized tab selectors
  const currentTab = useMemo(() => 
    tabs.find(tab => tab.id === activeTab), 
    [tabs, activeTab]
  );
  
  // Monitor performance
  useEffect(() => {
    renderCount.current += 1;
    const timeSinceLastRender = Date.now() - lastRenderTime.current;
    
    if (timeSinceLastRender < 16) { // 60fps threshold
      console.warn('Tab updates occurring too frequently');
    }
    
    lastRenderTime.current = Date.now();
  });
  
  // Exposed API
  return {
    // State
    tabs,
    activeTab,
    currentTab,
    
    // Actions
    setActiveTab,
    addTab,
    removeTab,
    updateTab,
    
    // Utility functions
    hasTab: useCallback((tabId) => 
      tabs.some(tab => tab.id === tabId),
      [tabs]
    ),
    
    getTab: useCallback((tabId) => 
      tabs.find(tab => tab.id === tabId),
      [tabs]
    ),
    
    // Performance metrics
    renderCount: renderCount.current,
  };
};

export default useOptimizedTabs;