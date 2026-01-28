import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { initializeSocket, disconnectSocket } from '../utils/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    try {
                        // Try to fetch profile
                        const { data: profile, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (profileError || !profile) {
                            // If profile doesn't exist, use session metadata as fallback
                            const role = session.user.user_metadata?.role || 'student';
                            setUser({ 
                                ...session.user, 
                                role: role.toLowerCase(),
                                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                            });
                        } else {
                            // Ensure role is always lowercase and exists
                            const userRole = profile.role ? profile.role.toLowerCase() : (session.user.user_metadata?.role || 'student').toLowerCase();
                            setUser({ 
                                ...session.user, 
                                ...profile, 
                                role: userRole 
                            });
                        }
                        try {
                            initializeSocket();
                        } catch (socketError) {
                            console.warn('Socket init failed (non-critical):', socketError);
                        }
                    } catch (error) {
                        // Fallback to session data if profile fetch fails
                        console.warn('Profile fetch failed, using session metadata:', error);
                        const role = session.user.user_metadata?.role || 'student';
                        setUser({ 
                            ...session.user, 
                            role: role.toLowerCase(),
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                        try {
                            initializeSocket();
                        } catch (socketError) {
                            console.warn('Socket init failed (non-critical):', socketError);
                        }
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        // Add timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                try {
                    // Try to fetch profile
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError || !profile) {
                        // If profile doesn't exist, use session metadata as fallback
                        const role = session.user.user_metadata?.role || 'student';
                        setUser({ 
                            ...session.user, 
                            role: role.toLowerCase(),
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                    } else {
                        // Ensure role is always lowercase and exists
                        const userRole = profile.role ? profile.role.toLowerCase() : (session.user.user_metadata?.role || 'student').toLowerCase();
                        setUser({ 
                            ...session.user, 
                            ...profile, 
                            role: userRole 
                        });
                    }
                    try {
                        initializeSocket();
                    } catch (socketError) {
                        console.warn('Socket init failed (non-critical):', socketError);
                    }
                } catch (error) {
                        // Fallback to session data if profile fetch fails
                        console.warn('Profile fetch failed, using session metadata:', error);
                        const role = session.user.user_metadata?.role || 'student';
                        setUser({ 
                            ...session.user, 
                            role: role.toLowerCase(),
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                        try {
                            initializeSocket();
                        } catch (socketError) {
                            console.warn('Socket init failed (non-critical):', socketError);
                        }
                    }
            } else {
                setUser(null);
                disconnectSocket();
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // User and session handled by onAuthStateChange listener
            return { data, error: null };
        } catch (error) {
            return {
                data: null,
                error: {
                    message: error.message || 'Login failed',
                },
            };
        }
    };

    const signUp = async (email, password, metadata) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata.fullName,
                        role: metadata.role || 'student',
                    }
                }
            });

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            return {
                data: null,
                error: {
                    message: error.message || 'Registration failed',
                },
            };
        }
    };

    const signOut = async () => {
        try {
            disconnectSocket();
            setUser(null);
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
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
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};