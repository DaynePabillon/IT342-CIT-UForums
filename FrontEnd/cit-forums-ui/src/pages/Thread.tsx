import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadById, Thread } from '../services/threadService';
import { getCommentsByThreadId, Comment as CommentType } from '../services/commentService';
import { isAuthenticated } from '../services/authService';
import CommentForm from '../components/CommentForm';
import ThreadComponent from '../components/Thread';
import CommentComponent from '../components/Comment';

const ThreadPage: React.FC = () => {
  const { forumId, threadId } = useParams<{ forumId: string; threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  const fetchThread = useCallback(async () => {
    if (!threadId) {
      setError('Invalid thread ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getThreadById(parseInt(threadId));
      setThread(data);
      
      // Get comments for this thread
      try {
        const threadComments = await getCommentsByThreadId(parseInt(threadId));
        setComments(threadComments);
      } catch (commentError: any) {
        console.error('Error fetching comments:', commentError);
        setComments([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated();
    setUserAuthenticated(authStatus);
    
    fetchThread();
  }, [fetchThread]);

  const handleCommentAdded = (newComment: CommentType) => {
    setComments(prevComments => [...prevComments, newComment]);
  };

  const handleThreadDelete = async (threadId: number) => {
    // Implement thread deletion if needed
    console.log('Thread deletion not implemented yet');
  };

  const handleCommentDelete = async (commentId: number) => {
    // Implement comment deletion if needed
    console.log('Comment deletion not implemented yet');
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
        <Link to={`/forums/${forumId}/threads`} className="btn btn-outline-secondary">
          ← Back to Forum
        </Link>
      </div>

      {/* Use the Thread component */}
      <ThreadComponent
        thread={{
          id: thread.id,
          title: thread.title,
          content: thread.content,
          forumId: thread.forumId,
          commentCount: thread.commentCount,
          createdBy: thread.createdBy,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          isLocked: false, // Add proper lock status if available
          isPinned: false // Add proper pin status if available
        }}
        onDelete={handleThreadDelete}
      />

      {/* Comments Section */}
      <div className="comments-section mt-4">
        <h3>Comments</h3>
        {comments.map((comment) => (
          <CommentComponent
            key={comment.id}
            comment={{
              id: comment.id,
              content: comment.content,
              authorId: comment.author?.id || 0,
              authorName: comment.author?.name || 'Anonymous',
              threadId: threadId ? parseInt(threadId) : 0,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt || comment.createdAt,
            }}
            onDelete={handleCommentDelete}
          />
        ))}

        {/* Comment Form - Only render if user is authenticated */}
        {userAuthenticated && (
          <CommentForm postId={thread.id} onCommentAdded={handleCommentAdded} />
        )}
      </div>
    </div>
  );
};

export default ThreadPage; 