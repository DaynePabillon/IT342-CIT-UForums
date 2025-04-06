import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated, logout, getUserProfile, isAdmin } from '../services/authService';

const Navbar: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication on component mount and route change
    const checkAuth = () => {
      try {
        const authed = isAuthenticated();
        setAuthenticated(authed);
        
        if (authed) {
          const profile = getUserProfile();
          console.log('User profile in Navbar:', profile);
          if (profile && profile.name) {
            setUsername(profile.name);
            setAdmin(isAdmin());
          } else {
            // If we can't get the profile but token exists, fetch user data from backend
            // For now, use placeholder
            setUsername('User');
            setAdmin(false);
          }
        } else {
          setUsername('');
          setAdmin(false);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setAuthenticated(false);
        setUsername('');
        setAdmin(false);
      }
    };
    
    checkAuth();
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUsername('');
    setAdmin(false);
    // Navigate to login page using window.location instead of useNavigate
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          CIT Forums
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/forums">
                Forums
              </Link>
            </li>
            {admin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/forums/create">
                    Create Forum
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    Admin
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {authenticated ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    {username ? `Welcome, ${username}` : 'Welcome'}
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    My Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 