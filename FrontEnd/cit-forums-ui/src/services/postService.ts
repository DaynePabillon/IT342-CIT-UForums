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
        // Validate content length
        if (!postData.content || postData.content.trim().length < 10) {
            throw new Error('Post content must be at least 10 characters long');
        }

        console.log('Creating post with data:', postData);
        const response = await axiosInstance.post<Post>(`/api/posts/thread/${postData.threadId}`, {
            content: postData.content.trim() // Trim whitespace
        });
        console.log('Post created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw new Error('Session expired - please login again');
            }
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Failed to create post';
            throw new Error(errorMessage);
        }
        // If it's our validation error, throw it directly
        if (error instanceof Error) {
            throw error;
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