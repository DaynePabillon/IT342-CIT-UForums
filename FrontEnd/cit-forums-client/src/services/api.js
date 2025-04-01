import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Forums API calls
export const forumsApi = {
  getAllForums: () => api.get('/forums'),
  getForumById: (forumId) => api.get(`/forums/${forumId}`),
  createForum: (forumData) => api.post('/forums', forumData),
  updateForum: (forumId, forumData) => api.put(`/forums/${forumId}`, forumData),
  deleteForum: (forumId) => api.delete(`/forums/${forumId}`),
};

// Threads API calls
export const threadsApi = {
  getThreadsByForumId: (forumId) => api.get(`/forums/${forumId}/threads`),
  getThreadById: (threadId) => api.get(`/threads/${threadId}`),
  createThread: (forumId, threadData) => api.post(`/forums/${forumId}/threads`, threadData),
  updateThread: (threadId, threadData) => api.put(`/threads/${threadId}`, threadData),
  deleteThread: (threadId) => api.delete(`/threads/${threadId}`),
};

// Posts API calls
export const postsApi = {
  getPostsByThreadId: (threadId) => api.get(`/threads/${threadId}/posts`),
  createPost: (threadId, postData) => api.post(`/threads/${threadId}/posts`, postData),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

// User API calls
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserThreads: () => api.get('/users/threads'),
  getUserPosts: () => api.get('/users/posts'),
};

export default api; 