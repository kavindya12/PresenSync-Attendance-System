import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { initializeSocket, disconnectSocket } from '../utils/socket.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session (non-blocking)
        let mounted = true;
        
        const getSession = async () => {
            try {
                // Use Promise.race to prevent long waits
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((resolve) => 
                    setTimeout(() => resolve({ data: { session: null } }), 3000)
                );
                
                const { data: { session } } = await Promise.race([
                    sessionPromise,
                    timeoutPromise
                ]);
                
                if (!mounted) return;
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
                            // Also check email for admin users as a fallback
                            const email = session.user.email?.toLowerCase() || '';
                            let metadataRole = session.user.user_metadata?.role || 'student';
                            
                            // Email-based role detection as fallback
                            if (email.includes('admin') || email === 'admin@gmail.com') {
                                metadataRole = 'admin';
                                console.log('AuthContext - getSession - Detected admin from email:', email);
                            }
                            
                            const role = String(metadataRole).toLowerCase().trim();
                            console.log('AuthContext - getSession - No profile found, using metadata role:', role, 'from email:', email);
                            setUser({ 
                                ...session.user, 
                                role: role,
                                fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                            });
                        } else {
                            // Ensure role is always lowercase and exists
                            // Check multiple possible field names for role
                            const profileRole = profile.role || profile.Role || profile.ROLE || profile.user_role;
                            const metadataRole = session.user.user_metadata?.role;
                            const email = session.user.email?.toLowerCase() || '';
                            
                            // Email-based role detection as fallback
                            let userRole = profileRole 
                                ? String(profileRole).toLowerCase().trim() 
                                : (metadataRole ? String(metadataRole).toLowerCase().trim() : 'student');
                            
                            // If role is still 'student' but email suggests admin, override it
                            if ((userRole === 'student' || !userRole) && (email.includes('admin') || email === 'admin@gmail.com')) {
                                userRole = 'admin';
                                console.log('AuthContext - getSession - Overriding role to admin based on email:', email);
                            }
                            
                            console.log('AuthContext - getSession - Profile found:', {
                                profileRole: profileRole,
                                metadataRole: metadataRole,
                                userRole: userRole,
                                email: email,
                                fullProfile: profile
                            });
                            setUser({ 
                                ...session.user, 
                                ...profile, 
                                role: userRole,
                                fullName: profile.full_name || profile.fullName || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                            });
                        }
                        // Initialize socket asynchronously (non-blocking)
                        setTimeout(() => {
                            try {
                                initializeSocket();
                            } catch (socketError) {
                                console.warn('Socket init failed (non-critical):', socketError);
                            }
                        }, 100);
                    } catch (error) {
                        // Fallback to session data if profile fetch fails
                        console.warn('Profile fetch failed, using session metadata:', error);
                        const role = session.user.user_metadata?.role || 'student';
                        setUser({ 
                            ...session.user, 
                            role: role.toLowerCase(),
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                        // Initialize socket asynchronously (non-blocking)
                        setTimeout(() => {
                            try {
                                initializeSocket();
                            } catch (socketError) {
                                console.warn('Socket init failed (non-critical):', socketError);
                            }
                        }, 100);
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        getSession();
        
        return () => {
            mounted = false;
        };

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
                        // Also check email for admin users as a fallback
                        const email = session.user.email?.toLowerCase() || '';
                        let metadataRole = session.user.user_metadata?.role || 'student';
                        
                        // Email-based role detection as fallback
                        if (email.includes('admin') || email === 'admin@gmail.com') {
                            metadataRole = 'admin';
                            console.log('AuthContext - onAuthStateChange - Detected admin from email:', email);
                        }
                        
                        const role = String(metadataRole).toLowerCase().trim();
                        console.log('AuthContext - onAuthStateChange - No profile found, using metadata role:', role, 'from email:', email);
                        setUser({ 
                            ...session.user, 
                            role: role,
                            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                    } else {
                        // Ensure role is always lowercase and exists
                        // Check multiple possible field names for role
                        const profileRole = profile.role || profile.Role || profile.ROLE || profile.user_role;
                        const metadataRole = session.user.user_metadata?.role;
                        const email = session.user.email?.toLowerCase() || '';
                        
                        // Email-based role detection as fallback
                        let userRole = profileRole 
                            ? String(profileRole).toLowerCase().trim() 
                            : (metadataRole ? String(metadataRole).toLowerCase().trim() : 'student');
                        
                        // If role is still 'student' but email suggests admin, override it
                        if ((userRole === 'student' || !userRole) && (email.includes('admin') || email === 'admin@gmail.com')) {
                            userRole = 'admin';
                            console.log('AuthContext - onAuthStateChange - Overriding role to admin based on email:', email);
                        }
                        
                        console.log('AuthContext - onAuthStateChange - Profile found:', {
                            profileRole: profileRole,
                            metadataRole: metadataRole,
                            userRole: userRole,
                            email: email,
                            fullProfile: profile
                        });
                        setUser({ 
                            ...session.user, 
                            ...profile, 
                            role: userRole,
                            fullName: profile.full_name || profile.fullName || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                    }
                    // Initialize socket asynchronously (non-blocking)
                    setTimeout(() => {
                        try {
                            initializeSocket();
                        } catch (socketError) {
                            console.warn('Socket init failed (non-critical):', socketError);
                        }
                    }, 100);
                } catch (error) {
                        // Fallback to session data if profile fetch fails
                        console.warn('Profile fetch failed, using session metadata:', error);
                        const role = session.user.user_metadata?.role || 'student';
                        setUser({ 
                            ...session.user, 
                            role: role.toLowerCase(),
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                        });
                        // Initialize socket asynchronously (non-blocking)
                        setTimeout(() => {
                            try {
                                initializeSocket();
                            } catch (socketError) {
                                console.warn('Socket init failed (non-critical):', socketError);
                            }
                        }, 100);
                    }
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
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};