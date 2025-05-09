import React, { useState, useEffect } from 'react';
import { Report } from '../models/Report';
import { getReports, resolveReport, dismissReport } from '../services/reportService';
import { getThreadById } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/custom.css';
import '../styles/adminTheme.css';

const AdminReports: React.FC = () => {
  // State Variables
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportedContent, setReportedContent] = useState<any | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { checkAdminStatus } = useAuth();

  // Fetch Reports on Mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Check admin status directly
        if (!checkAdminStatus()) {
          navigate('/admin/login');
          return;
        }
        setLoading(true);
        console.log('Fetching reports...');
        const data = await getReports();
        console.log('Reports fetched:', data);
        setReports(data);
      } catch (err) {
        console.error('Error in fetchReports:', err);
        setError('Failed to fetch reports. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate, checkAdminStatus]);

  // Handle View Report
  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setContentLoading(true);
    setReportedContent(null);

    try {
      if (report.reportedContentType === 'THREAD') {
        const threadData = await getThreadById(report.reportedContentId);
        setReportedContent(threadData);
      } else {
        // Handle comment content if needed
        setReportedContent({ content: 'Comment content will be displayed here' });
      }
    } catch (err) {
      console.error('Error fetching reported content:', err);
      setError('Failed to fetch reported content.');
    } finally {
      setContentLoading(false);
    }
  };

  // Handle Resolve Report
  const handleResolveReport = async (reportId: number) => {
    try {
      await resolveReport(reportId, 'Content removed');
      setReports(reports.filter(report => report.id !== reportId));
      setSelectedReport(null);
      setSuccessMessage('Report resolved successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error resolving report:', err);
      setError('Failed to resolve report.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle Dismiss Report
  const handleDismissReport = async (reportId: number) => {
    try {
      await dismissReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
      setSelectedReport(null);
      setSuccessMessage('Report dismissed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error dismissing report:', err);
      setError('Failed to dismiss report.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle Delete Thread
  const handleDeleteThread = async (threadId: number) => {
    try {
      // Call the API to delete the thread
      await fetch(`/api/admin/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update UI
      setSuccessMessage('Thread deleted successfully.');
      setSelectedReport(null);
      setReportedContent(null);
      
      // Refresh reports list
      const updatedReports = await getReports();
      setReports(updatedReports);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting thread:', err);
      setError('Failed to delete thread.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Reports Management</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="admin-alert-success">
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="admin-alert-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="admin-alert-danger">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="admin-alert-close"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="admin-alert-info">No reports found.</div>
      ) : (
        <div className="admin-content-container">
          <div className="admin-sidebar">
            <div className="admin-card">
              <h2 className="admin-section-title">Reports List</h2>
              <div className="admin-reports-list">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className={`admin-report-item ${
                      selectedReport?.id === report.id ? 'active' : ''
                    }`}
                    onClick={() => handleViewReport(report)}
                  >
                    <div className="admin-report-header">
                      <span className="admin-report-type">
                        {report.reportedContentType} Report
                      </span>
                      <span className="admin-report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="admin-report-info">
                      <span>Reported by: {report.reporterUsername || 'Unknown'}</span>
                      <span>Reason: {report.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-main-content">
            {selectedReport ? (
              <div className="admin-card">
                <h2 className="admin-section-title">Report Details</h2>
                <div className="admin-report-details">
                  <div className="admin-report-info-section">
                    <h3 className="admin-subsection-title">Report Information</h3>
                    <div className="admin-info-grid">
                      <div className="admin-info-row">
                        <span className="admin-info-label">Report ID:</span>
                        <span className="admin-info-value">{selectedReport.id}</span>
                      </div>
                      <div className="admin-info-row">
                        <span className="admin-info-label">Content Type:</span>
                        <span className="admin-info-value">{selectedReport.reportedContentType}</span>
                      </div>
                      <div className="admin-info-row">
                        <span className="admin-info-label">Content ID:</span>
                        <span className="admin-info-value">{selectedReport.reportedContentId}</span>
                      </div>
                      <div className="admin-info-row">
                        <span className="admin-info-label">Reason:</span>
                        <span className="admin-info-value">{selectedReport.reason}</span>
                      </div>
                      <div className="admin-info-row">
                        <span className="admin-info-label">Reported By:</span>
                        <span className="admin-info-value">{selectedReport.reporterUsername || 'Unknown'}</span>
                      </div>
                      <div className="admin-info-row">
                        <span className="admin-info-label">Date:</span>
                        <span className="admin-info-value">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-report-content-section">
                    <h3 className="admin-subsection-title">Reported Content</h3>
                    {contentLoading ? (
                      <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Loading content...</p>
                      </div>
                    ) : reportedContent ? (
                      <div className="admin-reported-content">
                        {selectedReport.reportedContentType === 'THREAD' && (
                          <>
                            <h4 className="admin-content-title">{reportedContent.title}</h4>
                            <div className="admin-content-meta">
                              Posted by: {reportedContent.authorUsername} on{' '}
                              {new Date(reportedContent.createdAt).toLocaleDateString()}
                            </div>
                            <div className="admin-content-body">{reportedContent.content}</div>
                          </>
                        )}
                        {selectedReport.reportedContentType === 'COMMENT' && (
                          <div className="admin-content-body">{reportedContent.content}</div>
                        )}
                      </div>
                    ) : (
                      <p className="admin-no-content">No content available</p>
                    )}
                  </div>

                  <div className="admin-actions-section">
                    {selectedReport.reportedContentType === 'THREAD' && reportedContent && (
                      <button
                        className="admin-btn-danger admin-btn-action"
                        onClick={() => handleDeleteThread(selectedReport.reportedContentId)}
                      >
                        <i className="bi bi-trash"></i> Delete Thread
                      </button>
                    )}
                    <button
                      className="admin-btn-success admin-btn-action"
                      onClick={() => handleResolveReport(selectedReport.id)}
                    >
                      <i className="bi bi-check-circle"></i> Resolve Report
                    </button>
                    <button
                      className="admin-btn-secondary admin-btn-action"
                      onClick={() => handleDismissReport(selectedReport.id)}
                    >
                      <i className="bi bi-x-circle"></i> Dismiss Report
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-card admin-empty-state">
                <div className="admin-empty-message">
                  <i className="bi bi-file-earmark-text admin-empty-icon"></i>
                  <p>Select a report to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;