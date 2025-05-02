import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, checkAdminStatus } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check admin status when the component mounts
        const adminStatus = checkAdminStatus();
        setIsAdmin(adminStatus);
        setLoading(false);
    }, [checkAdminStatus]);

    if (loading) {
        return <div className="loading-indicator">Checking admin access...</div>;
    }

    // If user is not authenticated at all, redirect to the main login page
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location, message: "Please log in to access the admin area." }} replace />;
    }
    
    // If user is authenticated but not an admin, redirect to the home page with a message
    if (!isAdmin) {
        return <Navigate to="/" state={{ from: location, message: "You do not have admin privileges." }} replace />;
    }

    // User is authenticated and has admin privileges, allow access
    return <>{children}</>;
};

export default ProtectedAdminRoute;