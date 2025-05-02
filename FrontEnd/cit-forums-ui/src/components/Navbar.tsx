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
          
          // Check for admin role using multiple approaches
          // 1. Check if roles array includes ROLE_ADMIN (using the type-safe approach)
          // 2. Use the isAdmin helper function which handles different role formats
          const isAdminUser = 
            (Array.isArray(currentUser.roles) && currentUser.roles.includes('ROLE_ADMIN')) || 
            isAdmin();
          
          console.log('Is admin user:', isAdminUser);
          setAdmin(isAdminUser);
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
    <nav className="navbar navbar-dark" style={{ backgroundColor: '#800000', padding: '0.5rem 1rem' }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <Link className="navbar-brand me-3" to="/" style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.5rem', marginRight: '1.5rem' }}>
            CIT Forums
          </Link>
          
          {authenticated && (
            <Link 
              className="nav-link text-white me-3" 
              to="#" 
              onClick={() => setShowContentSelector(true)}
              style={{ marginRight: '1.5rem' }}
            >
              <i className="bi bi-flag me-1"></i>
              Report
            </Link>
          )}
          
          <Link 
            className="nav-link text-white me-3" 
            to="/forums"
            style={{ marginRight: '1.5rem' }}
          >
            Forums
          </Link>
          
          {admin && (
            <Link 
              className="nav-link text-white me-3" 
              to="/admin/dashboard"
              style={{ marginRight: '1.5rem' }}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
        
        <div className="d-flex align-items-center">
          {authenticated ? (
            <>
              <span className="text-white me-3" style={{ marginRight: '1rem' }}>
                Welcome, {username}
              </span>
              <Link className="text-white me-3" to="/profile" style={{ marginRight: '1rem', textDecoration: 'none' }}>
                My Profile
              </Link>
              <Link className="text-white" to="#" onClick={handleLogout} style={{ textDecoration: 'none' }}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link className="text-white me-3" to="/login" style={{ marginRight: '1rem', textDecoration: 'none' }}>
                Login
              </Link>
              <Link className="text-white" to="/register" style={{ textDecoration: 'none' }}>
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