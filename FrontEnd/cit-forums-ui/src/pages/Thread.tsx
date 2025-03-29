import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadById } from '../services/threadService';
import { getCommentsByThreadId, Comment } from '../services/commentService';
import { isAuthenticated } from '../services/authService';
import CommentForm from '../components/CommentForm';

interface ThreadData {
  id: number;
  title: string;
  content: string;
  forumId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Thread: React.FC = () => {
  const { forumId, threadId } = useParams<{ forumId: string; threadId: string }>();
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status
    setUserAuthenticated(isAuthenticated());
    
    // Fetch thread and comments
    if (threadId && forumId) {
      fetchThread(parseInt(threadId));
      fetchComments(parseInt(threadId));
    } else {
      setError('Invalid thread or forum ID');
      setLoading(false);
    }
  }, [threadId, forumId]);

  const fetchThread = async (id: number) => {
    setLoading(true);
    try {
      const data = await getThreadById(id);
      setThread(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id: number) => {
    try {
      const data = await getCommentsByThreadId(id);
      setComments(data);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments([...comments, newComment]);
  };

  if (loading) {
    return <div className="text-center">Loading thread...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!thread) {
    return <div className="alert alert-warning">Thread not found</div>;
  }

  return (
    <div className="container">
      <div className="mb-3">
        <Link to={`/forums/${forumId}`} className="btn btn-outline-secondary">
          ← Back to Forum
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <h2 className="mb-0">{thread.title}</h2>
          <small>
            Posted by {thread.createdBy} on{' '}
            {new Date(thread.createdAt).toLocaleDateString()}
          </small>
        </div>
        <div className="card-body">
          <p className="card-text">{thread.content}</p>
        </div>
      </div>

      <h3 className="mb-3">Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <div className="alert alert-info">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="card mb-3">
              <div className="card-body">
                <p className="card-text">{comment.content}</p>
                <div className="d-flex justify-content-between">
                  <small>
                    Posted by {comment.createdBy}
                  </small>
                  <small>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {userAuthenticated ? (
        <CommentForm threadId={parseInt(threadId || '0')} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="alert alert-info">
          <Link to="/login" className="alert-link">Login</Link> to post a comment.
        </div>
      )}
    </div>
  );
};

export default Thread; 