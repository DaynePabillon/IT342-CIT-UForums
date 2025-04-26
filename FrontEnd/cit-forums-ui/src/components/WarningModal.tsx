import React, { useState } from 'react';
import { issueWarning } from '../services/warningService';
import { IssueWarningRequest } from '../models/Warning';

interface WarningModalProps {
  show: boolean;
  onClose: () => void;
  memberId: number;
  memberUsername: string;
  contentType?: string;
  contentId?: number;
  onSuccess?: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  show,
  onClose,
  memberId,
  memberUsername,
  contentType,
  contentId,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const request: IssueWarningRequest = {
        memberId,
        reason,
        contentType,
        contentId
      };

      await issueWarning(request);
      setReason('');
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to issue warning:', err);
      setError('Failed to issue warning. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-warning text-white">
            <h5 className="modal-title">Issue Warning to {memberUsername}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="warningReason" className="form-label">
                Warning Reason
              </label>
              <textarea
                id="warningReason"
                className="form-control"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are issuing this warning..."
                disabled={isSubmitting}
              />
              <small className="text-muted">
                This message will be sent to the user. Be clear about which rule was violated.
              </small>
            </div>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              User will be automatically banned after receiving 3 warnings.
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Issuing Warning...
                </>
              ) : (
                'Issue Warning'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
