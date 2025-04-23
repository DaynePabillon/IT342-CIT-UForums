import React, { useState } from 'react';
import { createReport } from '../services/reportService';
import { isAuthenticated } from '../services/authService';
import { Comment as CommentModel } from '../models/Comment';

interface CommentProps {
  comment: CommentModel;
  onDelete: (commentId: number) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, onDelete }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleReport = async () => {
    try {
      await createReport({
        reportedContentType: 'COMMENT',
        reportedContentId: comment.id,
        reason: reportReason
      });
      setShowReportModal(false);
      setReportReason('');
      // Show success message
    } catch (err) {
      console.error('Failed to report comment:', err);
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
    <div className="comment-card card mb-3 shadow-sm border-0">
      <div className="card-body py-3">
        <div className="d-flex">
          {/* Avatar */}
          <div className="comment-avatar me-3">
            <div className="avatar bg-light rounded-circle d-flex justify-content-center align-items-center" 
                 style={{ width: '36px', height: '36px' }}>
              <span className="fw-bold text-secondary">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Comment content */}
          <div className="flex-grow-1">
            <div className="comment-header d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-0 fw-bold">{comment.authorName}</h6>
                <small className="text-muted">{formatDate(comment.createdAt)}</small>
              </div>
              
              {isAuthenticated() && (
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-light text-muted rounded-pill"
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                  >
                    <i className="bi bi-three-dots"></i>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu dropdown-menu-end show" 
                         style={{ position: 'absolute', transform: 'translate3d(0px, 30px, 0px)' }}>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowReportModal(true);
                        }}
                      >
                        <i className="bi bi-flag me-2"></i>
                        Report Comment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="comment-content mb-2">
              <p className="card-text" style={{ whiteSpace: 'pre-line' }}>{comment.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Report Comment</h5>
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

export default Comment;