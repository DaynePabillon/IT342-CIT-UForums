import React, { useState } from 'react';
import { createReport } from '../services/reportService';
import { isAuthenticated } from '../services/authService';
import { Thread as ThreadModel } from '../models/Thread';

interface ThreadProps {
  thread: ThreadModel;
  onDelete: (threadId: number) => void;
}

const Thread: React.FC<ThreadProps> = ({ thread, onDelete }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    try {
      await createReport({
        reportedContentType: 'THREAD',
        reportedContentId: thread.id,
        reason: reportReason
      });
      setShowReportModal(false);
      setReportReason('');
      // Show success message
    } catch (err) {
      console.error('Failed to report thread:', err);
      // Show error message
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{thread.title}</h5>
        </div>
      </div>
      <div className="card-body">
        <p className="card-text">{thread.content}</p>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <small className="text-muted me-3">
              Posted by {thread.createdBy.name} on {new Date(thread.createdAt).toLocaleDateString()}
            </small>
            {isAuthenticated() && (
              <div className="dropdown">
                <button
                  className="btn btn-link text-muted p-0"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-three-dots"></i>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => setShowReportModal(true)}
                    >
                      <i className="bi bi-flag me-2"></i>
                      Report Thread
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report Thread</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="reportReason" className="form-label">
                    Reason for reporting
                  </label>
                  <textarea
                    className="form-control"
                    id="reportReason"
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReport}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default Thread; 