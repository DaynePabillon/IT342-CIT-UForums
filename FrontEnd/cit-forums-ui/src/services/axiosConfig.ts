import axios from 'axios';

// Token storage key - use a consistent key across the application
const TOKEN_KEY = 'auth_token';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: 'https://it342-cit-uforums.onrender.com', // Production backend URL
  timeout: 10000, // Set a 10-second timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Request interceptor - adds auth token and handles request config
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full request details
    console.log('Making request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('Successful response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timeout - server is taking too long to respond'));
    }
    
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    // Handle authentication errors
    if (error.response.status === 401) {
      console.warn('Authentication error - redirecting to login');
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication required'));
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response);
      return Promise.reject(new Error('Server error - please try again later'));
    }
    
    // Handle CORS errors
    if (error.message.includes('Network Error')) {
      console.error('Possible CORS error:', error);
      return Promise.reject(new Error('Unable to connect to server - possible CORS issue'));
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 