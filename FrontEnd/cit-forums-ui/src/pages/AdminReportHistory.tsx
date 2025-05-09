import React, { useState, useEffect } from 'react';
import { Report } from '../models/Report';
import { getReportHistory } from '../services/reportService';
import { getThreadById } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/custom.css';
import '../styles/adminTheme.css';

const AdminReportHistory: React.FC = () => {
  // State Variables
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportedContent, setReportedContent] = useState<any | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'dismissed'>('all');
  const navigate = useNavigate();
  const { checkAdminStatus } = useAuth();

  // Fetch Reports on Mount
  useEffect(() => {
    const fetchReportHistory = async () => {
      try {
        // Check admin status directly
        if (!checkAdminStatus()) {
          navigate('/admin/login');
          return;
        }
        setLoading(true);
        console.log('Fetching report history...');
        const data = await getReportHistory();
        console.log('Report history fetched:', data);
        setReports(data);
      } catch (err) {
        console.error('Error in fetchReportHistory:', err);
        setError('Failed to fetch report history. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportHistory();
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

  // Filter reports based on status
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return report.status === 'RESOLVED';
    if (filter === 'dismissed') return report.status === 'DISMISSED';
    return true;
  });

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Report History</h1>
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

      {/* Filter Controls */}
      <div className="admin-filter-controls">
        <button 
          className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Reports
        </button>
        <button 
          className={`admin-filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved
        </button>
        <button 
          className={`admin-filter-btn ${filter === 'dismissed' ? 'active' : ''}`}
          onClick={() => setFilter('dismissed')}
        >
          Dismissed
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading report history...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="admin-alert-info">No report history found.</div>
      ) : (
        <div className="admin-content-container">
          <div className="admin-sidebar">
            <div className="admin-card">
              <h2 className="admin-section-title">Report History</h2>
              <div className="admin-reports-list">
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    className={`admin-report-item ${report.status.toLowerCase()} ${selectedReport?.id === report.id ? 'active' : ''}`}
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
                      <span className="admin-report-status">Status: {report.status}</span>
                      {report.resolvedAt && (
                        <span>Resolved: {new Date(report.resolvedAt).toLocaleDateString()}</span>
                      )}
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
                      <div className="admin-info-row">
                        <span className="admin-info-label">Status:</span>
                        <span className="admin-info-value admin-status-badge">{selectedReport.status}</span>
                      </div>
                      {selectedReport.resolvedAt && (
                        <div className="admin-info-row">
                          <span className="admin-info-label">Resolved At:</span>
                          <span className="admin-info-value">{new Date(selectedReport.resolvedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedReport.actionTaken && (
                        <div className="admin-info-row">
                          <span className="admin-info-label">Action Taken:</span>
                          <span className="admin-info-value">{selectedReport.actionTaken}</span>
                        </div>
                      )}
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
                      <p className="admin-no-content">No content available or content may have been deleted</p>
                    )}
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

export default AdminReportHistory;
