import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreadById, Thread } from '../services/threadService';
import { getCommentsByPostId, Comment, PagedResponse } from '../services/commentService';
// import { createPost, Post } from '../services/postService';
import { isAuthenticated } from '../services/authService';
import CommentForm from '../components/CommentForm';

const ThreadComponent: React.FC = () => {
  const { forumId, threadId } = useParams<{ forumId: string; threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
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
      
      // Create a post for this thread
      try {
        // Ensure content meets validation requirements
        const content = data.content || '';
        if (content.length < 10) {
          throw new Error('Thread content is too short to create a post');
        }

        const newPost = await createPost({
          content: content,
          threadId: parseInt(threadId)
        });
        
        if (!newPost || !newPost.id) {
          throw new Error('Failed to create post: Invalid post data received');
        }
        
        setPost(newPost);
        
        // Fetch comments for the post
        await fetchComments(newPost.id);
      } catch (postError: any) {
        console.error('Error creating post:', postError);
        setError('Failed to create post: ' + (postError.message || 'Unknown error'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    // Check authentication status
    setUserAuthenticated(isAuthenticated());
    
    fetchThread();
  }, [fetchThread]);

  const fetchComments = async (id: number) => {
    try {
      const data = await getCommentsByPostId(id);
      // Ensure we have an array of comments
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data && typeof data === 'object' && 'content' in data) {
        // If the response is a paged response
        const pagedData = data as PagedResponse<Comment>;
        setComments(pagedData.content || []);
      } else {
        console.error('Unexpected comments data format:', data);
        setComments([]);
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prevComments => [...prevComments, newComment]);
  };

  if (loading) {
    return <div className="text-center">Loading thread...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!thread || !post) {
    return <div className="alert alert-warning">Thread not found</div>;
  }

  return (
    <div className="container">
      <div className="mb-3">
        <Link to={`/forums/${forumId}/threads`} className="btn btn-outline-secondary">
          ← Back to Forum
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <h2>{thread.title}</h2>
        </div>
        <div className="card-body">
          <p className="card-text">{thread.content}</p>
          <div className="text-muted">
            <small>Posted by {thread.createdBy.name} on {new Date(thread.createdAt).toLocaleString()}</small>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.map((comment) => (
          <div key={comment.id} className="card mb-3">
            <div className="card-body">
              <p className="card-text">{comment.content}</p>
              <div className="text-muted">
                <small>Posted by {comment.createdBy} on {new Date(comment.createdAt).toLocaleString()}</small>
              </div>
            </div>
          </div>
        ))}

        {/* Comment Form - Only render if we have a valid post ID */}
        {userAuthenticated && post && post.id && (
          <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
        )}
      </div>
    </div>
  );
};

export default ThreadComponent; 