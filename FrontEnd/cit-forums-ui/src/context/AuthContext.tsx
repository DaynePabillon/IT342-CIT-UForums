import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken, getUserProfile } from '../services/authService';
import axiosInstance from '../services/axiosInstance';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
  checkAdminStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const adminToken = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      // Check if there's an admin token and it matches the auth token
      if (adminToken && adminToken === token) {
        setIsAdmin(true);
        // Ensure axios is using the admin token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      } else {
        // Check if the user has admin role
        const userProfile = getUserProfile();
        if (userProfile?.roles?.includes('ROLE_ADMIN')) {
          setIsAdmin(true);
          localStorage.setItem('adminToken', token);
        }
      }
    }
  }, []);

  const login = (token: string, isAdmin: boolean) => {
    if (isAdmin) {
      // For admin login, store both admin token and regular token
      localStorage.setItem('adminToken', token);
      setAuthToken(token);
    } else {
      // For regular login, only store regular token
      setAuthToken(token);
    }
    
    setIsAuthenticated(true);
    setIsAdmin(isAdmin);
    
    // Update axios headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setIsAdmin(false);
    // Remove axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const checkAdminStatus = (): boolean => {
    const userProfile = getUserProfile();
    const hasAdminRole = userProfile?.roles?.includes('ROLE_ADMIN') || false;
    const adminToken = localStorage.getItem('adminToken');
    
    return hasAdminRole || !!adminToken;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, checkAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;