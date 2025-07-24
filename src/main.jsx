import React, { Suspense ,lazy } from 'react';
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
import { I18nextProvider } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import i18n from './config/i18n';
import './index.css';

// Lazy Load Components for Performance with optimized chunking
const Layout = lazy(() => import('./components/Layout/Layout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChartsPage = lazy(() => import('./pages/ChartsPage'));
const ProductManagementPage = lazy(() => import('./pages/ProductManagementPage'));
const VotingPage = lazy(() => import('./pages/VotingPage'));

// Additional lazy-loaded pages for enhanced routing
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading Fallback Component
const LoadingFallback = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 2
        }}
    >
        <CircularProgress size={40} />
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Loading TECHNO-ETL...
        </Box>
    </Box>
);

// Error Boundary Component for Route-level Error Handling
class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Route Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        flexDirection: 'column',
                        gap: 2,
                        p: 3
                    }}
                >
                    <Box sx={{ color: 'error.main', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        Something went wrong
                    </Box>
                    <Box sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        Please refresh the page or contact Mounir for support if the problem persists.
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Refresh Page
                        </button>
                    </Box>
                </Box>
            );
        }

        return this.props.children;
    }
}

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
        <I18nextProvider i18n={i18n}>
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                <AuthProvider>
                    <LanguageProvider>
                        <ThemeProvider>
                            <SettingsProvider>
                                <CssBaseline />
                                <ToastContainer position="bottom-left" autoClose={3000} limit={3} />

                        <RouteErrorBoundary>
                            <Suspense fallback={<LoadingFallback />}>
                                <Routes>
                                    {/* Public Route */}
                                    <Route path="/login" element={<LoginRoute />} />

                                    {/* Protected Routes */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/" element={<Layout />}>
                                            <Route index element={<Navigate to="/dashboard" replace />} />

                                            {/* Core Pages */}
                                            <Route path="dashboard" element={<Dashboard />} />
                                            <Route path="charts" element={<ChartsPage />} />
                                            <Route path="products" element={<ProductManagementPage />} />
                                            <Route path="voting" element={<VotingPage />} />

                                            {/* Grid View Pages */}
                                            <Route path="inventory" element={<InventoryPage />} />
                                            <Route path="orders" element={<OrdersPage />} />
                                            <Route path="customers" element={<CustomersPage />} />
                                            <Route path="products-catalog" element={<ProductsPage />} />
                                            <Route path="reports" element={<ReportsPage />} />

                                            {/* Additional Pages */}
                                            <Route path="settings" element={<SettingsPage />} />

                                            {/* Nested Routes for Products */}
                                            <Route path="products/:id" element={<ProductManagementPage />} />
                                            <Route path="products/category/:categoryId" element={<ProductManagementPage />} />

                                            {/* 404 for protected routes */}
                                            <Route path="*" element={<NotFoundPage />} />
                                        </Route>
                                    </Route>

                                    {/* Fallback Route for unauthenticated users */}
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </Suspense>
                        </RouteErrorBoundary>
                            </SettingsProvider>
                        </ThemeProvider>
                    </LanguageProvider>
                </AuthProvider>
            </Router>
        </I18nextProvider>
    </React.StrictMode>
);
