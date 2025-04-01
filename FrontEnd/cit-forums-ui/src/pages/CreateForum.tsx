import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createForum, ForumCategory } from '../services/forumService';
import { isAuthenticated } from '../services/authService';

const CreateForum: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ForumCategory.GENERAL,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ title?: string; description?: string; category?: string }>({});

  // Check if user is authenticated and is an admin
  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { message: 'You must be logged in to create a forum' } });
      return;
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    const errors: { title?: string; description?: string; category?: string } = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating forum with data:", formData);
      const result = await createForum(formData);
      console.log("Forum created successfully:", result);
      
      // Navigate back to forums list with refresh flag
      navigate('/forums', { 
        state: { 
          refresh: true,
          message: 'Forum created successfully!' 
        },
        replace: true // This replaces the current history entry
      });
    } catch (err: any) {
      console.error("Error creating forum:", err);
      let errorMessage = 'Failed to create forum. Please try again.';
      
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

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2>Create New Forum</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="title">Forum Title</label>
                  <input
                    type="text"
                    className={`form-control ${formError.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                  {formError.title && (
                    <div className="invalid-feedback">{formError.title}</div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="category">Category</label>
                  <select
                    className={`form-control ${formError.category ? 'is-invalid' : ''}`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value={ForumCategory.GENERAL}>General</option>
                    <option value={ForumCategory.FREEDOM_WALL}>Freedom Wall</option>
                    <option value={ForumCategory.CONFESSION}>Confession</option>
                    <option value={ForumCategory.ACADEMIC}>Academic</option>
                    <option value={ForumCategory.EVENTS}>Events</option>
                  </select>
                  {formError.category && (
                    <div className="invalid-feedback">{formError.category}</div>
                  )}
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="description">Description</label>
                  <textarea
                    className={`form-control ${formError.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                  {formError.description && (
                    <div className="invalid-feedback">{formError.description}</div>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/forums')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Forum'}
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

export default CreateForum; 