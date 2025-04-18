import axiosInstance from './axiosInstance';
import { getUserProfile, setUserProfile, removeUserProfile, UserProfile } from './authService';

const API_URL = '/api/members';

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  name: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/me`);
    const user = response.data;
    
    // Always update the stored profile with fresh data from the server
    const userProfile: UserProfile = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: user.roles || []
    };
    
    setUserProfile(userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error fetching current user:', error);
    // If there's an error, clear the profile to force a re-login
    removeUserProfile();
    throw error;
  }
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.put(`${API_URL}/profile`, data);
    const updatedUser = response.data;
    
    // Update the stored profile with the new data
    const userProfile: UserProfile = {
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email || '',
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      roles: updatedUser.roles || []
    };
    
    setUserProfile(userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  await axiosInstance.post(`${API_URL}/change-password`, request);
};

export const getUserThreads = async (page: number = 0, size: number = 50): Promise<any> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/me/threads`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user threads:', error);
    throw error;
  }
};

export const getUserComments = async (page: number = 0, size: number = 50): Promise<any> => {
  try {
    const response = await axiosInstance.get(`${API_URL}/me/comments`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
}; 