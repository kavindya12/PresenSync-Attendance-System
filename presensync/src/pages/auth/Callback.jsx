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
                    
                    // Redirect based on role
                    const role = response.data.user.role;
                    switch (role) {
                        case 'STUDENT':
                            navigate('/student');
                            break;
                        case 'LECTURER':
                            navigate('/lecturer');
                            break;
                        case 'ADMIN':
                        case 'DEPT_HEAD':
                            navigate('/admin');
                            break;
                        default:
                            navigate('/');
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

