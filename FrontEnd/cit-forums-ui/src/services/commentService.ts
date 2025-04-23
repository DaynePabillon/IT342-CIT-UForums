import axiosInstance from './axiosInstance';
import { PagedResponse } from '../types/common';

const API_URL = '/api/comments';

export interface Comment {
  id: number;
  content: string;
  postId: number;
  parentPostId?: number; // Added to match backend response
  author: {
    id: number;
    name: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt?: string;
  edited?: boolean;
}

export interface CommentRequest {
  content: string;
  threadId: number;
  postId?: number;
}

export const getCommentsByThreadId = async (threadId: number): Promise<Comment[]> => {
  try {
    console.log(`Fetching comments for thread ${threadId}`);
    const response = await axiosInstance.get(`${API_URL}/thread/${threadId}`);
    const data = response.data;
    
    // Handle both array and paged responses
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} comments as array`);
      return data;
    } else if (data && typeof data === 'object' && 'content' in data) {
      console.log(`Received ${data.content.length} comments in paged response`);
      return (data as PagedResponse<Comment>).content;
    }
    
    console.error('Unexpected response format:', data);
    return [];
  } catch (error) {
    console.error(`Error fetching comments for thread ${threadId}:`, error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  try {
    console.log(`Fetching comments for post ${postId}`);
    const response = await axiosInstance.get(`${API_URL}/post/${postId}`);
    const data = response.data;
    
    // Handle both array and paged responses
    if (Array.isArray(data)) {
      console.log(`Received ${data.length} comments as array`);
      return data;
    } else if (data && typeof data === 'object' && 'content' in data) {
      console.log(`Received ${data.content.length} comments in paged response`);
      return (data as PagedResponse<Comment>).content;
    }
    
    console.error('Unexpected response format:', data);
    return [];
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
};

export const getCommentById = async (id: number): Promise<Comment> => {
  try {
    console.log(`Fetching comment ${id}`);
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    console.log('Comment fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    throw error;
  }
};

export const createComment = async (commentRequest: CommentRequest): Promise<Comment> => {
  try {
    const { threadId, postId, content } = commentRequest;
    console.log(`Creating comment for thread ${threadId} and post ${postId || 'not specified'}:`, commentRequest);
    
    // If postId is provided, use it; otherwise, use the threadId endpoint
    const endpoint = postId 
      ? `${API_URL}/post/${postId}?threadId=${threadId}` 
      : `${API_URL}/thread/${threadId}`;
    
    // Include threadId in the request body as required by backend validation
    const response = await axiosInstance.post(endpoint, { content, threadId, postId });
    console.log('Comment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error creating comment:`, error);
    throw error;
  }
};

export const updateComment = async (id: number, commentRequest: CommentRequest): Promise<Comment> => {
  try {
    console.log(`Updating comment ${id}:`, commentRequest);
    const response = await axiosInstance.put(`${API_URL}/${id}`, commentRequest);
    console.log('Comment updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${id}:`, error);
    throw error;
  }
};

export const deleteComment = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting comment ${id}`);
    await axiosInstance.delete(`${API_URL}/${id}`);
    console.log('Comment deleted successfully');
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw error;
  }
};