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
          const response = await axiosInstance.get('/api/auth/me');
          console.log('Auth check response:', response.data);
          setUser(response.data);
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
    const handleUnauthorized = () => {
      console.log('Unauthorized event received');
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [navigate]);

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
      localStorage.setItem(TOKEN_KEY, token);
      setUser(user);
      console.log('User state after login:', user);
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