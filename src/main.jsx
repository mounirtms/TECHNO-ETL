import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/*"
                                element={
                                    <PrivateRoute>
                                        <Layout />
                                    </PrivateRoute>
                                }
                            />
                        </Routes>
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
