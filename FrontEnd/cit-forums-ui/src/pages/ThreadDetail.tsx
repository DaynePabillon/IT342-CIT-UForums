import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Thread } from '../services/threadService';
import { getThreadById } from '../services/threadService';
import { useAuth } from '../contexts/AuthContext';

const ThreadDetail: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        if (!threadId) {
          throw new Error('Thread ID is required');
        }
        const data = await getThreadById(parseInt(threadId));
        setThread(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [threadId]);

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  if (!thread) {
    return <div className="container mt-4">Thread not found</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{thread.title}</h2>
          <div>
            <button
              className="btn btn-secondary me-2"
              onClick={() => navigate(`/forums/${thread.forumId}/threads`)}
            >
              Back to Forum
            </button>
            {user?.admin && (
              <button
                className="btn btn-primary me-2"
                onClick={() => navigate(`/admin/threads/${thread.id}/edit`)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <p className="text-muted">
              Posted by {thread.createdBy?.name || 'Unknown User'} on{' '}
              {new Date(thread.createdAt).toLocaleDateString()}
            </p>
            <div className="thread-content">{thread.content}</div>
          </div>

          <div className="comments-section">
            <h3>Comments</h3>
            {/* TODO: Add comments functionality */}
            <p className="text-muted">Comments feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetail; 