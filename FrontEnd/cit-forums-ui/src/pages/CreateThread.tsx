import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createThread } from '../services/threadService';
import { getForumById, ForumCategory } from '../services/forumService';
import { isAuthenticated } from '../services/authService';
import '../styles/custom.css';

interface ForumData {
  id: number;
  title: string;
  description: string;
  categoryName: string;
}

const CreateThread: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<ForumData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { message: 'You must be logged in to create a thread' } });
      return;
    }

    console.log("Forum ID from URL params:", forumId);
    
    // Check if forumId exists and is valid
    if (!forumId) {
      setError('Forum ID is missing');
      return;
    }
    
    // Try to parse as number and validate
    const parsedId = Number(forumId);
    if (isNaN(parsedId) || parsedId <= 0) {
      setError(`Invalid forum ID: ${forumId}`);
      return;
    }

    // Fetch forum details
    const fetchForum = async () => {
      try {
        console.log("Fetching forum with ID:", parsedId);
        const data = await getForumById(parsedId);
        console.log("Forum data received:", data);
        setForum(data);
      } catch (err: any) {
        console.error("Error fetching forum:", err);
        setError('Failed to load forum details: ' + (err.message || 'Unknown error'));
      }
    };

    fetchForum();
  }, [forumId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user types
    if (formError[name as keyof typeof formError]) {
      setFormError({
        ...formError,
        [name]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { title?: string; content?: string } = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!forumId) {
      setError('Forum ID is missing');
      return;
    }
    
    const parsedId = Number(forumId);
    if (isNaN(parsedId) || parsedId <= 0) {
      setError(`Invalid forum ID: ${forumId}`);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating thread in forum:", parsedId);
      
      const threadData = {
        title: formData.title,
        content: formData.content,
        forumId: parsedId
      };
      
      console.log("Thread data:", threadData);
      
      const result = await createThread(threadData);
      console.log("Thread created successfully:", result);
      
      // Navigate to the thread list with a refresh flag
      navigate(`/forums/${parsedId}/threads`, { 
        state: { 
          refresh: true,
          message: 'Thread created successfully!' 
        },
        replace: true // This replaces the current history entry
      });
    } catch (err: any) {
      console.error("Error creating thread:", err);
      let errorMessage = 'Failed to create thread. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (category: ForumCategory): string => {
    switch (category) {
      case ForumCategory.FREEDOM_WALL:
        return 'badge-freedom-wall';
      case ForumCategory.CONFESSION:
        return 'badge-confession';
      case ForumCategory.ACADEMIC:
        return 'badge-academic';
      case ForumCategory.EVENTS:
        return 'badge-events';
      default:
        return 'badge-general';
    }
  };

  const getCategoryDisplayName = (category: ForumCategory): string => {
    switch (category) {
      case ForumCategory.FREEDOM_WALL:
        return 'Freedom Wall';
      case ForumCategory.CONFESSION:
        return 'Confession';
      case ForumCategory.ACADEMIC:
        return 'Academic';
      case ForumCategory.EVENTS:
        return 'Events';
      default:
        return 'General';
    }
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/forums')}
          >
            Return to Forums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-0">Create New Thread</h2>
                {forum && (
                  <span className={`badge ${getCategoryBadgeClass(forum.categoryName as ForumCategory)}`}>
                    {getCategoryDisplayName(forum.categoryName as ForumCategory)}
                  </span>
                )}
              </div>
              {forum && (
                <p className="mb-0 mt-2">
                  <small>in {forum.title}</small>
                </p>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="title" className="form-label">Thread Title</label>
                  <input
                    type="text"
                    className={`form-control ${formError.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a descriptive title for your thread"
                  />
                  {formError.title && (
                    <div className="invalid-feedback">{formError.title}</div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="content" className="form-label">Content</label>
                  <textarea
                    className={`form-control ${formError.content ? 'is-invalid' : ''}`}
                    id="content"
                    name="content"
                    rows={8}
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your thread content here..."
                  ></textarea>
                  {formError.content && (
                    <div className="invalid-feedback">{formError.content}</div>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/forums/${forumId}`)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Thread'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateThread; 