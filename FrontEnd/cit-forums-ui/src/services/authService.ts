import axiosInstance from './axiosInstance';

const API_URL = '/api/auth'; // This will be proxied to http://localhost:8080/api/auth
const TOKEN_KEY = 'auth_token'; // Use the same key as in axiosConfig.ts

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studentNumber?: string;
  city?: string;
  province?: string;
  address?: string;
  bio?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studentNumber?: string;
  city?: string;
  province?: string;
  address?: string;
  bio?: string;
  roles: string[];
}

// Store the JWT token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  // Update axios instance headers
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Get the JWT token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove the JWT token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  // Remove from axios instance headers
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export const setUserProfile = (profile: UserProfile): void => {
  if (!profile) {
    removeUserProfile();
    return;
  }
  localStorage.setItem('user_profile', JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile | null => {
  const profile = localStorage.getItem('user_profile');
  return profile ? JSON.parse(profile) : null;
};

export const removeUserProfile = (): void => {
  localStorage.removeItem('user_profile');
};

// Login a user
export const login = async (credentials: LoginRequest): Promise<boolean> => {
  try {
    // Clear any existing auth data first
    removeAuthToken();
    removeUserProfile();
    
    // Clear browser session storage and any other cached data
    sessionStorage.clear();
    
    const response = await axiosInstance.post(`${API_URL}/login`, credentials);
    const token = response.data.token;
    console.log('Login successful, received token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('No token received in login response');
      return false;
    }
    
    setAuthToken(token);
    
    // Set user profile from response
    if (response.data.user) {
      console.log('User profile from login:', response.data.user);
      
      const userProfile: UserProfile = {
        id: response.data.user.id,
        name: response.data.user.name || response.data.user.username || credentials.usernameOrEmail,
        email: response.data.user.email || credentials.usernameOrEmail,
        firstName: response.data.user.firstName || '',
        lastName: response.data.user.lastName || '',
        phoneNumber: response.data.user.phoneNumber || '',
        studentNumber: response.data.user.studentNumber || '',
        city: response.data.user.city || '',
        province: response.data.user.province || '',
        address: response.data.user.address || '',
        bio: response.data.user.bio || '',
        roles: response.data.user.roles || []
      };
      
      console.log('Setting user profile:', userProfile);
      setUserProfile(userProfile);
      
      // On successful login, return true without forcing page reload
      return true;
    } else {
      console.warn('No user data in login response');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    // Clear any partial auth data on error
    removeAuthToken();
    removeUserProfile();
    return false;
  }
};

// Register a user
export const register = async (userData: RegisterRequest): Promise<boolean> => {
  try {
    await axiosInstance.post(`${API_URL}/register`, userData);
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

// Redirect to login page if not authenticated
export const redirectToLogin = () => {
  window.location.href = '/#/login';
};

// Redirect to home page
export const redirectToHome = () => {
  window.location.href = '/#/';
};

export const logout = (): void => {
  console.log('Logging out user');
  
  // Clear all authentication tokens
  removeAuthToken();
  removeUserProfile();
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('user_profile');
  
  // Clear any session storage data
  sessionStorage.clear();
  
  // Clear any axios cached headers
  delete axiosInstance.defaults.headers.common['Authorization'];
  
  console.log('All authentication data cleared');
  
  // Redirect to login page
  window.location.href = '/#/login';
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

export const hasRole = (role: string): boolean => {
  const profile = getUserProfile();
  return profile?.roles?.includes(role) || false;
};

export const isAdmin = (): boolean => {
  return hasRole('ROLE_ADMIN');
};

// Initialize auth on module import
const token = getAuthToken();
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} 