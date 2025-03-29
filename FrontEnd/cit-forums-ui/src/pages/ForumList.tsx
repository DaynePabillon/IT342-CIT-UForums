import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getForums, Forum, ForumCategory } from '../services/forumService';
import { isAuthenticated } from '../services/authService';
import '../styles/custom.css';

const ForumList: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const location = useLocation();

  const fetchForums = async () => {
    try {
      setLoading(true);
      console.log('Fetching forums...');
      const response = await getForums(currentPage);
      console.log('Forums fetched:', response);
      if (response && response.content) {
        setForums(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setForums([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err: any) {
      console.error('Error in ForumList component:', err);
      setError(err.message || 'Failed to load forums');
      setForums([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch forums when component mounts and when currentPage changes
  useEffect(() => {
    fetchForums();
  }, [currentPage]);

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
  }, [location]);

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

  const filteredForums = selectedCategory
    ? forums.filter(forum => forum.category === selectedCategory)
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
      
      <div className="row mb-4">
        <div className="col">
          <h2>Forums</h2>
          {isAuthenticated() && (
            <Link to="/forums/create" className="btn btn-primary">
              Create New Forum
            </Link>
          )}
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
                  <Link to={`/forums/${forum.id}`} className="text-decoration-none">
                    {forum.title}
                  </Link>
                </h5>
                <p className="card-text">{forum.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className={`badge ${getCategoryBadgeClass(forum.category)} me-2`}>
                      {getCategoryDisplayName(forum.category)}
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