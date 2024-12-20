import React, { Suspense, lazy } from 'react'; // TODO: Implement lazy loading for components
import ReactDOM from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
    useLocation,
    useNavigate
} from 'react-router-dom';
import {
    CssBaseline,
    CircularProgress,
    Box
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import { getDatabase, ref, set, get } from 'firebase/database';
import { MENU_ITEMS } from './components/Layout/Constants'; // Adjust the path as necessary
// Performance TODO: Consider code splitting for large components

// Performance TODO: Implement route-based code splitting
// const Login = lazy(() => import('./pages/Login'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Layout = lazy(() => import('./components/layout/Layout'));

// Performance Optimization: Loading Fallback Component
const LoadingFallback = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}
    >
        <CircularProgress />
    </Box>
);

// Performance TODO: Memoize route components to prevent unnecessary re-renders
// Use React.memo() for components that don't need frequent updates

// Protected Route Component
// TODO: Optimize authentication checks
// - Implement token validation middleware
// - Add caching mechanism for user authentication state
const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
    const fetchMenuItemsFromDatabase = async () => {
        const db = getDatabase();
        const menuItemsRef = ref(db, 'constants');

        try {
            const snapshot = await get(menuItemsRef);
            if (snapshot.exists()) {
                const menuItems = snapshot.val();
                console.log('Fetched MENU_ITEMS:', menuItems);
                localStorage.setItem('dynamicMenuItems', JSON.stringify(menuItems)); // Save to local storage menuItems;
            } else {
                console.log('No data available');
            }
        } catch (error) {
            console.error('Error fetching MENU_ITEMS:', error);
        }
    };
    React.useEffect(() => {
        //  if (!loading && !currentUser && !skipAuth) {
        // Redirect to login if not authenticated and not in dev mode
        //    navigate('/login', {
        //      state: { from: location },
        //    replace: true
        //});
        //}else{
        fetchMenuItemsFromDatabase();
        //}
    }, [currentUser, loading, navigate, location, skipAuth]);

    if (loading && !skipAuth) {
        return <LoadingFallback />;
    }

    // Allow access in dev mode or if authenticated
    return (skipAuth || currentUser) ? <Outlet /> : <Navigate to="/login" replace />;
};

// Login Route Wrapper
// TODO: Enhance login route logic
// - Add more robust error handling
// - Implement login attempt tracking
const LoginRoute = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && currentUser) {
            // Redirect to dashboard or previous page if already authenticated
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [currentUser, loading, navigate, location]);
    const uploadConstantsToDatabase = async () => {
        const db = getDatabase();
        const constantsRef = ref(db, 'menuItems');

        try {
            await set(constantsRef, MENU_ITEMS);
            console.log('Constants uploaded successfully.');
        } catch (error) {
            console.error('Error uploading constants:', error);
        }
    };
    // Performance TODO:
    // - Optimize redirect logic
    // - Implement client-side route caching
    if (loading) {
        return <LoadingFallback />;
    }

    return currentUser ? <Navigate to="/dashboard" replace /> : <Login />;
};

// Performance Optimization Entry Point
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 
            Performance TODOs:
            - Implement server-side rendering (SSR) for initial load optimization
            - Add progressive hydration techniques
            - Optimize context providers order and memoization
        */}
        <Router>
            {/* 
                Performance Considerations:
                - Minimize context provider nesting
                - Use context selectors to reduce unnecessary re-renders
                - Implement context memoization
            */}
            <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        {/* 
                            Global UI Performance Optimizations:
                            - Implement adaptive loading techniques
                            - Add performance monitoring
                            - Optimize CSS-in-JS rendering
                        */}
                        <CssBaseline />

                        {/* 
                            Notification System Performance TODO:
                            - Limit maximum number of toast notifications
                            - Implement notification queue management
                            - Add configurable notification lifetime
                        */}
                        <ToastContainer
                            position="bottom-left"
                            autoClose={3000}
                            limit={3} // Limit concurrent notifications
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />

                        {/* 
                            Routing Performance Optimizations:
                            - Implement route-based code splitting
                            - Add transition animations with minimal performance impact
                            - Optimize route matching algorithm
                        */}
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/login" element={<LoginRoute />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/" element={<Layout />}>
                                        <Route index element={<Navigate to="/dashboard" replace />} />
                                        <Route path="dashboard" element={<Dashboard />} />
                                    </Route>
                                </Route>

                                {/* 
                                    Catch-all Route Performance TODO:
                                    - Log undefined route access
                                    - Implement more sophisticated 404 handling
                                */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Suspense>
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);

// Performance Monitoring and Logging TODO:
// - Implement performance tracking
// - Add error boundary for unhandled exceptions
// - Create performance logging mechanism

// Potential Future Performance Improvements:
// 1. Implement WebWorker for heavy computations
// 2. Add service worker for offline capabilities
// 3. Optimize asset loading and caching strategies
// 4. Implement advanced memoization techniques
// 5. Add performance profiling tools
