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

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;