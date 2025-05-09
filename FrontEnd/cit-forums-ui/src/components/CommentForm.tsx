import React, { useState } from 'react';
import { createComment } from '../services/commentService';
import { getUserProfile } from '../services/authService';

interface CommentFormProps {
  postId?: number;
  threadId: number;
  onCommentAdded: (newComment: any) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, threadId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Creating comment with threadId:', threadId, 'and postId:', postId);
      const newComment = await createComment({
        content,
        threadId,
        postId
      });
      console.log('Comment created successfully:', newComment);
      
      // Pass the new comment to the parent component
      onCommentAdded(newComment);
      
      // Clear the form
      setContent('');
    } catch (err: any) {
      console.error('Error creating comment:', err);
      console.error('Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-form-card card mt-4 shadow-sm border-0">
      <div className="card-header bg-light">
        <h5 className="mb-0 fs-5">
          <i className="bi bi-chat-left-text me-2"></i>
          Add a Comment
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <textarea
              className="form-control border-0 bg-light"
              style={{ resize: 'none', borderRadius: '0.5rem' }}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              required
              disabled={loading}
            ></textarea>
          </div>
          <div className="d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary px-4 rounded-pill"
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Posting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Post Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;