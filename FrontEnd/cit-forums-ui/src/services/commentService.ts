import axios from 'axios';

const API_URL = '/api/comments';

export interface Comment {
  id: number;
  content: string;
  threadId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentRequest {
  content: string;
  threadId: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getCommentsByThreadId = async (
  threadId: number,
  page: number = 0,
  size: number = 100
): Promise<Comment[]> => {
  const response = await axios.get(`/api/threads/${threadId}/comments`, {
    params: { page, size },
  });
  return response.data.content;
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