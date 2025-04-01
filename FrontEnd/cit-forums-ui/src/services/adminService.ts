import axiosInstance from './axiosInstance';
import { Thread } from './threadService';
import { PagedResponse } from './threadService';

export const checkAdminStatus = async (): Promise<boolean> => {
    try {
        const response = await axiosInstance.get('/api/auth/check-admin');
        return response.data;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

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

export const getThreads = async (page: number = 0, size: number = 10): Promise<PagedResponse<Thread & { forumTitle: string }>> => {
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
 