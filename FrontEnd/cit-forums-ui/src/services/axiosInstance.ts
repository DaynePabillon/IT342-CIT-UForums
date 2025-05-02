import axios from 'axios';

// Create a custom event for unauthorized access
const unauthorizedEvent = new Event('unauthorized');

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: 'https://it342-cit-uforums.onrender.com',
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
        const token = localStorage.getItem('token');
        
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
                localStorage.removeItem('token');
                
                // Remove Authorization header
                delete axiosInstance.defaults.headers.common['Authorization'];
                
                // Dispatch unauthorized event
                window.dispatchEvent(new Event('unauthorized'));
                
                // Only redirect to login page if not already on login or register page
                const currentPath = window.location.pathname + window.location.hash;
                if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                    console.log('Redirecting to login page');
                    window.location.href = '/#/login';
                } else {
                    console.log('Already on login/register page, not redirecting');
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