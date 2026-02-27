import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        // Redirect to correct dashboard
        switch (role) {
            case 'admin': return <Navigate to="/admin/dashboard" replace />;
            case 'doctor': return <Navigate to="/doctor/dashboard" replace />;
            case 'patient': return <Navigate to="/patient/dashboard" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default RoleProtectedRoute;
