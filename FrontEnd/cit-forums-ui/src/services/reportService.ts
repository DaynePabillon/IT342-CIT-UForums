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
    console.log('Fetching reports from dashboard endpoint');
    const response = await axiosInstance.get('/api/admin/dashboard-reports');
    console.log('Raw reports response:', response.data);
    
    // Check if the response is paginated (Spring Data format)
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      console.log('Detected paginated response, mapping content');
      
      // Map the backend field names to frontend field names
      return response.data.content.map((item: any) => ({
        id: item.id,
        reporterId: item.reporterId || (item.reporter ? item.reporter.id : null),
        reporterUsername: item.reporterUsername || (item.reporter ? item.reporter.name : 'Unknown'),
        reportedContentType: item.contentType, // Map contentType to reportedContentType
        reportedContentId: item.contentId,     // Map contentId to reportedContentId
        reason: item.reason,
        status: item.status,
        createdAt: item.createdAt,
        resolvedAt: item.resolvedAt,
        resolvedBy: item.resolverId,
        resolvedByUsername: item.resolverUsername,
        actionTaken: item.action,
        // Include the original data for debugging
        _originalData: item
      }));
    }
    
    // If not paginated, assume it's already in the right format
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

export const getReportHistory = async (): Promise<Report[]> => {
  try {
    console.log('Fetching report history');
    const response = await axiosInstance.get('/api/admin/reports/history');
    console.log('Raw report history response:', response.data);
    
    // Check if the response is paginated (Spring Data format)
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      console.log('Detected paginated response, mapping content');
      
      // Map the backend field names to frontend field names
      return response.data.content.map((item: any) => ({
        id: item.id,
        reporterId: item.reporterId || (item.reporter ? item.reporter.id : null),
        reporterUsername: item.reporterUsername || (item.reporter ? item.reporter.name : 'Unknown'),
        reportedContentType: item.contentType, // Map contentType to reportedContentType
        reportedContentId: item.contentId,     // Map contentId to reportedContentId
        reason: item.reason,
        status: item.status,
        createdAt: item.createdAt,
        resolvedAt: item.resolvedAt,
        resolvedBy: item.resolverId,
        resolvedByUsername: item.resolverUsername,
        actionTaken: item.action,
        // Include the original data for debugging
        _originalData: item
      }));
    }
    
    // If not paginated, assume it's already in the right format
    return response.data;
  } catch (error) {
    console.error('Error in getReportHistory:', error);
    if (error instanceof AxiosError && error.response) {
      console.error('Error details:', error.response.data || 'No response data');
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};