
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-teal-600">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect based on actual role
        if (profile.role === 'student') return <Navigate to="/student/dashboard" replace />;
        if (profile.role === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
        if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
