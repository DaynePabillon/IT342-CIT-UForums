import { Report, CreateReportRequest } from '../models/Report';
import { getAuthToken } from './authService';
import { API_BASE_URL } from '../config';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export const createReport = async (report: CreateReportRequest): Promise<Report> => {
  try {
    // Log the request for debugging
    console.log('Creating report with data:', report);
    
    // Send the exact field names that the backend expects
    const response = await axiosInstance.post('/api/reports/new', {
      reason: report.reason,
      contentType: report.reportedContentType,
      contentId: report.reportedContentId
    });

    // Log the response status for debugging
    console.log('Report creation response status:', response.status);
    console.log('Report creation response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in createReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    throw error;
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const response = await axiosInstance.get('/api/admin/dashboard-reports');
    return response.data;
  } catch (error) {
    console.error('Error in getReports:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const resolveReport = async (reportId: number, action: string): Promise<Report> => {
  try {
    const response = await axiosInstance.put(`/api/reports/${reportId}/resolve?action=${action}`);
    return response.data;
  } catch (error) {
    console.error('Error in resolveReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

export const dismissReport = async (reportId: number): Promise<Report> => {
  try {
    const response = await axiosInstance.put(`/api/reports/${reportId}/dismiss`);
    return response.data;
  } catch (error) {
    console.error('Error in dismissReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};