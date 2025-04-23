import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';

const TOKEN_KEY = 'auth_token';

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          console.log('Checking auth with token');
          const response = await axiosInstance.get('/api/members/me');
          console.log('Auth check response:', response.data);
          setUser({
            id: response.data.id,
            name: response.data.username || response.data.name,
            email: response.data.email,
            admin: response.data.roles?.includes('ROLE_ADMIN') || false
          });
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Listen for unauthorized events from axiosInstance
    const handleUnauthorized = () => {
      console.log('Unauthorized event received, clearing user state');
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    // Listen for storage events to keep auth state in sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        console.log('Token removed in another tab, clearing user state');
        setUser(null);
      } else if (e.key === 'user_profile') {
        if (e.newValue) {
          try {
            const profile = JSON.parse(e.newValue);
            console.log('User profile updated in another tab:', profile);
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              admin: profile.roles?.includes('ROLE_ADMIN') || false
            });
          } catch (err) {
            console.error('Error parsing user profile from storage event:', err);
          }
        } else {
          console.log('User profile removed in another tab');
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', usernameOrEmail);
      const response = await axiosInstance.post('/api/auth/login', { 
        usernameOrEmail, 
        password 
      });
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      
      if (!token || !user) {
        setError('Invalid response from server');
        return;
      }
      
      localStorage.setItem(TOKEN_KEY, token);
      
      setUser({
        id: user.id,
        name: user.username || user.name,
        email: user.email,
        admin: user.roles?.includes('ROLE_ADMIN') || false
      });
      
      console.log('User state after login:', user);
      
      // Force a page reload to ensure all components have the latest user state
      window.location.reload();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout,
      isAdmin: user?.admin || false 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 