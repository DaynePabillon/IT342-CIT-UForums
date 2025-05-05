import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getThreadById, Thread } from '../services/threadService';
import { getCommentsByThreadId, Comment as CommentType, createComment } from '../services/commentService';
import { isAuthenticated } from '../services/authService';
import CommentForm from '../components/CommentForm';
import ThreadComponent from '../components/Thread';
import CommentComponent from '../components/Comment';

const ThreadPage: React.FC = () => {
  const { forumId, threadId } = useParams<{ forumId: string; threadId: string }>();
  const navigate = useNavigate();
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
        console.log('Fetched comments:', threadComments);
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

  const handleCommentAdded = async (newComment: CommentType) => {
    console.log('Comment added:', newComment);
    // Add the new comment to the comments array
    setComments(prevComments => [...prevComments, newComment]);
    
    // Refresh the thread data to get the updated comment count
    try {
      if (threadId) {
        const updatedThread = await getThreadById(parseInt(threadId));
        setThread(updatedThread);
        console.log('Thread data refreshed with updated comment count:', updatedThread.commentCount);
      }
    } catch (err) {
      console.error('Error refreshing thread data:', err);
    }
  };

  const handleThreadDelete = async (threadId: number) => {
    // Implement thread deletion if needed
    console.log('Thread deletion not implemented yet');
  };

  const handleCommentDelete = async (commentId: number) => {
    // Implement comment deletion if needed
    console.log('Comment deletion not implemented yet');
  };

  // Function to navigate back with updated comment count
  const handleBackToForum = () => {
    if (thread && forumId) {
      navigate(`/forums/${forumId}/threads`, { 
        state: { 
          refresh: true,
          updatedThreadId: thread.id,
          updatedCommentCount: thread.commentCount
        } 
      });
    } else {
      navigate(`/forums/${forumId}/threads`);
    }
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
        <button onClick={handleBackToForum} className="btn btn-outline-secondary">
          ← Back to Forum
        </button>
      </div>

      {/* Use the Thread component */}
      <ThreadComponent
        thread={{
          id: thread.id,
          title: thread.title,
          content: thread.content,
          forumId: thread.forumId,
          commentCount: comments.length, 
          createdBy: thread.createdBy,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          isLocked: false, 
          isPinned: false 
        }}
        onDelete={handleThreadDelete}
      />

      {/* Comments Section */}
      <div className="comments-section mt-4">
        <h3>Comments ({comments.length})</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
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
          ))
        ) : (
          <p className="text-muted">No comments yet. Be the first to comment!</p>
        )}

        {/* Comment Form - Only render if user is authenticated */}
        {userAuthenticated && (
          <CommentForm 
            threadId={parseInt(threadId!)} 
            onCommentAdded={handleCommentAdded} 
          />
        )}
      </div>
    </div>
  );
};

export default ThreadPage;