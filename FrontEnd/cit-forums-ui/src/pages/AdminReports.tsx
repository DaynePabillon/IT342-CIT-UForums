import React, { useState, useEffect } from 'react';
import { Report } from '../models/Report';
import { getReports, resolveReport, dismissReport } from '../services/reportService';
import { getThreadById, updateUserStatus } from '../services/adminService';
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
  const [showBanConfirmation, setShowBanConfirmation] = useState(false);
  const [userToBan, setUserToBan] = useState<{id: number, username: string} | null>(null);
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
        const data = await getReports();
        setReports(data);
      } catch (err) {
        setError('Failed to fetch reports');
        console.error(err);
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
        // Use the admin-specific endpoint to get thread details
        const threadData = await getThreadById(report.reportedContentId);
        if (threadData) {
          setReportedContent(threadData);
        } else {
          // Handle case where thread might have been deleted
          setReportedContent({
            id: report.reportedContentId,
            title: 'Thread not found or deleted',
            content: 'This thread may have been deleted or is no longer available.'
          });
        }
      } else if (report.reportedContentType === 'COMMENT') {
        // TODO: Implement comment retrieval
        setReportedContent({
          id: report.reportedContentId,
          content: 'Comment content will be displayed here.'
        });
      }
    } catch (err) {
      console.error('Error fetching reported content:', err);
      setReportedContent({
        error: true,
        message: 'Failed to load reported content.'
      });
    } finally {
      setContentLoading(false);
    }
  };

  // Handle Resolve Report
  const handleResolveReport = async (reportId: number) => {
    try {
      await resolveReport(reportId, 'RESOLVED');
      setReports(reports.filter(report => report.id !== reportId));
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      
      setSuccessMessage('Report has been resolved');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to resolve report');
      console.error(err);
    }
  };

  // Handle Dismiss Report
  const handleDismissReport = async (reportId: number) => {
    try {
      await dismissReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      
      setSuccessMessage('Report has been dismissed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to dismiss report');
      console.error(err);
    }
  };

  // Handle Ban User
  const handleBanUser = (userId: number, username: string) => {
    setUserToBan({ id: userId, username });
    setShowBanConfirmation(true);
  };

  // Confirm Ban User
  const confirmBanUser = async () => {
    if (!userToBan) return;
    
    try {
      await updateUserStatus(userToBan.id, 'BANNED');
      setSuccessMessage(`User ${userToBan.username} has been banned`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to ban user');
      console.error(err);
    } finally {
      setShowBanConfirmation(false);
      setUserToBan(null);
    }
  };

  // Cancel Ban User
  const cancelBanUser = () => {
    setShowBanConfirmation(false);
    setUserToBan(null);
  };

  // Navigate to Users
  const navigateToUsers = () => {
    navigate('/admin/users');
  };

  // Navigate to Dashboard
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Loading Indicator
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  // Error Message
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">Report Management</h1>
        <div className="admin-header-actions">
          <button 
            onClick={navigateToDashboard}
            className="admin-btn-primary mr-2"
          >
            Dashboard
          </button>
          <button 
            onClick={navigateToUsers}
            className="admin-btn-primary mr-2"
          >
            Manage Users
          </button>
        </div>
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
      
      {/* Main Content */}
      <div className="admin-content-layout">
        {/* Reports List */}
        <div className={`admin-card ${selectedReport ? 'admin-card-list' : ''}`}>
          <h2 className="admin-section-title">Reported Content</h2>
          
          {reports.length === 0 ? (
            <div className="admin-alert-info">No reports found.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Reported By</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report.id} className={selectedReport?.id === report.id ? 'admin-row-selected' : ''}>
                      <td>{report.id}</td>
                      <td>
                        <span className="admin-badge">{report.reportedContentType}</span>
                      </td>
                      <td>{report.reporter?.username || 'Anonymous'}</td>
                      <td className="admin-cell-truncate">{report.reason}</td>
                      <td>
                        <span className={`admin-badge-${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-action-buttons">
                          <button 
                            onClick={() => handleViewReport(report)}
                            className="admin-btn-primary admin-btn-sm"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleResolveReport(report.id)}
                            className="admin-btn-success admin-btn-sm"
                          >
                            Resolve
                          </button>
                          <button 
                            onClick={() => handleDismissReport(report.id)}
                            className="admin-btn-secondary admin-btn-sm"
                          >
                            Dismiss
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Details */}
        {selectedReport && (
          <div className="admin-card admin-card-detail">
            <h2 className="admin-section-title">Report Details</h2>
            
            {contentLoading ? (
              <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Loading content...</p>
              </div>
            ) : (
              <div className="admin-detail-content">
                {/* Report Information Section */}
                <div className="admin-detail-section">
                  <h3 className="admin-detail-title">Report Information</h3>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">ID:</span>
                      <span>{selectedReport.id}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">Type:</span>
                      <span>{selectedReport.reportedContentType}</span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">Status:</span>
                      <span className={`admin-badge-${selectedReport.status.toLowerCase()}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">Reported By:</span>
                      <span>
                        {selectedReport.reporter?.username || 'Anonymous'}
                        {selectedReport.reporter && (
                          <button 
                            onClick={() => selectedReport.reporter && handleBanUser(selectedReport.reporter.id, selectedReport.reporter.username)}
                            className="admin-btn-danger admin-btn-sm ml-2"
                          >
                            Ban User
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">Date:</span>
                      <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Report Reason Section */}
                <div className="admin-detail-section">
                  <h3 className="admin-detail-title">Reason for Report</h3>
                  <div className="admin-detail-reason">
                    {selectedReport.reason}
                  </div>
                </div>
                
                {/* Reported Content Section */}
                {reportedContent && (
                  <div className="admin-detail-section">
                    <h3 className="admin-detail-title">Reported Content</h3>
                    {reportedContent.error ? (
                      <div className="admin-alert-error">{reportedContent.message}</div>
                    ) : (
                      <div className="admin-reported-content">
                        {reportedContent.title && (
                          <h4 className="admin-content-title">{reportedContent.title}</h4>
                        )}
                        <div className="admin-content-body">
                          {reportedContent.content}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="admin-detail-actions">
                  <button 
                    onClick={() => handleResolveReport(selectedReport.id)}
                    className="admin-btn-success"
                  >
                    Resolve Report
                  </button>
                  <button 
                    onClick={() => handleDismissReport(selectedReport.id)}
                    className="admin-btn-secondary"
                  >
                    Dismiss Report
                  </button>
                  {selectedReport.reporter && (
                    <button 
                      onClick={() => selectedReport.reporter && handleBanUser(selectedReport.reporter.id, selectedReport.reporter.username)}
                      className="admin-btn-danger"
                    >
                      Ban Reporter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ban User Confirmation Modal */}
      {showBanConfirmation && userToBan && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Confirm Ban</h3>
            <p className="admin-modal-content">
              Are you sure you want to ban user {userToBan.username}? This will prevent them from logging in.
            </p>
            <div className="admin-modal-actions">
              <button 
                onClick={confirmBanUser}
                className="admin-btn-danger"
              >
                Ban User
              </button>
              <button 
                onClick={cancelBanUser}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;