import { Report, CreateReportRequest } from '../models/Report';
import { getAuthToken } from './authService';
import { API_BASE_URL } from '../config';
import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';

export const createReport = async (report: CreateReportRequest): Promise<Report> => {
  try {
    // Log the request for debugging
    console.log('Creating report with data:', report);
    
    // Map the frontend field names to the backend field names
    const response = await axiosInstance.post('/api/reports/new', {
      contentType: report.reportedContentType,  // Changed from reportedContentType to contentType
      contentId: report.reportedContentId,      // Changed from reportedContentId to contentId
      reason: report.reason
    });

    // Log the response status for debugging
    console.log('Report creation response status:', response.status);
    console.log('Report creation response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in createReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
    }
    throw error;
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    // Log the request for debugging
    console.log('Fetching reports from:', `${API_BASE_URL}/api/admin/dashboard-reports`);
    
    // Use axiosInstance for consistent error handling
    const response = await axiosInstance.get('/api/admin/dashboard-reports');
    
    // Log the response for debugging
    console.log('Reports response:', response.data);
    
    // Handle paginated response
    return response.data.content || response.data;
  } catch (error) {
    console.error('Error in getReports:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
    }
    throw error;
  }
};

export const resolveReport = async (reportId: number, action: string): Promise<Report> => {
  try {
    // Log the request for debugging
    console.log(`Resolving report ${reportId} with action ${action}`);
    
    // Use axiosInstance for consistent error handling
    const response = await axiosInstance.put(`/api/admin/reports/${reportId}/${action}`);
    
    // Log the response for debugging
    console.log('Resolve report response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in resolveReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
    }
    throw error;
  }
};

export const dismissReport = async (reportId: number): Promise<Report> => {
  try {
    // Log the request for debugging
    console.log(`Dismissing report ${reportId}`);
    
    // Use axiosInstance for consistent error handling
    const response = await axiosInstance.put(`/api/admin/reports/${reportId}/dismiss`);
    
    // Log the response for debugging
    console.log('Dismiss report response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error in dismissReport:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
    }
    throw error;
  }
};