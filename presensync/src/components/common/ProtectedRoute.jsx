import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // Check loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    // Normal authentication flow
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check email as fallback for admin detection
    const email = user.email?.toLowerCase() || '';
    let userRole = String(user.role || '').toLowerCase().trim();
    
    // If no role or role is student, but email is admin, force admin role
    if ((!userRole || userRole === 'student') && (email.includes('admin') || email === 'admin@gmail.com')) {
        userRole = 'admin';
        console.log('ProtectedRoute - Forcing admin role based on email:', email);
    }
    
    const normalizedAllowedRoles = allowedRoles?.map(r => String(r || '').toLowerCase().trim());

    console.log('ProtectedRoute - User role:', userRole, 'Email:', email, 'Allowed roles:', normalizedAllowedRoles);

    // Check if user has access to this route
    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        console.log('ProtectedRoute - Access denied, redirecting based on role:', userRole);
        // User doesn't have access - redirect to their appropriate dashboard based on their actual role
        if (userRole === 'student') {
            return <Navigate to="/student" replace />;
        }
        if (userRole === 'lecturer' || userRole === 'teacher') {
            return <Navigate to="/lecturer" replace />;
        }
        if (userRole === 'admin' || userRole === 'dept_head' || userRole === 'depthead' || 
            userRole === 'administrator' || userRole === 'dept head') {
            console.log('ProtectedRoute - Redirecting admin user to /admin');
            return <Navigate to="/admin" replace />;
        }
        // Unknown role - go to landing page
        console.warn('ProtectedRoute - Unknown role, redirecting to home');
        return <Navigate to="/" replace />;
    }

    // User has correct role for this route - allow access

    // User has access - allow them to view the dashboard
    return children;
};

export default ProtectedRoute;
