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
      console.log('Viewing report:', report);
      if (report.reportedContentType === 'THREAD') {
        // Use the admin-specific endpoint to get thread details
        console.log('Fetching thread details for ID:', report.reportedContentId);
        const threadData = await getThreadById(report.reportedContentId);
        console.log('Thread data fetched:', threadData);
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
      console.log('Resolving report:', reportId);
      await resolveReport(reportId, 'resolve');
      setReports(reports.filter(report => report.id !== reportId));
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      
      setSuccessMessage('Report has been resolved');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error resolving report:', err);
      setError('Failed to resolve report. Please check the console for details.');
    }
  };

  // Handle Dismiss Report
  const handleDismissReport = async (reportId: number) => {
    try {
      console.log('Dismissing report:', reportId);
      await dismissReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
      
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      
      setSuccessMessage('Report has been dismissed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error dismissing report:', err);
      setError('Failed to dismiss report. Please check the console for details.');
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
      console.log('Banning user:', userToBan);
      await updateUserStatus(userToBan.id, 'BANNED');
      setSuccessMessage(`User ${userToBan.username} has been banned`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user. Please check the console for details.');
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

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">Reports Management</h1>
        <div className="admin-header-actions">
          <button 
            onClick={navigateToDashboard}
            className="admin-btn-primary mr-2"
          >
            Dashboard
          </button>
          <button 
            onClick={navigateToUsers}
            className="admin-btn-primary"
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="admin-alert-error">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="admin-alert-close"
          >
            ×
          </button>
        </div>
      )}

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
      <div className="admin-content-grid">
        {/* Reports List */}
        <div className="admin-card admin-reports-list">
          <h2 className="admin-section-title">Reports</h2>
          
          {reports.length === 0 ? (
            <div className="admin-alert-info">No reports found.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Reporter</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr 
                      key={report.id} 
                      className={selectedReport?.id === report.id ? 'active' : ''}
                      onClick={() => handleViewReport(report)}
                    >
                      <td>
                        <span className={`admin-badge admin-badge-${report.reportedContentType.toLowerCase()}`}>
                          {report.reportedContentType}
                        </span>
                      </td>
                      <td>{report.reporter?.username || 'Anonymous'}</td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${report.status.toLowerCase()}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(report);
                          }}
                          className="admin-btn-secondary admin-btn-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Report Details */}
        <div className="admin-card admin-report-details">
          {!selectedReport ? (
            <div className="admin-placeholder">
              <p>Select a report to view details</p>
            </div>
          ) : (
            <div className="admin-detail-container">
              <h2 className="admin-detail-header">Report Details</h2>
              
              {/* Report Info Section */}
              <div className="admin-detail-section">
                <h3 className="admin-detail-title">Report Information</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Type:</span>
                    <span className={`admin-badge admin-badge-${selectedReport.reportedContentType.toLowerCase()}`}>
                      {selectedReport.reportedContentType}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Status:</span>
                    <span className={`admin-badge admin-badge-${selectedReport.status.toLowerCase()}`}>
                      {selectedReport.status}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Reporter:</span>
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
              {contentLoading ? (
                <div className="admin-content-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading content...</p>
                </div>
              ) : reportedContent ? (
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
              ) : null}
              
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