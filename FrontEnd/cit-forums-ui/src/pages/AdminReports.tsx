import React, { useState, useEffect } from 'react';
import { Report } from '../models/Report';
import { getReports, resolveReport, dismissReport } from '../services/reportService';
import { getThreadById, updateUserStatus } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/custom.css';
import '../styles/adminTheme.css';
import WarningModal from '../components/WarningModal';

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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [userToWarn, setUserToWarn] = useState<{id: number, username: string, contentType?: string, contentId?: number} | null>(null);
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
      setError('Failed to resolve report. Please try again.');
      setTimeout(() => setError(null), 3000);
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
      setError('Failed to dismiss report. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle Warning User
  const handleWarnUser = (report: Report) => {
    if (report && report.reporterId) {
      setUserToWarn({
        id: report.reporterId,
        username: report.reporterUsername,
        contentType: report.reportedContentType,
        contentId: report.reportedContentId
      });
      setShowWarningModal(true);
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
      console.log('Banning user:', userToBan.id);
      await updateUserStatus(userToBan.id, 'BANNED');
      setSuccessMessage(`User ${userToBan.username} has been banned`);
      setShowBanConfirmation(false);
      setUserToBan(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error banning user:', err);
      setError('Failed to ban user. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Reports Management</h2>
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !reports.length) {
    return (
      <div className="container mt-4">
        <h2>Reports Management</h2>
        <div className="alert alert-danger mt-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} aria-label="Close"></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      
      <h2>Reports Management</h2>
      
      {reports.length === 0 ? (
        <div className="alert alert-info mt-3">
          <i className="bi bi-info-circle me-2"></i>
          No reports to display. All clear!
        </div>
      ) : (
        <div className="row mt-3">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Reported Items</h5>
              </div>
              <div className="list-group list-group-flush">
                {reports.map(report => (
                  <button
                    key={report.id}
                    className={`list-group-item list-group-item-action ${selectedReport?.id === report.id ? 'active' : ''}`}
                    onClick={() => handleViewReport(report)}
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">
                        {report.reportedContentType === 'THREAD' ? 'Thread' : 'Comment'} #{report.reportedContentId}
                      </h6>
                      <small>{new Date(report.createdAt).toLocaleString()}</small>
                    </div>
                    <p className="mb-1 text-truncate">{report.reason}</p>
                    <small>Reported by: {report.reporterUsername}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-md-7">
            {selectedReport ? (
              <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Report Details</h5>
                  <div>
                    <button 
                      className="btn btn-sm btn-warning me-2" 
                      onClick={() => handleWarnUser(selectedReport)}
                    >
                      <i className="bi bi-exclamation-triangle me-1"></i> Warn User
                    </button>
                    <button 
                      className="btn btn-sm btn-danger me-2" 
                      onClick={() => handleBanUser(selectedReport.reporterId, selectedReport.reporterUsername)}
                    >
                      <i className="bi bi-slash-circle me-1"></i> Ban User
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    {selectedReport.reportedContentType === 'THREAD' ? 'Thread' : 'Comment'} #{selectedReport.reportedContentId}
                  </h5>
                  
                  <div className="mb-3">
                    <strong>Reason:</strong> {selectedReport.reason}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Reported By:</strong> {selectedReport.reporterUsername}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                  
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Reported Content</h6>
                    </div>
                    <div className="card-body">
                      {contentLoading ? (
                        <div className="d-flex justify-content-center">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : reportedContent ? (
                        <div>
                          {reportedContent.title && (
                            <h6 className="card-subtitle mb-2 text-muted">{reportedContent.title}</h6>
                          )}
                          <p className="card-text">{reportedContent.content}</p>
                        </div>
                      ) : (
                        <p className="text-muted">Content not available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-secondary me-2" 
                      onClick={() => handleDismissReport(selectedReport.id)}
                    >
                      Dismiss Report
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleResolveReport(selectedReport.id)}
                    >
                      Resolve Report
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="bi bi-arrow-left-circle fs-1 text-muted"></i>
                  <p className="mt-3 text-muted">Select a report to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Warning Modal */}
      {userToWarn && (
        <WarningModal
          show={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          memberId={userToWarn.id}
          memberUsername={userToWarn.username}
          contentType={userToWarn.contentType}
          contentId={userToWarn.contentId}
          onSuccess={() => {
            setSuccessMessage(`Warning issued to ${userToWarn.username}`);
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}
      
      {/* Ban Confirmation Modal */}
      {showBanConfirmation && userToBan && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Ban User Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBanConfirmation(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to ban user <strong>{userToBan.username}</strong>?</p>
                <p>This will prevent them from posting or interacting with the forum.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBanConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmBanUser}
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;