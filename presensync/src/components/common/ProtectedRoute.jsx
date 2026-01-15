import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());

    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        // Redirect based on actual role
        if (userRole === 'student') return <Navigate to="/student" replace />;
        if (userRole === 'lecturer') return <Navigate to="/lecturer" replace />;
        if (userRole === 'admin' || userRole === 'dept_head') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
