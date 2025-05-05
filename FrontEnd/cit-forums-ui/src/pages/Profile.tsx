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
  phoneNumber: string;
  city: string;
  province: string;
  address: string;
  bio: string;
  studentNumber: string;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    province: '',
    address: '',
    bio: '',
    studentNumber: ''
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
        // Always fetch fresh user data from the server
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Update the local state with fresh data
          setProfileData({
            name: currentUser.name || 'User',
            email: currentUser.email || '',
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            phoneNumber: currentUser.phoneNumber || '',
            city: currentUser.city || '',
            province: currentUser.province || '',
            address: currentUser.address || '',
            bio: currentUser.bio || '',
            studentNumber: currentUser.studentNumber || ''
          });
          
          // Also update the stored profile to ensure consistency
          setUserProfile(currentUser);
          
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Get current user profile to compare changes
      const currentUser = await getCurrentUser();
      console.log('Current user before update:', currentUser);
      
      // Only include fields that have changed
      const updatedFields: any = {};
      let hasChanges = false;
      
      if (profileData.name !== currentUser.name) {
        updatedFields.name = profileData.name;
        hasChanges = true;
      }
      
      if (profileData.email !== currentUser.email) {
        updatedFields.email = profileData.email;
        hasChanges = true;
      }
      
      if (profileData.firstName !== currentUser.firstName) {
        updatedFields.firstName = profileData.firstName;
        hasChanges = true;
      }
      
      if (profileData.lastName !== currentUser.lastName) {
        updatedFields.lastName = profileData.lastName;
        hasChanges = true;
      }
      
      if (profileData.phoneNumber !== currentUser.phoneNumber) {
        updatedFields.phoneNumber = profileData.phoneNumber;
        hasChanges = true;
      }
      
      if (profileData.city !== currentUser.city) {
        updatedFields.city = profileData.city;
        hasChanges = true;
      }
      
      if (profileData.province !== currentUser.province) {
        updatedFields.province = profileData.province;
        hasChanges = true;
      }
      
      if (profileData.address !== currentUser.address) {
        updatedFields.address = profileData.address;
        hasChanges = true;
      }
      
      if (profileData.bio !== currentUser.bio) {
        updatedFields.bio = profileData.bio;
        hasChanges = true;
      }

      if (profileData.studentNumber !== currentUser.studentNumber) {
        updatedFields.studentNumber = profileData.studentNumber;
        hasChanges = true;
      }
      
      console.log('Fields to update:', updatedFields, 'Has changes:', hasChanges);
      
      // Only proceed with update if there are changes
      if (hasChanges) {
        const updatedUser = await updateProfile(updatedFields);
        console.log('Updated user after API call:', updatedUser);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        
        // Update local state with the fresh data
        setProfileData({
          name: updatedUser.name || 'User',
          email: updatedUser.email || '',
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          phoneNumber: updatedUser.phoneNumber || '',
          city: updatedUser.city || '',
          province: updatedUser.province || '',
          address: updatedUser.address || '',
          bio: updatedUser.bio || '',
          studentNumber: updatedUser.studentNumber || ''
        });
      } else {
        setSuccess('No changes were made to your profile.');
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Navigation</h3>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile Information
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'threads' ? 'active' : ''}`}
                onClick={() => setActiveTab('threads')}
              >
                My Threads
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                My Comments
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              {success && <div className="alert alert-success">{success}</div>}
              
              {activeTab === 'profile' && (
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Profile Information</h3>
                    {!isEditing && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  <div className="card-body bg-white">
                    {isEditing ? (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            required
                          />
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
                            required
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
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="studentNumber" className="form-label">Student Number</label>
                          <input
                            type="text"
                            className="form-control"
                            id="studentNumber"
                            name="studentNumber"
                            value={profileData.studentNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="city" className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={profileData.city}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="province" className="form-label">Province</label>
                          <input
                            type="text"
                            className="form-control"
                            id="province"
                            name="province"
                            value={profileData.province}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="address" className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            name="address"
                            value={profileData.address}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="bio" className="form-label">Bio</label>
                          <textarea
                            className="form-control"
                            id="bio"
                            name="bio"
                            rows={3}
                            value={profileData.bio}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-primary">
                            Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <p><strong>Name:</strong> {profileData.name}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>First Name:</strong> {profileData.firstName}</p>
                        <p><strong>Last Name:</strong> {profileData.lastName}</p>
                        <p><strong>Phone Number:</strong> {profileData.phoneNumber}</p>
                        <p><strong>Student Number:</strong> {profileData.studentNumber}</p>
                        <p><strong>City:</strong> {profileData.city}</p>
                        <p><strong>Province:</strong> {profileData.province}</p>
                        <p><strong>Address:</strong> {profileData.address}</p>
                        <p><strong>Bio:</strong> {profileData.bio}</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;