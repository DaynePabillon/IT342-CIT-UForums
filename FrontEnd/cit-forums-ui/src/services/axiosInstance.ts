import axios from 'axios';

const TOKEN_KEY = 'auth_token';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Create a custom event for unauthorized access
const unauthorizedEvent = new Event('unauthorized');

// Initialize token from localStorage
const token = localStorage.getItem(TOKEN_KEY);
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      headers: { ...config.headers, Authorization: token ? 'Bearer [HIDDEN]' : 'None' }
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Authentication error detected');
      localStorage.removeItem(TOKEN_KEY);
      delete axiosInstance.defaults.headers.common['Authorization'];
      window.dispatchEvent(unauthorizedEvent);
      return Promise.reject(new Error('Authentication required - please login again'));
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error - please check your connection'));
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response);
      return Promise.reject(new Error('Server error - please try again later'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 