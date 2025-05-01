import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUserProfile, isAdmin } from '../services/authService';
import { getCurrentUser } from '../services/userService';
import ReportModal from './ReportModal';
import ReportContentSelector from './ReportContentSelector';

const Navbar: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [admin, setAdmin] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showContentSelector, setShowContentSelector] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<{
    type: 'THREAD' | 'COMMENT';
    id: number;
    title: string;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const updateUserProfile = async () => {
    try {
      const authed = isAuthenticated();
      setAuthenticated(authed);
      
      if (authed) {
        // Always fetch fresh user data from the server
        const currentUser = await getCurrentUser();
        console.log('Current user data:', currentUser);
        if (currentUser) {
          setUsername(currentUser.name || 'User');
          setAdmin(currentUser.roles?.includes('ROLE_ADMIN') || false);
        } else {
          setUsername('User');
          setAdmin(false);
        }
      } else {
        setUsername('');
        setAdmin(false);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      setAuthenticated(false);
      setUsername('');
      setAdmin(false);
    }
  };

  useEffect(() => {
    updateUserProfile();
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUsername('');
    setAdmin(false);
    navigate('/login');
  };

  const handleContentSelect = (type: 'THREAD' | 'COMMENT', id: number, title: string) => {
    setSelectedContent({ type, id, title });
    setShowContentSelector(false);
    setShowReportModal(true);
  };

  return (
    <nav className="navbar navbar-expand-lg">
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
            {authenticated && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link"
                  onClick={() => setShowContentSelector(true)}
                >
                  <i className="bi bi-flag me-1"></i>
                  Report
                </button>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/forums">
                Forums
              </Link>
            </li>
            {admin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin Dashboard
                </Link>
              </li>
            )}
            {isAdmin() && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin/reports">
                  <i className="bi bi-flag-fill me-1"></i>
                  Reports
                </Link>
              </li>
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
                  <button className="nav-link btn btn-link" onClick={handleLogout}>
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

      {/* Report Content Selector */}
      <ReportContentSelector
        show={showContentSelector}
        onClose={() => setShowContentSelector(false)}
        onSelect={handleContentSelect}
      />

      {/* Report Modal */}
      {selectedContent && (
        <ReportModal
          show={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedContent(null);
          }}
          contentType={selectedContent.type}
          contentId={selectedContent.id}
          contentTitle={selectedContent.title}
        />
      )}
    </nav>
  );
};

export default Navbar;