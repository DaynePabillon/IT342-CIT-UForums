import React, { useState, useEffect } from 'react';
import { getThreadsByForumId, Thread } from '../services/threadService';
import { getActiveForums, Forum } from '../services/forumService';

interface ReportContentSelectorProps {
  show: boolean;
  onSelect: (contentType: 'THREAD' | 'COMMENT', contentId: number, contentTitle: string) => void;
  onClose: () => void;
}

const ReportContentSelector: React.FC<ReportContentSelectorProps> = ({ show, onSelect, onClose }) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [step, setStep] = useState<'forum' | 'thread'>('forum');

  // Fetch forums when component mounts
  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true);
        const forumsData = await getActiveForums();
        setForums(forumsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch forums:', err);
        setError('Failed to load forums. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchForums();
    }
  }, [show]);

  // Fetch threads when a forum is selected
  useEffect(() => {
    const fetchThreads = async () => {
      if (!selectedForum) return;
      
      try {
        setLoading(true);
        const response = await getThreadsByForumId(selectedForum.id);
        setThreads(response.content);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch threads:', err);
        setError('Failed to load threads. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedForum) {
      fetchThreads();
    }
  }, [selectedForum]);

  const handleForumSelect = (forum: Forum) => {
    setSelectedForum(forum);
    setSelectedThread(null);
  };

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleContinueToThreads = () => {
    if (selectedForum) {
      setStep('thread');
    }
  };

  const handleBackToForums = () => {
    setStep('forum');
  };

  const handleSubmit = () => {
    if (selectedThread) {
      onSelect('THREAD', selectedThread.id, selectedThread.title);
    }
  };

  const resetAndClose = () => {
    setSelectedForum(null);
    setSelectedThread(null);
    setStep('forum');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {step === 'forum' ? 'Select Forum to Report From' : 'Select Thread to Report'}
            </h5>
            <button type="button" className="btn-close" onClick={resetAndClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <p className="mt-2">{step === 'forum' ? 'Loading forums...' : 'Loading threads...'}</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : step === 'forum' ? (
              <div className="mb-3">
                <label className="form-label">Select a Forum</label>
                <div className="list-group">
                  {forums.length === 0 ? (
                    <div className="alert alert-info">No forums available.</div>
                  ) : (
                    forums.map((forum) => (
                      <button
                        key={forum.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedForum?.id === forum.id ? 'active' : ''}`}
                        onClick={() => handleForumSelect(forum)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{forum.title}</strong>
                            <div className="small text-muted">{forum.description}</div>
                          </div>
                          <span className="badge bg-primary rounded-pill">{forum.threadCount} threads</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6>Forum: {selectedForum?.title}</h6>
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={handleBackToForums}
                    >
                      Change Forum
                    </button>
                  </div>
                  <hr />
                </div>
                <label className="form-label">Select a Thread</label>
                <div className="list-group">
                  {threads.length === 0 ? (
                    <div className="alert alert-info">No threads available in this forum.</div>
                  ) : (
                    threads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${selectedThread?.id === thread.id ? 'active' : ''}`}
                        onClick={() => handleThreadSelect(thread)}
                      >
                        {thread.title}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={resetAndClose}>
              Cancel
            </button>
            {step === 'forum' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleContinueToThreads}
                disabled={!selectedForum}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!selectedThread}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContentSelector;