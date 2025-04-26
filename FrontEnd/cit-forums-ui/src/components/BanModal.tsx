import React, { useState } from 'react';
import { banMember } from '../services/warningService';

interface BanModalProps {
  show: boolean;
  onClose: () => void;
  memberId: number;
  memberUsername: string;
  onSuccess?: () => void;
}

const BanModal: React.FC<BanModalProps> = ({
  show,
  onClose,
  memberId,
  memberUsername,
  onSuccess
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the ban');
      return;
    }

    try {
      setIsSubmitting(true);
      await banMember(memberId, reason);
      setReason('');
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Failed to ban user:', err);
      setError('Failed to ban user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Ban User: {memberUsername}</h5>
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
              This action will ban the user from the forum. They will no longer be able to post or comment.
            </p>
            <div className="mb-3">
              <label htmlFor="banReason" className="form-label">
                Reason for Ban
              </label>
              <textarea
                id="banReason"
                className="form-control"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this user is being banned..."
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
              className="btn btn-danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Banning...
                </>
              ) : (
                'Ban User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BanModal;
