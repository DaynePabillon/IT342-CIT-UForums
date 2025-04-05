import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Forum, ForumCategory, ForumRequest, getForumById, updateForum } from '../services/forumService';

const ForumForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [forum, setForum] = useState<Forum | null>(null);
  const [formData, setFormData] = useState<ForumRequest>({
    title: '',
    description: '',
    categoryName: ForumCategory.GENERAL
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForum = async () => {
      if (!id) return;
      
      try {
        const forum = await getForumById(parseInt(id));
        setForum(forum);
        setFormData({
          title: forum.title,
          description: forum.description,
          categoryName: forum.categoryName
        });
      } catch (err) {
        setError('Failed to load forum');
      }
    };

    fetchForum();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setLoading(true);
    try {
      await updateForum(parseInt(id), formData);
      navigate(`/forums/${id}`);
    } catch (err) {
      setError('Failed to update forum');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!forum) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Edit Forum</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input 
            type="text" 
            className="form-control" 
            id="title" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="categoryName" className="form-label">Category</label>
          <select 
            className="form-control" 
            id="categoryName" 
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            required
          >
            {Object.values(ForumCategory).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea 
            className="form-control" 
            id="description" 
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Forum'}
        </button>
      </form>
    </div>
  );
};

export default ForumForm; 