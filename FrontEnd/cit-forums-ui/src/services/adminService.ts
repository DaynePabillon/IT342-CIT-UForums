import axiosInstance from './axiosInstance';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

export interface ReportedContent {
    id: number;
    contentType: string;
    contentId: number;
    reason: string;
    status: string;
    reporter: {
        id: number;
        username: string;
    };
    createdAt: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalThreads: number;
    totalReports: number;
    activeReports: number;
    recentReports: ReportedContent[];
    recentUsers: User[];
}

// Check if user has admin role
export const checkAdminStatus = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get('/api/admin/health');
        return response.status === 200;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

// Get dashboard overview
export const getDashboardOverview = async (): Promise<DashboardStats> => {
    try {
        const response = await axiosInstance.get('/api/admin/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        throw error;
    }
};

// Get all users
export const getUsers = async (page: number = 0, size: number = 10): Promise<PagedResponse<User>> => {
    try {
        const response = await axiosInstance.get('/api/admin/users', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Update user role
export const updateUserRole = async (userId: number, role: string): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/users/${userId}/role`, { role });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

// Update user status
export const updateUserStatus = async (userId: number, status: string): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/users/${userId}/status`, { status });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

// Get reported content
export const getReportedContent = async (page: number = 0, size: number = 10): Promise<PagedResponse<ReportedContent>> => {
    try {
        const response = await axiosInstance.get('/api/admin/reports', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching reported content:', error);
        throw error;
    }
};

// Resolve a report
export const resolveReport = async (reportId: number, action: 'resolve' | 'dismiss'): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/reports/${reportId}/${action}`);
    } catch (error) {
        console.error(`Error ${action}ing report:`, error);
        throw error;
    }
};

// Get forum stats
export const getForumStats = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/api/admin/dashboard/forum-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching forum stats:', error);
        return null;
    }
};

// Get user stats
export const getUserStats = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/api/admin/dashboard/user-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
};

// Delete a forum
export const deleteForum = async (forumId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/api/admin/forums/${forumId}`);
    } catch (error) {
        console.error('Error deleting forum:', error);
        throw error;
    }
};

// Update a forum
export const updateForum = async (forumId: number, data: any): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/forums/${forumId}`, data);
    } catch (error) {
        console.error('Error updating forum:', error);
        throw error;
    }
};

// Delete a thread
export const deleteThread = async (threadId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/api/admin/threads/${threadId}`);
    } catch (error) {
        console.error('Error deleting thread:', error);
        throw error;
    }
};

// Update a thread
export const updateThread = async (threadId: number, data: any): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/threads/${threadId}`, data);
    } catch (error) {
        console.error('Error updating thread:', error);
        throw error;
    }
};

// Get thread count
export const getThreadCount = async (): Promise<number> => {
    try {
        const response = await axiosInstance.get('/api/admin/threads-count');
        return response.data.count || 0;
    } catch (error) {
        console.error('Error fetching thread count:', error);
        throw error;
    }
};

// Get all threads
export const getThreads = async (page: number = 0, size: number = 10): Promise<PagedResponse<any>> => {
    try {
        const response = await axiosInstance.get('/api/admin/threads', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
    }
};

// Admin thread operations
export const getThreadById = async (threadId: number): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/api/admin/thread/${threadId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching thread by ID:', error);
        throw error;
    }
};