import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { initializeSocket } from '../../utils/socket';

const Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login?error=oauth_failed');
            return;
        }

        if (token && refreshToken) {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            
            // Fetch user data
            authAPI.getMe()
                .then(response => {
                    updateUser(response.data.user);
                    initializeSocket();
                    
                    // Redirect based on role (handle both uppercase and lowercase)
                    const roleStr = String(response.data.user.role || '').toLowerCase().trim();
                    console.log('Callback - Redirecting by role:', roleStr);
                    
                    // Check for admin roles (handle various formats)
                    if (roleStr === 'admin' || roleStr === 'dept_head' || roleStr === 'depthead' || 
                        roleStr === 'administrator' || roleStr === 'dept head') {
                        console.log('Callback - Redirecting admin to /admin');
                        navigate('/admin', { replace: true });
                    } else if (roleStr === 'student') {
                        navigate('/student', { replace: true });
                    } else if (roleStr === 'lecturer' || roleStr === 'teacher') {
                        navigate('/lecturer', { replace: true });
                    } else {
                        console.warn('Callback - Unknown role, redirecting to home');
                        navigate('/', { replace: true });
                    }
                })
                .catch(() => {
                    navigate('/login?error=auth_failed');
                });
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, updateUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default Callback;

