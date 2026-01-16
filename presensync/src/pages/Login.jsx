import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/endpoints';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, updateUser, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle OAuth callback
    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            setError('OAuth authentication failed');
        } else if (token && refreshToken) {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            // Fetch user data
            authAPI.getMe().then(response => {
                updateUser(response.data.user);
                redirectByRole(response.data.user.role);
            });
        }
    }, [searchParams, updateUser]);

    // Redirect after successful login when user profile is loaded
    useEffect(() => {
        if (user && user.role) {
            const currentPath = window.location.pathname;
            // Only redirect if we're on login or landing page and not already redirecting
            if ((currentPath === '/login' || currentPath === '/') && !searchParams.get('token')) {
                // Small delay to ensure user state is fully set
                const timer = setTimeout(() => {
                    console.log('Redirecting user with role:', user.role);
                    redirectByRole(user.role);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [user, searchParams]);

    const redirectByRole = (role) => {
        const standardRole = role?.toLowerCase();
        switch (standardRole) {
            case 'student':
                navigate('/student');
                break;
            case 'lecturer':
                navigate('/lecturer');
                break;
            case 'admin':
            case 'dept_head':
                navigate('/admin');
                break;
            default:
                navigate('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error, data } = await signIn(email, password);
            if (error) throw new Error(error.message);
            
            // Don't set loading to false - AuthContext will manage it
            // The onAuthStateChange listener will set the user with role
            // Then the useEffect will handle the redirect
        } catch (err) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        authAPI.googleAuth();
    };

    const handleMicrosoftLogin = () => {
        authAPI.microsoftAuth();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-800 dark:text-teal-400">
                        Sign in to PresenSync
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link to="/signup" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="ml-2">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleMicrosoftLogin}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                                <path fill="#F25022" d="M0 0h11v11H0z" />
                                <path fill="#7FBA00" d="M12 0h11v11H12z" />
                                <path fill="#00A4EF" d="M0 12h11v11H0z" />
                                <path fill="#FFB900" d="M12 12h11v11H12z" />
                            </svg>
                            <span className="ml-2">Microsoft</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
