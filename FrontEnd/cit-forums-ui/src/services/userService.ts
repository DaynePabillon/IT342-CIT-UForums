import axios from 'axios';
import { getUserProfile, setUserProfile, UserProfile } from './authService';

const API_URL = '/api/users';

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  // First try to get from local storage
  const storedProfile = getUserProfile();
  if (storedProfile) return storedProfile;
  
  // If not in storage, fetch from API
  const response = await axios.get(`${API_URL}/me`);
  const user = response.data;
  setUserProfile(user);
  return user;
};

export const updateProfile = async (request: UpdateProfileRequest): Promise<UserProfile> => {
  try {
    console.log('Updating profile with:', request);
    const response = await axios.put(`${API_URL}/me`, request);
    const updatedUser = response.data;
    
    // Update the stored profile
    const currentProfile = getUserProfile();
    if (currentProfile) {
      const mergedProfile = { 
        ...currentProfile, 
        firstName: updatedUser.firstName || currentProfile.firstName,
        lastName: updatedUser.lastName || currentProfile.lastName,
        email: updatedUser.email || currentProfile.email
      };
      console.log('Updated profile:', mergedProfile);
      setUserProfile(mergedProfile);
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
  await axios.post(`${API_URL}/change-password`, request);
};

export const getUserThreads = async (page: number = 0, size: number = 10): Promise<any> => {
  const response = await axios.get(`${API_URL}/threads`, {
    params: { page, size }
  });
  return response.data;
};

export const getUserComments = async (page: number = 0, size: number = 10): Promise<any> => {
  const response = await axios.get(`${API_URL}/comments`, {
    params: { page, size }
  });
  return response.data;
}; 