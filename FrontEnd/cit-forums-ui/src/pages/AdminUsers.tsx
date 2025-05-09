import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUserStatus, User } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import '../styles/custom.css';
import '../styles/adminTheme.css';

const AdminUsers: React.FC = () => {
  // State Variables
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();
  const { checkAdminStatus } = useAuth();

  // Fetch Users on Mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Check admin status directly
        if (!checkAdminStatus()) {
          navigate('/admin/login');
          return;
        }
        setLoading(true);
        const response = await getUsers(page, pageSize);
        setUsers(response.content);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate, page, checkAdminStatus]);

  // Handle Ban User
  const handleBanUser = (user: User) => {
    setUserToBan(user);
    setShowConfirmModal(true);
  };

  // Confirm Ban User
  const confirmBanUser = async () => {
    if (!userToBan) return;
    
    try {
      await updateUserStatus(userToBan.id, 'BANNED');
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userToBan.id ? { ...user, status: 'BANNED' } : user
      ));
      
      setSuccessMessage(`User ${userToBan.username} has been banned`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to ban user');
      console.error(err);
    } finally {
      setShowConfirmModal(false);
      setUserToBan(null);
    }
  };

  // Cancel Ban User
  const cancelBanUser = () => {
    setShowConfirmModal(false);
    setUserToBan(null);
  };

  // Handle Activate User
  const handleActivateUser = async (userId: number) => {
    try {
      await updateUserStatus(userId, 'ACTIVE');
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'ACTIVE' } : user
      ));
      
      setSuccessMessage('User has been activated');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to activate user');
      console.error(err);
    }
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Navigate to Dashboard
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Navigate to Reports
  const navigateToReports = () => {
    navigate('/admin/reports');
  };

  // Loading Indicator
  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  // Error Message
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">User Management</h1>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="admin-alert-success">
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="admin-alert-close"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <div className="admin-card">
        <h2 className="admin-section-title">User List</h2>
        
        {users.length === 0 ? (
          <div className="admin-alert-info">No users found.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="admin-user-role">{user.role}</span>
                    </td>
                    <td>
                      <span className={`admin-user-status admin-user-status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {user.status === 'ACTIVE' ? (
                        <button 
                          onClick={() => handleBanUser(user)}
                          className="admin-btn-danger admin-btn-sm"
                        >
                          Ban User
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivateUser(user.id)}
                          className="admin-btn-success admin-btn-sm"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className={`admin-pagination-item ${page === 0 ? 'disabled' : ''}`}
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`admin-pagination-item ${page === pageNum ? 'active' : ''}`}
              >
                {pageNum + 1}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className={`admin-pagination-item ${page === totalPages - 1 ? 'disabled' : ''}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 className="admin-modal-title">Confirm Ban</h3>
            <p className="admin-modal-content">
              Are you sure you want to ban user {userToBan?.username}? This will prevent them from logging in.
            </p>
            <div className="admin-modal-actions">
              <button 
                onClick={confirmBanUser}
                className="admin-btn-danger"
              >
                Ban User
              </button>
              <button 
                onClick={cancelBanUser}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
