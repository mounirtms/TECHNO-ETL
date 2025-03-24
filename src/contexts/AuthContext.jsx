
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import magentoApi from '../services/magentoService';
const AuthContext = createContext();
const MAGENTO_API_URL = import.meta.env.VITE_MAGENTO_API_URL;

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            return {
                uid: 'magento-user',
                isMagentoUser: true,
                token
            };
        }
        return null;
    });
    const navigate = useNavigate(); // Add this line
    const [loading, setLoading] = useState(true);     
    const [adminToken, setMagentoToken] = useState(() => localStorage.getItem('adminToken'));
    const [isUsingLocalData, setIsUsingLocalData] = useState(false);

    // Monitor Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !currentUser?.isMagentoUser) {
                setCurrentUser({
                    ...user,
                    isMagentoUser: false
                });
                toast.success('Welcome back, ' + user.displayName);
            } else if (!user && !currentUser?.isMagentoUser) {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const validateMagentoToken = async (token) => {
        if (!token) {
            toast.error('No authentication token found');
            return false;
        }

        try {
            const response =   await magentoApi.get('/store/storeConfigs')

            if (!response.ok) {
                if (response.status === 401) {
                    toast.warning('Session expired. Using local cached data.', {
                        autoClose: 5000,
                        style: { backgroundColor: '#FFA500', color: '#FFFFFF' }
                    });
                    setIsUsingLocalData(true);
                    setadminToken(null);
                    localStorage.removeItem('adminToken');
                    return true; // Allow using local data
                }
                toast.warning('Connection issues. Using cached session.');
                return true;
            }

            // Reset local data flag if token is valid
            setIsUsingLocalData(false);
            return true;
        } catch (error) {
            toast.error('Network error. Please check your connection.');
            console.error('Token validation error:', error);
            setIsUsingLocalData(true);
            return true;
        }
    };

    const signInWithGoogle = async () => {
        try {
              
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await signInWithPopup(auth, provider);

            // User data will be set by the auth state observer
            toast.success('Successfully logged in with Google!');
            navigate('/'); // Redirect to home after login
            return result;
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('Failed to sign in with Google');
            throw error;
        }
    };

    const signInWithMagento = async (username, password) => {
        try {
            const response = await magentoApi.login(username, password);
 debugger
 

            const magentoUser = {
                uid: username,
                email: username,
                displayName: username,
                isMagentoUser: true,
                token:response
            };

            setCurrentUser(magentoUser);
 
            toast.success('Successfully logged in!');

            return magentoUser;
        } catch (error) {
            console.error('Magento login error:', error);
            toast.error(error.message || 'Failed to login. Please check your credentials.');
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (currentUser?.isMagentoUser) {
                // Clear Magento token
                setMagentoToken(null);
                localStorage.removeItem('adminToken');
            } else {
                // Sign out from Firebase
                await signOut(auth);
            }
            setCurrentUser(null);
            toast.success('Successfully logged out');
            window.location.href = '/login';  // Force a full page reload to clear all states
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
            throw error;
        }
    };

    // Check Magento token validity
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                if (adminToken) {
                    const isValid = await validateMagentoToken(adminToken);
                
                    if (!isValid && mounted) {
                        setMagentoToken(null);
                        setCurrentUser(null);
                        localStorage.removeItem('adminToken');
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            mounted = false;
        };
    }, [adminToken]);

    const value = {
        currentUser,
        loading,
        signInWithGoogle,
        signInWithMagento,
        logout,
        adminToken,
        isUsingLocalData,
        validateMagentoToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};