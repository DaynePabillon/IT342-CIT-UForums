import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveForums, Forum, ForumCategory } from '../services/forumService';
import { isAuthenticated } from '../services/authService';

const Home: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    fetchActiveForums();
    setAuthenticated(isAuthenticated());
  }, []);

  const fetchActiveForums = async () => {
    setLoading(true);
    try {
      console.log('Fetching active forums...');
      const data = await getActiveForums();
      console.log('Received forums data:', data);
      
      // Filter for Announcements, Events, and Academic forums
      const filteredForums = Array.isArray(data) 
        ? data.filter(forum => {
            console.log('Checking forum:', forum.title, 'Category:', forum.categoryName);
            return forum.categoryName === ForumCategory.ANNOUNCEMENTS || 
                   forum.categoryName === ForumCategory.EVENTS ||
                   forum.categoryName === ForumCategory.ACADEMIC;
          })
        : [];
      
      console.log('Filtered forums:', filteredForums);
      setForums(filteredForums);
    } catch (err: any) {
      console.error('Error fetching forums:', err);
      setError(err.response?.data?.message || 'Failed to load forums');
      setForums([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container">
      <div className="hero-section">
        <div className="content">
          <h1>Welcome to CIT-U Forums</h1>
          <p className="lead">
            Join discussions, share knowledge, and connect with peers in the Cebu Institute of Technology University community
          </p>
          <Link to="/forums" className="btn btn-secondary btn-lg">
            Browse All Forums
          </Link>
        </div>
      </div>

      <div className="section-header">
        <h2>Announcements, Events & Academic</h2>
        <Link to="/forums" className="btn btn-sm btn-outline-primary">View All</Link>
      </div>

      {forums.length === 0 ? (
        <div className="alert alert-info">
          <p>No announcements, events, or academic forums at the moment.</p>
          <p>Please check back later or browse all forums to see available content.</p>
        </div>
      ) : (
        <div className="row">
          {forums.map((forum) => (
            <div key={forum.id} className="col-md-6 mb-4">
              <div className="forum-card">
                <div className="forum-card-header">
                  <h5 className="m-0">{forum.title}</h5>
                  <span className="category-badge">{forum.categoryName}</span>
                </div>
                <div className="forum-card-body">
                  <p>{forum.description}</p>
                </div>
                <div className="forum-card-footer">
                  <Link to={`/forums/${forum.id}/threads`} className="btn btn-primary">
                    View Threads
                  </Link>
                  <div className="thread-stats">
                    <div className="stat">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
                        <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                      </svg>
                      {forum.threadCount} threads
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!authenticated && (
        <div className="cta-section">
          <h3>Join the CIT-U community today!</h3>
          <p>Sign up to participate in discussions, create threads, and connect with fellow students.</p>
          <div>
            <Link to="/register" className="btn btn-primary mx-2">
              Sign Up
            </Link>
            <Link to="/login" className="btn btn-outline-primary mx-2">
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;