import axiosInstance from './axiosInstance';
import { PagedResponse } from '../types/common';

const API_URL = '/api/forums';

export interface Forum {
  id: number;
  title: string;
  description: string;
  active: boolean;
  threadCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
}

export enum ForumCategory {
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  EVENTS = 'EVENTS',
  FREEDOM_WALL = 'FREEDOM_WALL',
  CONFESSION = 'CONFESSION',
  ACADEMIC = 'ACADEMIC',
  GENERAL = 'GENERAL',
  TECHNOLOGY = 'TECHNOLOGY',
  SPORTS = 'SPORTS',
  ENTERTAINMENT = 'ENTERTAINMENT'
}

export interface ForumRequest {
  title: string;
  description: string;
  categoryName: string;
}

// Get all forums with pagination
export const getForums = async (
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Forum>> => {
  try {
    console.log(`Fetching forums: page=${page}, size=${size}`);
    const response = await axiosInstance.get(API_URL, {
      params: { page, size },
    });
    console.log('Forums fetch response:', response);
    console.log('Forums fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching forums:', error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Server response error:', error.response.data);
      console.error('Status:', error.response.status);
      
      if (error.response.status === 401) {
        throw new Error('Authentication required to access forums');
      } else {
        throw new Error(error.response.data.message || 'Failed to load forums from server');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      throw error;
    }
  }
};

// Get all active forums
export const getActiveForums = async (): Promise<Forum[]> => {
  const response = await axiosInstance.get(`${API_URL}/active`);
  return response.data;
};

// Get a forum by ID
export const getForumById = async (id: number): Promise<Forum> => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a forum
export const createForum = async (forumRequest: ForumRequest): Promise<Forum> => {
  try {
    console.log('Creating forum with data:', forumRequest);
    
    // Make sure we have a categoryName
    if (!forumRequest.categoryName) {
      forumRequest.categoryName = 'GENERAL'; // Default category
      console.log('Using default category GENERAL');
    }
    
    const TOKEN_KEY = 'auth_token'; // Use the same key as in axiosConfig.ts
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Current auth token:', token ? 'Present' : 'Missing');
    
    const response = await axiosInstance.post(API_URL, forumRequest);
    console.log('Forum creation response:', response);
    console.log('Forum created successfully:', response.data);
    
    // Refresh the forums list after creation
    const forums = await getActiveForums();
    console.log('Refreshed forums list:', forums);
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating forum:', error);
    console.error('Error details:', {
      response: error.response?.data,
      status: error.response?.status,
      message: error.message,
      headers: error.response?.headers
    });
    
    if (error.response && error.response.status === 403) {
      throw new Error('You do not have permission to create forums');
    } else if (error.response && error.response.status === 401) {
      throw new Error('Authentication required - please log in again');
    } else {
      throw error;
    }
  }
};

// Update a forum
export const updateForum = async (id: number, forumRequest: ForumRequest): Promise<Forum> => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, forumRequest);
  return response.data;
};

// Delete a forum
export const deleteForum = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};

// Toggle forum status (admin only)
export const toggleForumStatus = async (id: number): Promise<Forum> => {
  const response = await axiosInstance.patch(`${API_URL}/${id}/toggle-status`);
  return response.data;
};

// Search forums
export const searchForums = async (
  query: string,
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Forum>> => {
  const response = await axiosInstance.get(`${API_URL}/search`, {
    params: { query, page, size },
  });
  return response.data;
};

export const cleanupGeneralForums = async (): Promise<string> => {
  try {
    const response = await axiosInstance.post('/api/forums/cleanup-general');
    return response.data;
  } catch (error: any) {
    console.error('Error cleaning up general forums:', error);
    throw error;
  }
}; 