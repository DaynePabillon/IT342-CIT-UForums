import { Report, CreateReportRequest } from '../models/Report';
import { getAuthToken } from './authService';
import { API_BASE_URL } from '../config';

export const createReport = async (report: CreateReportRequest): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/reports/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(report)
  });

  if (!response.ok) {
    throw new Error('Failed to create report');
  }

  return response.json();
};

export const getReports = async (): Promise<Report[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard-reports`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }

  return response.json();
};

export const resolveReport = async (reportId: number, action: string): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/resolve?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to resolve report');
  }

  return response.json();
};

export const dismissReport = async (reportId: number): Promise<Report> => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/dismiss`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to dismiss report');
  }

  return response.json();
};