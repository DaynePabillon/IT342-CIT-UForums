import axios from 'axios';
import axiosInstance from './axiosInstance';

export interface Post {
    id: number;
    content: string;
    threadId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
    username?: string;
}

export interface CreatePostRequest {
    content: string;
    threadId: number;
}

export const createPost = async (postData: CreatePostRequest): Promise<Post> => {
    try {
        const response = await axiosInstance.post<Post>('/api/posts', postData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create post');
        }
        throw new Error('Failed to create post');
    }
};

export const getPostById = async (postId: number): Promise<Post> => {
    try {
        const response = await axiosInstance.get<Post>(`/api/posts/${postId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch post');
        }
        throw new Error('Failed to fetch post');
    }
};

export const updatePost = async (postId: number, content: string): Promise<Post> => {
    try {
        const response = await axiosInstance.put<Post>(`/api/posts/${postId}`, { content });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update post');
        }
        throw new Error('Failed to update post');
    }
};

export const deletePost = async (postId: number): Promise<void> => {
    try {
        await axiosInstance.delete(`/api/posts/${postId}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete post');
        }
        throw new Error('Failed to delete post');
    }
}; 