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
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch profile data from our public.profiles table
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, ...profile });
                initializeSocket();
            }
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, ...profile });
                initializeSocket();
            } else {
                setUser(null);
                disconnectSocket();
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
