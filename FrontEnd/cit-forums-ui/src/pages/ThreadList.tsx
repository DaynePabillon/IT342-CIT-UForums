import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  category: ForumCategory;
}

const ThreadList: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<ForumData | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [validForumId, setValidForumId] = useState<number | null>(null);

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
    fetchThreads(parsedId);
  }, [forumId]);
  
  useEffect(() => {
    if (validForumId) {
      fetchThreads(validForumId);
    }
  }, [currentPage, validForumId]);

  // Add effect to refresh threads when component receives focus
  useEffect(() => {
    const handleFocus = () => {
      if (validForumId) {
        console.log('ThreadList received focus, refreshing threads');
        fetchThreads(validForumId);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [validForumId]);

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

  const fetchThreads = async (id: number) => {
    setLoading(true);
    try {
      console.log("Fetching threads for forum ID:", id, "page:", currentPage);
      const response = await getThreadsByForumId(id, currentPage);
      if (response && response.content) {
        setThreads(response.content);
        setTotalPages(response.totalPages || 0);
      } else {
        setThreads([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.response?.data?.message || 'Failed to load threads');
      setThreads([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
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
      default:
        return 'General';
    }
  };

  if (loading && !forum) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">{forum.title}</h2>
                <span className={`badge ${getCategoryBadgeClass(forum.category)}`}>
                  {getCategoryDisplayName(forum.category)}
                </span>
              </div>
              <p className="text-muted mb-0">{forum.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Threads</h3>
            {isAuthenticated() && (
              <button onClick={handleCreateThread} className="btn btn-primary">
                Create Thread
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
        <div className="row">
          {threads.map((thread) => (
            <div key={thread.id} className="col-12 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link 
                      to={`/forums/${validForumId}/threads/${thread.id}`}
                      className="text-decoration-none"
                    >
                      {thread.title}
                    </Link>
                  </h5>
                  <p className="card-text">
                    {thread.content.length > 150 
                      ? `${thread.content.substring(0, 150)}...` 
                      : thread.content}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">
                        Created by {thread.createdBy}
                      </small>
                    </div>
                    <div>
                      <span className="badge bg-secondary me-2">
                        {thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}
                      </span>
                      <small className="text-muted">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </small>
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

 