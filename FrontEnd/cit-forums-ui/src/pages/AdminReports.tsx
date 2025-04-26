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

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Reports Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="alert alert-info">No reports found.</div>
      ) : (
        <div className="row">
          <div className="col-md-5">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Reports List</h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      className={`list-group-item list-group-item-action ${selectedReport?.id === report.id ? 'active' : ''}`}
                      onClick={() => handleViewReport(report)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {report.reportedContentType === 'THREAD' ? 'Thread' : 'Comment'} Report
                          </h6>
                          <small>
                            Reported by: {report.reporterUsername || 'Unknown'}
                          </small>
                        </div>
                        <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            {selectedReport ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Report Details</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <h6>Report Information</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th>Report ID:</th>
                          <td>{selectedReport.id}</td>
                        </tr>
                        <tr>
                          <th>Content Type:</th>
                          <td>{selectedReport.reportedContentType}</td>
                        </tr>
                        <tr>
                          <th>Content ID:</th>
                          <td>{selectedReport.reportedContentId}</td>
                        </tr>
                        <tr>
                          <th>Reason:</th>
                          <td>{selectedReport.reason}</td>
                        </tr>
                        <tr>
                          <th>Reported By:</th>
                          <td>{selectedReport.reporterUsername || 'Unknown'}</td>
                        </tr>
                        <tr>
                          <th>Date:</th>
                          <td>{new Date(selectedReport.createdAt).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-3">
                    <h6>Reported Content</h6>
                    {contentLoading ? (
                      <div className="d-flex justify-content-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : reportedContent ? (
                      <div className="card">
                        <div className="card-body">
                          {selectedReport.reportedContentType === 'THREAD' && (
                            <>
                              <h5>{reportedContent.title}</h5>
                              <p className="text-muted small">
                                Posted by: {reportedContent.authorUsername} on{' '}
                                {new Date(reportedContent.createdAt).toLocaleDateString()}
                              </p>
                              <p>{reportedContent.content}</p>
                            </>
                          )}
                          {selectedReport.reportedContentType === 'COMMENT' && (
                            <p>{reportedContent.content}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No content available</p>
                    )}
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleResolveReport(selectedReport.id)}
                    >
                      <i className="bi bi-check-circle"></i> Resolve
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDismissReport(selectedReport.id)}
                    >
                      <i className="bi bi-x-circle"></i> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body text-center">
                  <p className="mb-0">Select a report to view details</p>
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