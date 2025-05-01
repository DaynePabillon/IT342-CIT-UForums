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
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          CIT Forums
        </Link>
        {/* Add Report link */}
        {authenticated && (
          <Link className="nav-link text-white" to="#" onClick={() => setShowContentSelector(true)}>
            Report
          </Link>
        )}
        {/* Add Forums link */}
        <Link className="nav-link text-white" to="/forums">
          Forums
        </Link>
        {/* Add Admin Dashboard link (only visible to admins) */}
        {admin && (
          <Link className="nav-link text-white" to="/admin/dashboard">
            Admin Dashboard
          </Link>
        )}
        
        {/* Right side of navbar */}
        <div className="ms-auto d-flex">
          {authenticated ? (
            <>
              <span className="nav-link text-white">
                Welcome, {username}
              </span>
              <Link className="nav-link text-white" to="/profile">
                My Profile
              </Link>
              <Link className="nav-link text-white" to="#" onClick={handleLogout}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link className="nav-link text-white" to="/login">
                Login
              </Link>
              <Link className="nav-link text-white" to="/register">
                Register
              </Link>
            </>
          )}
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