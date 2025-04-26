import { Warning, IssueWarningRequest } from '../models/Warning';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export const issueWarning = async (request: IssueWarningRequest): Promise<Warning> => {
  try {
    const response = await axiosInstance.post('/api/warnings/issue', request);
    return response.data;
  } catch (error) {
    console.error('Error issuing warning:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const getWarningsForMember = async (memberId: number): Promise<Warning[]> => {
  try {
    const response = await axiosInstance.get(`/api/warnings/member/${memberId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting warnings for member ${memberId}:`, error);
    throw error;
  }
};

export const getAllWarnings = async (): Promise<Warning[]> => {
  try {
    const response = await axiosInstance.get('/api/warnings/all');
    return response.data;
  } catch (error) {
    console.error('Error getting all warnings:', error);
    throw error;
  }
};

export const acknowledgeWarning = async (warningId: number): Promise<Warning> => {
  try {
    const response = await axiosInstance.put(`/api/warnings/${warningId}/acknowledge`);
    return response.data;
  } catch (error) {
    console.error(`Error acknowledging warning ${warningId}:`, error);
    throw error;
  }
};
