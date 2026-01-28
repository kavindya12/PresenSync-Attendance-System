import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect authenticated users to their dashboard
    useEffect(() => {
        if (!loading && user && user.role) {
            const role = String(user.role).toLowerCase().trim();
            console.log('Landing useEffect: redirecting user with role:', role);
            
            switch (role) {
                case 'student':
                    console.log('Landing: Redirecting to /student');
                    navigate('/student', { replace: true });
                    break;
                case 'lecturer':
                    console.log('Landing: Redirecting to /lecturer');
                    navigate('/lecturer', { replace: true });
                    break;
                case 'admin':
                case 'dept_head':
                    console.log('Landing: Redirecting to /admin');
                    navigate('/admin', { replace: true });
                    break;
                default:
                    console.log('Landing: Unknown role, staying on landing');
                    break;
            }
        }
    }, [user, loading, navigate]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    // Don't show landing page if user is authenticated
    if (user && user.role) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex flex-col items-center justify-center">
            <div className="text-center p-8">
                <h1 className="text-5xl font-bold mb-6 text-teal-800">
                    Presen<span className="text-orange-600">Sync</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Seamless attendance tracking with QR codes, real-time updates for students, lecturers, and administrators.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-lg font-semibold"
                    >
                        Get Started
                    </Link>
                    <a
                        href="#features"
                        className="px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold border border-teal-100"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Landing;
