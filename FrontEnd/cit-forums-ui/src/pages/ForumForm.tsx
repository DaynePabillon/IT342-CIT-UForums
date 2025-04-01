import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getForumById, createForum, updateForum, ForumCategory } from '../services/forumService';

const ForumForm: React.FC = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ForumCategory.GENERAL
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForum = useCallback(async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      const forum = await getForumById(parseInt(forumId));
      setFormData({
        title: forum.title,
        description: forum.description,
        category: forum.category
      });
    } catch (err) {
      setError('Failed to load forum');
      console.error('Error loading forum:', err);
    } finally {
      setLoading(false);
    }
  }, [forumId]);

  useEffect(() => {
    if (forumId) {
      fetchForum();
    }
  }, [forumId, fetchForum]);

  // ... rest of the component code ...

  return (
    <div>
      {/* Add your form JSX here */}
    </div>
  );
};

export default ForumForm; 