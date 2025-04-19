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

  const getCategoryBadgeClass = (categoryName: string): string => {
    switch (categoryName) {
      case ForumCategory.ANNOUNCEMENTS:
        return 'badge-announcements';
      case ForumCategory.EVENTS:
        return 'badge-events';
      case ForumCategory.ACADEMIC:
        return 'badge-academic';
      case ForumCategory.FREEDOM_WALL:
        return 'badge-freedom-wall';
      case ForumCategory.CONFESSION:
        return 'badge-confession';
      case ForumCategory.TECHNOLOGY:
        return 'badge-technology';
      case ForumCategory.SPORTS:
        return 'badge-sports';
      case ForumCategory.ENTERTAINMENT:
        return 'badge-entertainment';
      default:
        return 'badge-general';
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
      case ForumCategory.TECHNOLOGY:
        return 'Technology';
      case ForumCategory.SPORTS:
        return 'Sports';
      case ForumCategory.ENTERTAINMENT:
        return 'Entertainment';
      default:
        return 'General';
    }
  };

  const filteredForums = selectedCategory
    ? forums.filter(forum => forum.categoryName === selectedCategory)
    : forums;

  // Get categories that are actually in use
  const usedCategories = Array.from(new Set(forums.map(forum => forum.categoryName)));
  
  // Sort categories to ensure consistent order
  const sortedCategories = usedCategories.sort((a, b) => {
    // Put important categories first
    const order: Record<string, number> = {
      'ANNOUNCEMENTS': 1,
      'EVENTS': 2,
      'ACADEMIC': 3,
      'FREEDOM_WALL': 4,
      'CONFESSION': 5,
      'GENERAL': 6
    };
    
    return (order[a] || 99) - (order[b] || 99);
  });

  return (
    <div className="container mt-4">
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

      <div className="section-header mb-4">
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
        </div>
      </div>

      <div className="category-filter mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {sortedCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedCategory(category as ForumCategory)}
            >
              {getCategoryDisplayName(category)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="col">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      ) : filteredForums.length === 0 ? (
        <div className="col">
          <div className="alert alert-info" role="alert">
            No forums found.
          </div>
        </div>
      ) : (
        <div className="row">
          {filteredForums.map((forum) => (
            <div key={forum.id} className="col-md-6 mb-4">
              <div className="forum-card">
                <div className="forum-card-header">
                  <h5 className="m-0">{forum.title}</h5>
                  <span className={`category-badge ${getCategoryBadgeClass(forum.categoryName)}`}>{getCategoryDisplayName(forum.categoryName)}</span>
                </div>
                <div className="forum-card-body">
                  <p>{forum.description}</p>
                </div>
                <div className="forum-card-footer">
                  <Link 
                    to={`/forums/${forum.id}/threads`} 
                    className="btn btn-primary"
                  >
                    View Threads
                  </Link>
                  <div className="thread-stats">
                    <div className="stat">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                      </svg>
                      {forum.threadCount} {forum.threadCount === 1 ? 'thread' : 'threads'}
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

export default ForumList;