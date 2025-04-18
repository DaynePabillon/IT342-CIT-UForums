import React, { useState, useEffect } from 'react';
import { getThreadsByForumId, Thread } from '../services/threadService';

interface ReportContentSelectorProps {
  show: boolean;
  onSelect: (contentType: 'THREAD' | 'COMMENT', contentId: number, contentTitle: string) => void;
  onClose: () => void;
}

const ReportContentSelector: React.FC<ReportContentSelectorProps> = ({ show, onSelect, onClose }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [forumId, setForumId] = useState<number>(1); // Default to first forum

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const response = await getThreadsByForumId(forumId);
        setThreads(response.content);
      } catch (err) {
        console.error('Failed to fetch threads:', err);
        setError('Failed to load threads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchThreads();
    }
  }, [forumId, show]);

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleSubmit = () => {
    if (selectedThread) {
      onSelect('THREAD', selectedThread.id, selectedThread.title);
    }
  };

  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Content to Report</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading threads...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="mb-3">
                <label className="form-label">Select a Thread</label>
                <div className="list-group">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      className={`list-group-item list-group-item-action ${
                        selectedThread?.id === thread.id ? 'active' : ''
                      }`}
                      onClick={() => handleThreadSelect(thread)}
                    >
                      {thread.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!selectedThread}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContentSelector; 