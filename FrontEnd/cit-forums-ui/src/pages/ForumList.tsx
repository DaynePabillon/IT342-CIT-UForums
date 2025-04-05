import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getForums, Forum, ForumCategory, cleanupGeneralForums } from '../services/forumService';
import { isAuthenticated, isAdmin } from '../services/authService';
import '../styles/custom.css';

const ForumList: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const location = useLocation();

  const fetchForums = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching forums...');
      const response = await getForums(currentPage);
      console.log('Forums fetched:', response);
      if (response && response.content) {
        setForums(response.content);
        setTotalPages(response.totalPages);
      } else {
        setForums([]);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('Error in ForumList component:', err);
      setError(err.message || 'Failed to load forums');
      setForums([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Fetch forums when component mounts and when currentPage changes
  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  // Handle navigation state (refresh and messages)
  useEffect(() => {
    if (location.state) {
      const state = location.state as { refresh?: boolean; message?: string };
      
      if (state.refresh) {
        console.log('Refreshing forums due to navigation state');
        fetchForums();
      }
      
      if (state.message) {
        setSuccessMessage(state.message);
        // Clear the message after 5 seconds
        const timer = setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location, fetchForums]);

  // Add a refresh button handler
  const handleRefresh = () => {
    console.log('Manually refreshing forums...');
    fetchForums();
  };

  const getCategoryBadgeClass = (categoryName: string): string => {
    switch (categoryName) {
      case ForumCategory.ANNOUNCEMENTS:
        return 'bg-danger';
      case ForumCategory.EVENTS:
        return 'bg-primary';
      case ForumCategory.ACADEMIC:
        return 'bg-success';
      case ForumCategory.FREEDOM_WALL:
        return 'bg-warning';
      case ForumCategory.CONFESSION:
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getCategoryDisplayName = (categoryName: string): string => {
    switch (categoryName) {
      case ForumCategory.ANNOUNCEMENTS:
        return 'Announcements';
      case ForumCategory.EVENTS:
        return 'Events';
      case ForumCategory.ACADEMIC:
        return 'Academic';
      case ForumCategory.FREEDOM_WALL:
        return 'Freedom Wall';
      case ForumCategory.CONFESSION:
        return 'Confession';
      default:
        return 'General';
    }
  };

  const filteredForums = selectedCategory
    ? forums.filter(forum => forum.categoryName === selectedCategory)
    : forums;

  if (loading) {
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
      <div className="alert alert-danger">
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Forums</h2>
        <div>
          {isAuthenticated() && (
            <Link to="/forums/create" className="btn btn-primary me-2">
              Create New Forum
            </Link>
          )}
          {isAdmin() && (
            <button 
              className="btn btn-warning me-2"
              onClick={async () => {
                try {
                  const result = await cleanupGeneralForums();
                  setSuccessMessage(result);
                  fetchForums();
                } catch (err: any) {
                  setError(err.message || 'Failed to cleanup forums');
                }
              }}
            >
              Cleanup General Forums
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {Object.values(ForumCategory).map((category) => (
              <button
                key={category}
                type="button"
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryDisplayName(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        {filteredForums.map((forum) => (
          <div key={forum.id} className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">
                  <Link to={`/forums/${forum.id}/threads`} className="text-decoration-none">
                    {forum.title}
                  </Link>
                </h5>
                <p className="card-text">{forum.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className={`badge ${getCategoryBadgeClass(forum.categoryName)} me-2`}>
                      {getCategoryDisplayName(forum.categoryName)}
                    </span>
                    <Link 
                      to={`/forums/${forum.id}/threads`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Threads
                    </Link>
                  </div>
                  <small className="text-muted">
                    {forum.threadCount} {forum.threadCount === 1 ? 'thread' : 'threads'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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

export default ForumList;