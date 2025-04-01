import axios from 'axios';

const API_URL = '/api/comments';

export interface Comment {
  id: number;
  content: string;
  postId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
  postId: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
  const response = await axios.get(`${API_URL}/post/${postId}`);
  const data = response.data;
  
  // Handle both array and paged responses
  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === 'object' && 'content' in data) {
    return (data as PagedResponse<Comment>).content;
  }
  
  console.error('Unexpected response format:', data);
  return [];
};

export const getCommentById = async (id: number): Promise<Comment> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createComment = async (commentRequest: CommentRequest): Promise<Comment> => {
  const response = await axios.post(API_URL, commentRequest);
  return response.data;
};

export const updateComment = async (id: number, commentRequest: CommentRequest): Promise<Comment> => {
  const response = await axios.put(`${API_URL}/${id}`, commentRequest);
  return response.data;
};

export const deleteComment = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
}; 