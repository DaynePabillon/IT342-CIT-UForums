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
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container">
      <div className="jumbotron text-center my-4">
        <h1>Welcome to CIT Forums</h1>
        <p className="lead">
          Join discussions, share knowledge, and connect with peers
        </p>
        <Link to="/forums" className="btn btn-lg">
          Browse All Forums
        </Link>
      </div>

      <h2 className="mb-4">Announcements, Events & Academic</h2>

      {forums.length === 0 ? (
        <div className="alert alert-info">
          <p>No announcements, events, or academic forums at the moment.</p>
          <p>Please check back later or browse all forums to see available content.</p>
        </div>
      ) : (
        <div className="row">
          {forums.map((forum) => (
            <div key={forum.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{forum.title}</h5>
                  <p className="card-text">{forum.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/forums/${forum.id}/threads`} className="btn">
                      View Threads
                    </Link>
                    <small className="text-muted">{forum.threadCount} threads</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!authenticated && (
        <div className="text-center mt-4">
          <Link to="/register" className="btn btn-lg mx-2">
            Sign Up
          </Link>
          <Link to="/login" className="btn btn-outline-secondary btn-lg mx-2">
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home; 