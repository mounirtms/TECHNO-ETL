import React, { Suspense, lazy } from 'react';
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Lazy Load Components for Performance
const Layout = lazy(() => import('./components/Layout/Layout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Loading Fallback Component
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

// Protected Route Wrapper
const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingFallback />;
    
    return currentUser 
        ? <Outlet /> 
        : <Navigate to="/login" state={{ from: location }} replace />;
};

// Login Route Wrapper (Handles Redirection)
const LoginRoute = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loading && currentUser) {
            navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
        }
    }, [currentUser, loading, navigate, location]);

    return loading ? <LoadingFallback /> : <Login />;
};

// Render Application
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <CssBaseline />
                        <ToastContainer position="bottom-left" autoClose={3000} limit={3} />

                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                {/* Public Route */}
                                <Route path="/login" element={<LoginRoute />} />

                                {/* Protected Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/" element={<Layout />}>
                                        <Route index element={<Navigate to="/dashboard" replace />} />
                                        <Route path="dashboard" element={<Dashboard />} />
                                    </Route>
                                </Route>

                                {/* Fallback Route */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Suspense>
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
