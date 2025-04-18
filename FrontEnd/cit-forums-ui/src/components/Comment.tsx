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

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <h6 className="card-subtitle mb-2 text-muted">
              Posted by {comment.authorName}
            </h6>
            <p className="card-text">{comment.content}</p>
            <div className="d-flex align-items-center mt-2">
              <small className="text-muted">
                {new Date(comment.createdAt).toLocaleDateString()}
              </small>
              {isAuthenticated() && (
                <div className="dropdown ms-2">
                  <button
                    className="btn btn-link text-muted p-0"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <i className="bi bi-three-dots"></i>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu show" style={{ position: 'absolute', transform: 'translate3d(0px, 30px, 0px)' }}>
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
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
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
        </div>
      )}
    </div>
  );
};

export default Comment; 