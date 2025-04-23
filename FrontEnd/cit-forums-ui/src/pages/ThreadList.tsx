import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { getForumById, ForumCategory } from '../services/forumService';
import { getThreadsByForumId, Thread } from '../services/threadService';
import { isAuthenticated } from '../services/authService';
import '../styles/custom.css';

interface ForumData {
  id: number;
  title: string;
  description: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  categoryName: string;
}

const ThreadList: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [forum, setForum] = useState<ForumData | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [validForumId, setValidForumId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!forumId) {
      setError('Invalid forum ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getThreadsByForumId(parseInt(forumId), currentPage);
      if (response && response.content) {
        setThreads(response.content);
        setTotalPages(response.totalPages);
      } else {
        setThreads([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load threads');
      setThreads([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [forumId, currentPage]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (location.state) {
      const state = location.state as { 
        refresh?: boolean; 
        message?: string; 
        updatedThreadId?: number;
        updatedCommentCount?: number;
      };
      
      if (state.refresh) {
        // If we have specific thread update info, update just that thread
        if (state.updatedThreadId && typeof state.updatedCommentCount === 'number') {
          setThreads(prevThreads => 
            prevThreads.map(thread => 
              thread.id === state.updatedThreadId 
                ? { ...thread, commentCount: state.updatedCommentCount as number } 
                : thread
            )
          );
        } else {
          // Otherwise do a full refresh
          fetchThreads();
        }
      }
      
      if (state.message) {
        setSuccessMessage(state.message);
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
      
      // Clear the location state after processing
      window.history.replaceState({}, document.title);
    }
  }, [location, fetchThreads]);

  useEffect(() => {
    if (forumId) {
      fetchThreads();
    }
  }, [forumId, fetchThreads]);

  useEffect(() => {
    if (currentPage) {
      fetchThreads();
    }
  }, [currentPage, fetchThreads]);

  useEffect(() => {
    // Validate forumId
    if (!forumId) {
      setError('Forum ID is missing');
      return;
    }
    
    const parsedId = Number(forumId);
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid forum ID: ${forumId}`);
      setError(`Invalid forum ID: ${forumId}`);
      return;
    }
    
    setValidForumId(parsedId);
    fetchForum(parsedId);
  }, [forumId]);

  // Add effect to refresh threads when component receives focus
  useEffect(() => {
    const handleFocus = () => {
      if (validForumId) {
        console.log('ThreadList received focus, refreshing threads');
        fetchThreads();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [validForumId, fetchThreads]);

  const fetchForum = async (id: number) => {
    try {
      console.log("Fetching forum with ID:", id);
      const data = await getForumById(id);
      console.log("Forum data received:", data);
      setForum(data);
    } catch (err: any) {
      console.error("Error fetching forum:", err);
      setError(err.response?.data?.message || 'Failed to load forum');
    }
  };
  
  const handleCreateThread = () => {
    if (validForumId) {
      navigate(`/forums/${validForumId}/threads/create`);
    } else {
      setError('Cannot create thread: invalid forum ID');
    }
  };

  const getCategoryBadgeClass = (category: ForumCategory): string => {
    switch (category) {
      case ForumCategory.FREEDOM_WALL:
        return 'badge-freedom-wall';
      case ForumCategory.CONFESSION:
        return 'badge-confession';
      case ForumCategory.ACADEMIC:
        return 'badge-academic';
      case ForumCategory.EVENTS:
        return 'badge-events';
      case ForumCategory.ANNOUNCEMENTS:
        return 'badge-announcements';
      default:
        return 'badge-general';
    }
  };

  const getCategoryDisplayName = (category: ForumCategory): string => {
    switch (category) {
      case ForumCategory.FREEDOM_WALL:
        return 'Freedom Wall';
      case ForumCategory.CONFESSION:
        return 'Confession';
      case ForumCategory.ACADEMIC:
        return 'Academic';
      case ForumCategory.EVENTS:
        return 'Events';
      case ForumCategory.ANNOUNCEMENTS:
        return 'Announcements';
      default:
        return 'General';
    }
  };

  if (loading && !forum) {
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/forums')}
          >
            Return to Forums
          </button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Forum not found</h4>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/forums')}
          >
            Return to Forums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="forum-header-card mb-4">
        <div className="forum-card">
          <div className="forum-card-header">
            <h2 className="mb-0">{forum.title}</h2>
            <span className={`category-badge ${getCategoryBadgeClass(forum.categoryName as ForumCategory)}`}>
              {getCategoryDisplayName(forum.categoryName as ForumCategory)}
            </span>
          </div>
          <div className="forum-card-body">
            <p className="mb-0">{forum.description}</p>
          </div>
        </div>
      </div>

      <div className="section-header mb-4">
        <h3>Threads</h3>
        {isAuthenticated() && (
          <button onClick={handleCreateThread} className="btn btn-primary">
            Create Thread
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      ) : threads.length === 0 ? (
        <div className="alert alert-info">
          <p className="mb-0">No threads in this forum yet.</p>
          {isAuthenticated() && (
            <p className="mb-0 mt-2">
              <button onClick={handleCreateThread} className="btn btn-primary btn-sm">
                Create the first thread
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="thread-list">
          {threads.map((thread) => (
            <div key={thread.id} className="thread-card mb-3">
              <div className="forum-card">
                <div className="forum-card-body">
                  <h5 className="thread-title">
                    <Link 
                      to={`/forums/${validForumId}/threads/${thread.id}`}
                      className="text-decoration-none"
                    >
                      {thread.title}
                    </Link>
                  </h5>
                  <p className="thread-content">
                    {thread.content.length > 150 
                      ? `${thread.content.substring(0, 150)}...` 
                      : thread.content}
                  </p>
                  <div className="thread-meta">
                    <div className="thread-author">
                      <small>
                        Posted by {thread.createdBy?.name || 'Unknown User'}
                      </small>
                    </div>
                    <div className="thread-stats">
                      <div className="stat">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
                          <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                        </svg>
                        {thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}
                      </div>
                      <div className="stat">
                        <small className="text-muted">
                          {new Date(thread.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="row mt-4">
          <div className="col">
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;