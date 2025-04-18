import React, { useState, useEffect } from 'react';
import { Report } from '../models/Report';
import { getReports, resolveReport, dismissReport } from '../services/reportService';
import { isAdmin } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!isAdmin()) {
          navigate('/');
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
  }, [navigate]);

  const handleResolve = async (reportId: number, action: string) => {
    try {
      const updatedReport = await resolveReport(reportId, action);
      setReports(reports.map(report => 
        report.id === reportId ? updatedReport : report
      ));
    } catch (err) {
      setError('Failed to resolve report');
      console.error(err);
    }
  };

  const handleDismiss = async (reportId: number) => {
    try {
      const updatedReport = await dismissReport(reportId);
      setReports(reports.map(report => 
        report.id === reportId ? updatedReport : report
      ));
    } catch (err) {
      setError('Failed to dismiss report');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Reported Content</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
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
              <tr key={report.id}>
                <td>{report.reportedContentType}</td>
                <td>{report.reporterUsername}</td>
                <td>{report.reason}</td>
                <td>{report.status}</td>
                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                <td>
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleResolve(report.id, 'Content removed')}
                      >
                        Remove Content
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDismiss(report.id)}
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports; 