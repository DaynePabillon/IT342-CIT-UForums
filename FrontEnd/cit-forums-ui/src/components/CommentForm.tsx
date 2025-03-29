import React, { useState } from 'react';
import { createComment } from '../services/commentService';
import { getUserProfile } from '../services/authService';

interface CommentFormProps {
  threadId: number;
  onCommentAdded: (newComment: any) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ threadId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const newComment = await createComment({
        content,
        threadId,
      });
      
      // Add the user's name to the comment for immediate display
      try {
        const userProfile = getUserProfile();
        if (userProfile && userProfile.username) {
          newComment.createdBy = userProfile.username;
        } else {
          newComment.createdBy = 'User';
        }
      } catch (profileError) {
        console.error('Error getting user profile:', profileError);
        newComment.createdBy = 'User';
      }
      
      onCommentAdded(newComment);
      setContent('');
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">Add a Comment</div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <textarea
              className="form-control"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment..."
              required
              disabled={loading}
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentForm; 