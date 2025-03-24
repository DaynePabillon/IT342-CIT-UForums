import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API:
      // const response = await axios.post('/api/auth/login', credentials);
      // const { token, user } = response.data;
      
      // For demonstration, simulate successful login after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login response
      const token = 'mock-jwt-token';
      const user = {
        id: '1',
        username: credentials.username || 'user1',
        email: credentials.email || 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'CIT student passionate about web development.',
        isAdmin: credentials.username === 'admin' // Make 'admin' username an admin
      };
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to login. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API:
      // const response = await axios.post('/api/auth/register', userData);
      // const { token, user } = response.data;
      
      // For demonstration, simulate successful registration after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration response
      const token = 'mock-jwt-token';
      const user = {
        id: '2',
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: '',
        isAdmin: false
      };
      
      // Store auth data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to register. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset state
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would call your API:
      // const response = await axios.put('/api/users/profile', profileData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      // });
      // const { user } = response.data;
      
      // For demonstration, simulate successful update after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...currentUser, ...profileData };
      
      // Store updated data
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Update state
      setCurrentUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 