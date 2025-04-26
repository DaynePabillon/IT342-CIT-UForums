import React, { useState } from 'react';
import { createWarning } from '../services/warningService';
import { CreateWarningRequest } from '../models/Warning';

interface WarningModalProps {
  show: boolean;
  onClose: () => void;
  memberId: number;
  memberUsername: string;
  onSuccess?: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
  show,
  onClose,
  memberId,
  memberUsername,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the warning');
      return;
    }

    if (!message.trim()) {
      setError('Please provide a message for the user');
      return;
    }

    try {
      setIsSubmitting(true);
      const request: CreateWarningRequest = {
        memberId,
        reason,
        message
      };

      await createWarning(request);
      setReason('');
      setMessage('');
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit warning:', err);
      setError('Failed to submit warning. Please try again.');
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
            <p className="mb-3">
              This user will receive a warning. After 3 warnings, the user will be automatically banned.
            </p>
            <p className="mb-3">
              <strong>Current Warning Count:</strong> <span className="badge bg-warning text-dark">Loading...</span>
            </p>
            <div className="mb-3">
              <label htmlFor="warningReason" className="form-label">
                Reason for Warning
              </label>
              <select
                id="warningReason"
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select a reason...</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="Misinformation">Misinformation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="warningMessage" className="form-label">
                Message to User
              </label>
              <textarea
                id="warningMessage"
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain to the user why they are receiving this warning and what they should do differently..."
                disabled={isSubmitting}
              ></textarea>
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
                  Submitting...
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
