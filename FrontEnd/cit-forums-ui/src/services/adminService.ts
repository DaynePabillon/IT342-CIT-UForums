import axiosInstance from './axiosInstance';
import { Thread } from './threadService';
import { PagedResponse } from '../types/common';

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
    type: string;
    contentId: number;
    reason: string;
    status: string;
    reportedBy: User;
    createdAt: string;
}

export const checkAdminStatus = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get('/api/auth/check-admin');
        return response.data.success;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

// User Management
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

export const updateUserRole = async (userId: number, role: string): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/users/${userId}/role`, { role });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

export const updateUserStatus = async (userId: number, status: string): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/users/${userId}/status`, { status });
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

// Content Management
export const deleteThread = async (threadId: number): Promise<void> => {
    await axiosInstance.delete(`/api/threads/${threadId}`);
};

export const deleteForum = async (forumId: number): Promise<void> => {
    await axiosInstance.delete(`/api/forums/${forumId}`);
};

export const updateThread = async (threadId: number, data: any): Promise<void> => {
    await axiosInstance.put(`/api/threads/${threadId}`, data);
};

export const updateForum = async (forumId: number, data: any): Promise<void> => {
    await axiosInstance.put(`/api/forums/${forumId}`, data);
};

export const getThreads = async (page: number = 0, size: number = 10): Promise<PagedResponse<any>> => {
    try {
        const response = await axiosInstance.get('/api/admin/threads', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all threads:', error);
        throw error;
    }
};

// Moderation
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

export const resolveReport = async (reportId: number, action: 'resolve' | 'dismiss'): Promise<void> => {
    try {
        await axiosInstance.put(`/api/admin/reports/${reportId}`, { action });
    } catch (error) {
        console.error('Error resolving report:', error);
        throw error;
    }
};

// Analytics
export const getForumStats = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/api/admin/stats/forums');
        return response.data;
    } catch (error) {
        console.error('Error fetching forum stats:', error);
        throw error;
    }
};

export const getUserStats = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/api/admin/stats/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
}; 
 