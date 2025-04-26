import { Report, CreateReportRequest } from '../models/Report';
import { getAuthToken } from './authService';
import { API_BASE_URL } from '../config';

export const createReport = async (report: CreateReportRequest): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        reportedContentType: report.reportedContentType,
        reportedContentId: report.reportedContentId,
        reason: report.reason
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Report creation failed:', errorData || response.statusText);
      throw new Error(errorData?.message || 'Failed to create report');
    }

    return response.json();
  } catch (error) {
    console.error('Error in createReport:', error);
    throw error;
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Fetching reports failed:', errorData || response.statusText);
      throw new Error(errorData?.message || 'Failed to fetch reports');
    }

    return response.json();
  } catch (error) {
    console.error('Error in getReports:', error);
    throw error;
  }
};

export const resolveReport = async (reportId: number, action: string): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/resolve?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Resolving report failed:', errorData || response.statusText);
      throw new Error(errorData?.message || 'Failed to resolve report');
    }

    return response.json();
  } catch (error) {
    console.error('Error in resolveReport:', error);
    throw error;
  }
};

export const dismissReport = async (reportId: number): Promise<Report> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/dismiss`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Dismissing report failed:', errorData || response.statusText);
      throw new Error(errorData?.message || 'Failed to dismiss report');
    }

    return response.json();
  } catch (error) {
    console.error('Error in dismissReport:', error);
    throw error;
  }
};