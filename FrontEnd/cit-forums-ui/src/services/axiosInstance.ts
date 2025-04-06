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
        // Get the admin token first, if not found, get the regular token
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        
        // If token exists, add it to headers
        if (token) {
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
                // Clear tokens
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
                
                // Remove Authorization header
                delete axiosInstance.defaults.headers.common['Authorization'];
                
                // Dispatch unauthorized event
                window.dispatchEvent(unauthorizedEvent);
                
                // Redirect to appropriate login page
                const isAdminPath = window.location.pathname.startsWith('/admin');
                if (isAdminPath && !window.location.pathname.includes('/admin/login')) {
                    window.location.href = '/admin/login';
                } else if (!isAdminPath && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            // Handle 403 Forbidden
            else if (error.response.status === 403) {
                // Only redirect if trying to access admin routes without admin privileges
                const isAdminPath = window.location.pathname.startsWith('/admin');
                if (isAdminPath) {
                    console.error('Access forbidden: User does not have admin privileges');
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 