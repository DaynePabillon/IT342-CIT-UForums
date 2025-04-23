import axios from 'axios';

// Create a custom event for unauthorized access
const unauthorizedEvent = new Event('unauthorized');

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Clear any previous token first to avoid mixing tokens
        delete config.headers.Authorization;
        
        // Get the token from localStorage
        const token = localStorage.getItem('auth_token');
        
        // If token exists, add it to headers
        if (token) {
            console.log('Adding auth token to request');
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                console.log('Received 401 Unauthorized response, clearing auth data');
                // Clear tokens
                localStorage.removeItem('auth_token');
                
                // Remove Authorization header
                delete axiosInstance.defaults.headers.common['Authorization'];
                
                // Dispatch unauthorized event
                window.dispatchEvent(new Event('unauthorized'));
                
                // Redirect to login page if not already there
                if (!window.location.pathname.includes('/login')) {
                    console.log('Redirecting to login page');
                    window.location.href = '/login';
                }
            }
            // Handle 403 Forbidden
            else if (error.response.status === 403) {
                console.error('Access forbidden: Insufficient privileges');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 