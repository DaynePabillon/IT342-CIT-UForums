import axiosInstance from './axiosConfig';

const API_URL = '/api/threads';

export interface Thread {
  id: number;
  title: string;
  content: string;
  forumId: number;
  commentCount: number;
  createdBy: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ThreadRequest {
  title: string;
  content: string;
  forumId: number;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getThreadsByForumId = async (
  forumId: number,
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Thread>> => {
  try {
    console.log(`Fetching threads for forum ${forumId}: page=${page}, size=${size}`);
    const response = await axiosInstance.get(`/api/threads/forum/${forumId}`, {
      params: { page, size },
    });
    console.log(`Threads for forum ${forumId} fetched successfully:`, response.status);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching threads for forum ${forumId}:`, error);
    throw error; // Let the axios interceptor handle this
  }
};

export const getThreadById = async (id: number): Promise<Thread> => {
  try {
    console.log(`Fetching thread ${id}`);
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    console.log(`Thread ${id} fetched successfully`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching thread ${id}:`, error);
    throw error; // Let the axios interceptor handle this
  }
};

export const createThread = async (threadRequest: ThreadRequest): Promise<Thread> => {
  try {
    console.log('Creating thread with data:', threadRequest);
    
    // Validate forumId is a valid number
    if (threadRequest.forumId === undefined || threadRequest.forumId === null) {
      throw new Error('Forum ID is missing');
    }
    
    // Convert to number if it's a string and validate
    const forumId = Number(threadRequest.forumId);
    if (isNaN(forumId) || forumId <= 0) {
      throw new Error(`Invalid forum ID: ${threadRequest.forumId}`);
    }
    
    // Use the correct endpoint with forumId in the URL and include it in the request body
    console.log(`Sending request to /api/threads/forum/${forumId}`);
    const response = await axiosInstance.post(`/api/threads/forum/${forumId}`, {
      title: threadRequest.title,
      content: threadRequest.content,
      forumId: forumId
    });
    
    console.log('Thread created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating thread:', error);
    
    // Enhanced error message based on type of error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server response error:', error.response.data);
      console.error('Status:', error.response.status);
      
      if (error.response.status === 404) {
        throw new Error(`Forum with ID ${threadRequest.forumId} not found`);
      } else if (error.response.status === 400) {
        throw new Error(`Bad request: ${error.response.data.message || 'Invalid thread data'}`);
      } else if (error.response.status === 401) {
        throw new Error('You must be logged in to create a thread');
      } else {
        throw new Error(`Server error: ${error.response.data.message || 'Failed to create thread'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
};

export const updateThread = async (id: number, threadRequest: ThreadRequest): Promise<Thread> => {
  try {
    console.log(`Updating thread ${id}`);
    const response = await axiosInstance.put(`${API_URL}/${id}`, threadRequest);
    console.log(`Thread ${id} updated successfully`);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating thread ${id}:`, error);
    throw error; // Let the axios interceptor handle this
  }
};

export const deleteThread = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting thread ${id}`);
    await axiosInstance.delete(`${API_URL}/${id}`);
    console.log(`Thread ${id} deleted successfully`);
  } catch (error: any) {
    console.error(`Error deleting thread ${id}:`, error);
    throw error; // Let the axios interceptor handle this
  }
};

export const searchThreads = async (
  query: string,
  page: number = 0,
  size: number = 10
): Promise<PagedResponse<Thread>> => {
  try {
    console.log(`Searching threads with query "${query}": page=${page}, size=${size}`);
    const response = await axiosInstance.get(`${API_URL}/search`, {
      params: { query, page, size },
    });
    console.log(`Thread search completed successfully`);
    return response.data;
  } catch (error: any) {
    console.error(`Error searching threads:`, error);
    throw error; // Let the axios interceptor handle this
  }
};