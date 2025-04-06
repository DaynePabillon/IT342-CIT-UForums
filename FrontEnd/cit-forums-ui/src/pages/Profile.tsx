import React, { useState, useEffect } from 'react';
import { getUserProfile, isAuthenticated, setUserProfile } from '../services/authService';
import { updateProfile, getUserThreads, getUserComments, getCurrentUser } from '../services/userService';
import { Link } from 'react-router-dom';

interface UserThreadData {
  id: number;
  title: string;
  forumId: number;
  forumTitle: string;
  commentCount: number;
  createdAt: string;
  content: string;
}

interface UserCommentData {
  id: number;
  content: string;
  threadId: number;
  threadTitle: string;
  forumId: number;
  createdAt: string;
}

interface ProfileData {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
  });
  const [threads, setThreads] = useState<UserThreadData[]>([]);
  const [comments, setComments] = useState<UserCommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadUserContent = async () => {
    try {
      const [threadsData, commentsData] = await Promise.all([
        getUserThreads(),
        getUserComments()
      ]);
      setThreads(threadsData?.content || []);
      setComments(commentsData?.content || []);
    } catch (err) {
      console.error('Error loading user content:', err);
      setError('Failed to load your content. Please try again.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      setError('Please log in to view your profile');
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setProfileData({
            name: currentUser.name || 'User',
            email: currentUser.email || '',
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
          });
          await loadUserContent();
        } else {
          setError('Could not load profile data. Please try logging out and back in.');
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const updatedUser = await updateProfile(profileData);
      setUserProfile(updatedUser); // Update local storage
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh user data
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setProfileData({
          name: currentUser.name || 'User',
          email: currentUser.email || '',
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
        });
      }
      
      // Refresh content
      await loadUserContent();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'threads' ? 'active' : ''}`}
              onClick={() => setActiveTab('threads')}
            >
              My Threads ({threads.length})
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              My Comments ({comments.length})
            </button>
          </div>
        </div>

        <div className="col-md-9">
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}
          
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Profile Information</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div className="card-body">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div>
                    <p><strong>Name:</strong> {profileData.name}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>First Name:</strong> {profileData.firstName}</p>
                    <p><strong>Last Name:</strong> {profileData.lastName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'threads' && (
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">My Threads</h3>
              </div>
              <div className="card-body bg-white">
                {threads.length === 0 ? (
                  <p className="text-center text-muted">You haven't created any threads yet</p>
                ) : (
                  <div className="list-group">
                    {threads.map(thread => (
                      <Link
                        key={thread.id}
                        to={`/forums/${thread.forumId}/threads/${thread.id}`}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center">
                          <h5 className="mb-1 text-primary">{thread.title}</h5>
                          <small className="text-muted">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-1 text-dark">{thread.content?.substring(0, 150)}...</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Forum: {thread.forumTitle}</small>
                          <span className="badge bg-secondary">
                            {thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="card">
              <div className="card-header">
                <h3 className="mb-0">My Comments</h3>
              </div>
              <div className="card-body bg-white">
                {comments.length === 0 ? (
                  <p className="text-center text-muted">You haven't posted any comments yet</p>
                ) : (
                  <div className="list-group">
                    {comments.map(comment => (
                      <Link
                        key={comment.id}
                        to={`/threads/${comment.threadId}`}
                        className="list-group-item list-group-item-action"
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center">
                          <h6 className="mb-1 text-primary">Re: {comment.threadTitle}</h6>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <p className="mb-1 text-dark">{comment.content}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 