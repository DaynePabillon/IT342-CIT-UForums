import React, { useState, useEffect } from 'react';
import { createReport } from '../services/reportService';
import { isAuthenticated } from '../services/authService';
import { Thread as ThreadModel } from '../models/Thread';
import { getCommentsByThreadId } from '../services/commentService';

interface ThreadProps {
  thread: ThreadModel;
  onDelete: (threadId: number) => void;
}

const Thread: React.FC<ThreadProps> = ({ thread, onDelete }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [commentCount, setCommentCount] = useState(thread.commentCount);

  // Fetch actual comment count from the API
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const comments = await getCommentsByThreadId(thread.id);
        setCommentCount(comments.length);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        // If there's an error, fall back to the thread.commentCount
        setCommentCount(thread.commentCount);
      }
    };

    fetchCommentCount();
  }, [thread.id, thread.commentCount]);

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

  // Format date in a more readable way
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="thread-card card mb-4 shadow-sm border-0">
      <div className="card-header bg-gradient" style={{ backgroundColor: '#0d6efd', color: 'white' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{thread.title}</h5>
          {thread.isPinned && (
            <span className="badge bg-warning text-dark ms-2">
              <i className="bi bi-pin-angle-fill me-1"></i>Pinned
            </span>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="thread-content mb-3">
          <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{thread.content}</p>
        </div>
        <div className="thread-footer d-flex justify-content-between align-items-center">
          <div className="author-info d-flex align-items-center">
            <div className="avatar me-2 bg-light rounded-circle d-flex justify-content-center align-items-center" 
                 style={{ width: '40px', height: '40px' }}>
              <span className="fw-bold text-primary">
                {thread.createdBy.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="author-name fw-bold">{thread.createdBy.name}</div>
              <small className="text-muted">
                Posted on {formatDate(thread.createdAt)}
              </small>
            </div>
          </div>
          
          <div className="thread-actions d-flex align-items-center">
            <span className="me-3 text-muted">
              <i className="bi bi-chat-left-text me-1"></i>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
            
            {isAuthenticated() && (
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-three-dots"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
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
              <div className="modal-header bg-light">
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