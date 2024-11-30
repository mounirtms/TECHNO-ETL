import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import config from '../config/config';

const AuthContext = createContext();

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

    const validateMagentoToken = async (token) => {
        if (!token) return false;
        
        try {
            const response = await fetch(`${config.api.magento.baseUrl}${config.api.magento.endpoints.storeConfig}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setMagentoToken(null);
                    localStorage.removeItem('magentoToken');
                    setCurrentUser(null);
                    return false;
                }
                // For other errors, we'll assume token is still valid
                return true;
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            // For network errors, assume token is still valid
            return true;
        }
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result;
    };

    const signInWithMagento = async (username, password) => {
        try {
            const response = await fetch(`${config.api.magento.baseUrl}${config.api.magento.endpoints.login}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to authenticate with Magento');
            }

            const token = await response.json();
            setMagentoToken(token);

            // Create a custom user object for consistency with Firebase
            const magentoUser = {
                uid: username,
                email: username,
                displayName: username,
                isMagentoUser: true,
                token
            };

            setCurrentUser(magentoUser);
            // Store token securely
            localStorage.setItem('magentoToken', token);
            
            return magentoUser;
        } catch (error) {
            console.error('Magento login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        if (currentUser?.isMagentoUser) {
            // Clear Magento session
            setMagentoToken(null);
            localStorage.removeItem('magentoToken');
            setCurrentUser(null);
        } else {
            // Firebase logout
            await signOut(auth);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // If we have a token, validate it
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
