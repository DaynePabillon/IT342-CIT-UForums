import React, { useState } from 'react';
import { createReport } from '../services/reportService';

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  contentType: 'THREAD' | 'COMMENT';
  contentId: number;
  contentTitle: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  show,
  onClose,
  contentType,
  contentId,
  contentTitle
}) => {
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    try {
      setIsSubmitting(true);
      await createReport({
        reportedContentType: contentType,
        reportedContentId: contentId,
        reason: reportReason
      });
      onClose();
      setReportReason('');
      setError(null);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report {contentType.toLowerCase()}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          <div className="modal-body">
            <p>You are reporting: <strong>{contentTitle}</strong></p>
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
                disabled={isSubmitting}
              ></textarea>
              {error && <div className="text-danger mt-2">{error}</div>}
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
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </div>
  );
};

export default ReportModal; 