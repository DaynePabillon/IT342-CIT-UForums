import { Warning, CreateWarningRequest } from '../models/Warning';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export const createWarning = async (request: CreateWarningRequest): Promise<Warning> => {
  try {
    console.log('Creating warning with data:', request);
    const response = await axiosInstance.post('/api/admin/warnings/create', request);
    return response.data;
  } catch (error) {
    console.error('Error in createWarning:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const getAllWarnings = async (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc') => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/warnings?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in getAllWarnings:', error);
    throw error;
  }
};

export const getWarningsForMember = async (memberId: number, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/warnings/member/${memberId}?page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error('Error in getWarningsForMember:', error);
    throw error;
  }
};

export const getWarningById = async (warningId: number): Promise<Warning> => {
  try {
    const response = await axiosInstance.get(`/api/admin/warnings/${warningId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getWarningById:', error);
    throw error;
  }
};

export const banMember = async (memberId: number, reason: string): Promise<void> => {
  try {
    await axiosInstance.post(`/api/admin/warnings/ban/${memberId}?reason=${encodeURIComponent(reason)}`);
  } catch (error) {
    console.error('Error in banMember:', error);
    throw error;
  }
};

export const unbanMember = async (memberId: number): Promise<void> => {
  try {
    await axiosInstance.post(`/api/admin/warnings/unban/${memberId}`);
  } catch (error) {
    console.error('Error in unbanMember:', error);
    throw error;
  }
};
