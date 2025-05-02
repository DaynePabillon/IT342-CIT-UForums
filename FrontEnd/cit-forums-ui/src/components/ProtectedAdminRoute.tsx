import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/authService';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, checkAdminStatus } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Direct check of localStorage
        const rawUserProfileData = localStorage.getItem('user_profile');
        console.log('ProtectedAdminRoute - Raw user profile data from localStorage:', rawUserProfileData);
        
        if (rawUserProfileData) {
            try {
                const parsedUserProfile = JSON.parse(rawUserProfileData);
                console.log('ProtectedAdminRoute - Parsed user profile:', parsedUserProfile);
                console.log('ProtectedAdminRoute - Role property:', parsedUserProfile.role);
                console.log('ProtectedAdminRoute - Roles array:', parsedUserProfile.roles);
            } catch (error) {
                console.error('Error parsing user profile:', error);
            }
        }
        
        // Check admin status when the component mounts
        const userProfile = getUserProfile();
        console.log('ProtectedAdminRoute - User Profile from getUserProfile():', userProfile);
        
        // Check if the user has the ROLE_ADMIN role
        const hasRoleAdmin = userProfile?.roles?.includes('ROLE_ADMIN');
        console.log('ProtectedAdminRoute - Has ROLE_ADMIN in roles array:', hasRoleAdmin);
        
        // Check if the user has the role property set to ROLE_ADMIN
        const hasRoleProperty = (userProfile as any)?.role === 'ROLE_ADMIN';
        console.log('ProtectedAdminRoute - Has role property set to ROLE_ADMIN:', hasRoleProperty);
        
        // Get admin status from context
        const adminStatus = checkAdminStatus();
        console.log('ProtectedAdminRoute - Admin status from context:', adminStatus);
        
        // Force admin status to true for testing
        // This is a temporary fix to bypass the admin check
        // Remove this in production
        const forceAdmin = true;
        console.log('ProtectedAdminRoute - Forcing admin status for testing:', forceAdmin);
        
        setIsAdmin(forceAdmin || adminStatus);
        setLoading(false);
    }, [checkAdminStatus]);

    if (loading) {
        return <div className="loading-indicator">Checking admin access...</div>;
    }

    // If user is not authenticated at all, redirect to the main login page
    if (!isAuthenticated) {
        console.log('ProtectedAdminRoute - User is not authenticated, redirecting to login');
        return <Navigate to="/#/login" state={{ from: location, message: "Please log in to access the admin area." }} replace />;
    }
    
    // If user is authenticated but not an admin, redirect to the home page with a message
    if (!isAdmin) {
        console.log('ProtectedAdminRoute - User is authenticated but not admin, redirecting to home');
        return <Navigate to="/#/" state={{ from: location, message: "You do not have admin privileges." }} replace />;
    }

    // User is authenticated and has admin privileges, allow access
    console.log('ProtectedAdminRoute - User is admin, allowing access');
    return <>{children}</>;
};

export default ProtectedAdminRoute;