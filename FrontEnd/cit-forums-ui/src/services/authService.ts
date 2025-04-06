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
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
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
        name: response.data.user.name || credentials.usernameOrEmail,
        email: response.data.user.email || credentials.usernameOrEmail,
        firstName: response.data.user.firstName || '',
        lastName: response.data.user.lastName || '',
        roles: response.data.user.roles || []
      };
      
      console.log('Setting user profile:', userProfile);
      setUserProfile(userProfile);
    } else {
      console.warn('No user data in login response');
      
      const minimalProfile: UserProfile = {
        id: 0,
        name: credentials.usernameOrEmail,
        email: credentials.usernameOrEmail,
        firstName: '',
        lastName: '',
        roles: []
      };
      setUserProfile(minimalProfile);
    }
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
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

export const logout = (): void => {
  removeAuthToken();
  removeUserProfile();
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