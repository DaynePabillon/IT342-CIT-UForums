import React, { useState, useEffect } from 'react';
import { getUserProfile, isAuthenticated } from '../services/authService';
import { updateProfile, getUserThreads, getUserComments } from '../services/userService';

interface UserThreadData {
  id: number;
  title: string;
  forumId: number;
  forumTitle: string;
  commentCount: number;
  createdAt: string;
}

interface UserCommentData {
  id: number;
  content: string;
  threadId: number;
  threadTitle: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [threads, setThreads] = useState<UserThreadData[]>([]);
  const [comments, setComments] = useState<UserCommentData[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'threads' | 'comments'>('profile');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Load user data
    const loadUserData = async () => {
      setLoading(true);
      try {
        const profile = getUserProfile();
        if (profile) {
          setProfileData({
            username: profile.username || 'User',
            email: profile.email || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          });
        } else {
          setError('Could not load profile data. Please try logging out and back in.');
        }

        // Load user threads and comments
        try {
          const threadsData = await getUserThreads();
          setThreads(threadsData?.content || []);
        } catch (threadErr) {
          console.error('Error loading threads:', threadErr);
          setThreads([]);
        }

        try {
          const commentsData = await getUserComments();
          setComments(commentsData?.content || []);
        } catch (commentErr) {
          console.error('Error loading comments:', commentErr);
          setComments([]);
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
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      });
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">My Profile</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'threads' ? 'active' : ''}`}
            onClick={() => setActiveTab('threads')}
          >
            My Threads ({threads.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            My Comments ({comments.length})
          </button>
        </li>
      </ul>

      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-body">
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.username}
                  readOnly
                  disabled
                />
                <small className="text-muted">Username cannot be changed</small>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  readOnly={!editMode}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  readOnly={!editMode}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  readOnly={!editMode}
                />
              </div>

              <div className="d-flex justify-content-end">
                {!editMode ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'threads' && (
        <div className="card">
          <div className="card-body">
            {threads.length === 0 ? (
              <p className="text-center">You haven't created any threads yet</p>
            ) : (
              <div className="list-group">
                {threads.map(thread => (
                  <a
                    key={thread.id}
                    href={`/forums/${thread.forumId}/threads/${thread.id}`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{thread.title}</h5>
                      <small>{new Date(thread.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1">In forum: {thread.forumTitle}</p>
                    <small>{thread.commentCount} comments</small>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="card">
          <div className="card-body">
            {comments.length === 0 ? (
              <p className="text-center">You haven't posted any comments yet</p>
            ) : (
              <div className="list-group">
                {comments.map(comment => (
                  <a
                    key={comment.id}
                    href={`/forums/threads/${comment.threadId}`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex w-100 justify-content-between">
                      <h6 className="mb-1">Re: {comment.threadTitle}</h6>
                      <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1">{comment.content}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 