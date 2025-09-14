
/**
 * Optimized App Context
 * Performance-optimized context provider with selectors
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

// Initial state
const initialState = {
    user: null,
    theme: 'light',
    language: 'en',
    loading: false,
    error: null,
    notifications: [],
    settings: {},
    performance: {
        renderCount: 0,
        lastRender: null
    }
};

// Action types
const ActionTypes = {
    SET_USER: 'SET_USER',
    SET_THEME: 'SET_THEME',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    TRACK_RENDER: 'TRACK_RENDER',
    RESET_STATE: 'RESET_STATE'
};

// Optimized reducer
const appReducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.SET_USER:
            return { ...state, user: action.payload };
            
        case ActionTypes.SET_THEME:
            return { ...state, theme: action.payload };
            
        case ActionTypes.SET_LANGUAGE:
            return { ...state, language: action.payload };
            
        case ActionTypes.SET_LOADING:
            return { ...state, loading: action.payload };
            
        case ActionTypes.SET_ERROR:
            return { ...state, error: action.payload };
            
        case ActionTypes.ADD_NOTIFICATION:
            return {
                ...state,
                notifications: [...state.notifications, {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    ...action.payload
                }]
            };
            
        case ActionTypes.REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };
            
        case ActionTypes.UPDATE_SETTINGS:
            return {
                ...state,
                settings: { ...state.settings, ...action.payload }
            };
            
        case ActionTypes.TRACK_RENDER:
            return {
                ...state,
                performance: {
                    renderCount: state.performance.renderCount + 1,
                    lastRender: Date.now()
                }
            };
            
        case ActionTypes.RESET_STATE:
            return { ...initialState };
            
        default:
            return state;
    }
};

// Create contexts with performance optimization
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// Optimized provider component
export function OptimizedAppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Track renders for performance monitoring
    React.useEffect(() => {
        dispatch({ type: ActionTypes.TRACK_RENDER });
    });
    
    // Memoized dispatch actions to prevent unnecessary re-renders
    const actions = useMemo(() => ({
        setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
        setTheme: (theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }),
        setLanguage: (language) => dispatch({ type: ActionTypes.SET_LANGUAGE, payload: language }),
        setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
        setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
        addNotification: (notification) => dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification }),
        removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
        updateSettings: (settings) => dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings }),
        resetState: () => dispatch({ type: ActionTypes.RESET_STATE })
    }), []);
    
    // Memoized state to prevent unnecessary re-renders
    const memoizedState = useMemo(() => state, [
        state.user,
        state.theme,
        state.language,
        state.loading,
        state.error,
        state.notifications.length,
        // Use JSON.stringify for deep comparison of settings object
        JSON.stringify(state.settings),
        state.performance.renderCount
    ]);
    
    // Memoize the entire context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        state: memoizedState,
        dispatch: actions
    }), [memoizedState, actions]);
    
    return (
        <AppStateContext.Provider value={memoizedState}>
            <AppDispatchContext.Provider value={actions}>
                {children}
            </AppDispatchContext.Provider>
        </AppStateContext.Provider>
    );
}

// Optimized hooks with selectors to prevent unnecessary re-renders
export function useAppState(selector) {
    const context = useContext(AppStateContext);
    if (context === undefined) {
        throw new Error('useAppState must be used within an OptimizedAppProvider');
    }
    
    // If no selector is provided, return the full state
    if (!selector) return context;
    
    // Use selector to return only specific part of state
    return useMemo(() => selector(context), [selector, context]);
}

export function useAppDispatch() {
    const context = useContext(AppDispatchContext);
    if (context === undefined) {
        throw new Error('useAppDispatch must be used within an OptimizedAppProvider');
    }
    return context;
}

// Convenient hooks for specific state slices
export const useUser = () => useAppState(state => state.user);
export const useTheme = () => useAppState(state => state.theme);
export const useLanguage = () => useAppState(state => state.language);
export const useLoading = () => useAppState(state => state.loading);
export const useError = () => useAppState(state => state.error);
export const useNotifications = () => useAppState(state => state.notifications);
export const useSettings = () => useAppState(state => state.settings);
export const usePerformanceMetrics = () => useAppState(state => state.performance);

// Performance monitoring hook
export function useContextPerformance() {
    const performance = usePerformanceMetrics();
    const dispatch = useAppDispatch();
    
    return {
        ...performance,
        logPerformance: useCallback(() => {
            console.log('🎯 Context Performance:', {
                renders: performance.renderCount,
                lastRender: new Date(performance.lastRender).toISOString()
            });
        }, [performance])
    };
}

export default OptimizedAppProvider;
