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

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on actual role
        if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
        if (user.role === 'LECTURER') return <Navigate to="/lecturer" replace />;
        if (user.role === 'ADMIN' || user.role === 'DEPT_HEAD') return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
