import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const MAGENTO_API_URL = import.meta.env.VITE_MAGENTO_API_URL;

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const token = localStorage.getItem('magentoToken');
        if (token) {
            return {
                uid: 'magento-user',
                isMagentoUser: true,
                token
            };
        }
        return null;
    });
    const [loading, setLoading] = useState(true);
    const [magentoToken, setMagentoToken] = useState(() => localStorage.getItem('magentoToken'));

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
            const response = await fetch(`${MAGENTO_API_URL}/store/storeConfigs`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    setMagentoToken(null);
                    localStorage.removeItem('magentoToken');
                    setCurrentUser(null);
                    return false;
                }
                toast.warning('Connection issues. Using cached session.');
                return true;
            }
    
            return true;
        } catch (error) {
            toast.error('Network error. Please check your connection.');
            console.error('Token validation error:', error);
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
            return result;
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('Failed to sign in with Google');
            throw error;
        }
    };

    const signInWithMagento = async (username, password) => {
        try {
            const response = await fetch(`${MAGENTO_API_URL}/integration/admin/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Authentication failed');
            }
    
            const token = await response.json();
            
            if (!token) {
                throw new Error('No token received from server');
            }
    
            setMagentoToken(token);
    
            const magentoUser = {
                uid: username,
                email: username,
                displayName: username,
                isMagentoUser: true,
                token
            };
    
            setCurrentUser(magentoUser);
            localStorage.setItem('magentoToken', token);
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
                setMagentoToken(null);
                localStorage.removeItem('magentoToken');
                setCurrentUser(null);
                toast.success('Successfully logged out');
            } else {
                await signOut(auth);
                toast.success('Successfully logged out from Google');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error during logout');
            throw error;
        }
    };

    // Check Magento token validity
    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                if (magentoToken) {
                    const isValid = await validateMagentoToken(magentoToken);
                    if (!isValid && mounted) {
                        setMagentoToken(null);
                        setCurrentUser(null);
                        localStorage.removeItem('magentoToken');
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
    }, [magentoToken]);

    const value = {
        currentUser,
        signInWithGoogle,
        signInWithMagento,
        magentoToken,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
