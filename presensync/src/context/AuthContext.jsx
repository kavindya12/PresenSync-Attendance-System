import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/endpoints.js';
import { initializeSocket, disconnectSocket } from '../utils/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token and fetch user
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                    // Initialize socket connection
                    initializeSocket();
                } catch (error) {
                    // Token invalid, clear it
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const signIn = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user, token, refreshToken } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            
            // Initialize socket
            initializeSocket();
            
            return { data: { user }, error: null };
        } catch (error) {
            return {
                data: null,
                error: {
                    message: error.response?.data?.error || 'Login failed',
                },
            };
        }
    };

    const signUp = async (email, password, metadata) => {
        try {
            const response = await authAPI.register({
                email,
                password,
                ...metadata,
            });
            const { user, token, refreshToken } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            
            // Initialize socket
            initializeSocket();
            
            return { data: { user }, error: null };
        } catch (error) {
            return {
                data: null,
                error: {
                    message: error.response?.data?.error || 'Registration failed',
                },
            };
        }
    };

    const signOut = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            disconnectSocket();
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile: user, // For backward compatibility
            loading, 
            signIn, 
            signUp, 
            signOut,
            updateUser,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
