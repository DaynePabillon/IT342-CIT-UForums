import axios from 'axios';

const API_URL = '/api/auth'; // This will be proxied to http://localhost:8080/api/auth

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
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

// Store the JWT token in localStorage
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Get the JWT token from localStorage
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Remove the JWT token from localStorage
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

export const setUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error setting user profile:', error);
  }
};

export const getUserProfile = (): UserProfile | null => {
  try {
    const profileString = localStorage.getItem('user_profile');
    return profileString ? JSON.parse(profileString) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const removeUserProfile = (): void => {
  try {
    localStorage.removeItem('user_profile');
  } catch (error) {
    console.error('Error removing user profile:', error);
  }
};

// Login a user
export const login = async (credentials: LoginRequest): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const token = response.data.token;
    setAuthToken(token);
    
    // Set user profile from response
    if (response.data.user) {
      console.log('User profile from login:', response.data.user);
      
      // Make sure username is set correctly
      const userProfile: UserProfile = {
        id: response.data.user.id,
        username: response.data.user.name || response.data.user.username || credentials.usernameOrEmail,
        email: response.data.user.email || credentials.usernameOrEmail,
        firstName: response.data.user.firstName || '',
        lastName: response.data.user.lastName || '',
        roles: response.data.user.roles || []
      };
      
      console.log('Setting user profile:', userProfile);
      setUserProfile(userProfile);
    } else {
      console.warn('No user data in login response');
      
      // Create a minimal profile based on login credentials
      const minimalProfile: UserProfile = {
        id: 0,
        username: credentials.usernameOrEmail,
        email: credentials.usernameOrEmail,
        firstName: '',
        lastName: '',
        roles: []
      };
      setUserProfile(minimalProfile);
    }
    
    // Set axios default headers for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

// Register a user
export const register = async (userData: RegisterRequest): Promise<boolean> => {
  try {
    await axios.post(`${API_URL}/register`, userData);
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const logout = (): void => {
  try {
    removeAuthToken();
    removeUserProfile();
    delete axios.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const isAuthenticated = (): boolean => {
  try {
    const token = getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const hasRole = (role: string): boolean => {
  const profile = getUserProfile();
  return profile?.roles?.includes(role) || false;
};

export const isAdmin = (): boolean => {
  return hasRole('ROLE_ADMIN');
};

// Initialize axios with token if it exists
export const initializeAuth = (): void => {
  try {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
};

// Initialize auth on module import
initializeAuth(); 