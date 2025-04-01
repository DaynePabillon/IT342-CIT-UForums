import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  List, 
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Card,
  CardContent,
  Breadcrumbs,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Forum as ForumIcon, 
  Add as AddIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Schedule as ScheduleIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForumPage = () => {
  const { forumId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For demonstration, use mock data
        // In a real app, you would fetch from your API:
        // const forumResponse = await axios.get(`/api/forums/${forumId}`);
        // const threadsResponse = await axios.get(`/api/forums/${forumId}/threads`);
        
        // Mock data
        const mockForums = [
          { id: '1', name: 'General Discussion', description: 'General topics related to CIT', threadCount: 54, postCount: 128 },
          { id: '2', name: 'Programming Help', description: 'Get help with your programming questions', threadCount: 32, postCount: 89 },
          { id: '3', name: 'Project Showcase', description: 'Share your projects with the community', threadCount: 18, postCount: 45 },
          { id: '4', name: 'Career Advice', description: 'Discuss career paths and opportunities in IT', threadCount: 27, postCount: 73 }
        ];
        
        const mockThreads = {
          '1': [
            { id: 4, title: 'Welcome to CIT Forums!', author: 'admin', createdAt: '2023-06-06T08:45:00Z', replyCount: 7, isSticky: true },
            { id: 8, title: 'Community Guidelines', author: 'moderator', createdAt: '2023-06-02T11:30:00Z', replyCount: 3, isSticky: true },
            { id: 12, title: 'What are you working on this week?', author: 'curious_student', createdAt: '2023-06-08T14:22:00Z', replyCount: 9 },
            { id: 16, title: 'Upcoming events for CIT students', author: 'event_organizer', createdAt: '2023-06-07T09:15:00Z', replyCount: 5 }
          ],
          '2': [
            { id: 1, title: 'Tips for learning Java programming', author: 'javafan23', createdAt: '2023-06-01T10:24:00Z', replyCount: 12, isSticky: true },
            { id: 5, title: 'Help with Python recursion', author: 'py_newbie', createdAt: '2023-06-05T16:40:00Z', replyCount: 8 },
            { id: 9, title: 'Best resources for learning C#', author: 'sharp_coder', createdAt: '2023-06-04T13:12:00Z', replyCount: 6 },
            { id: 13, title: 'JavaScript async/await explained', author: 'js_guru', createdAt: '2023-06-03T11:05:00Z', replyCount: 10 }
          ],
          '3': [
            { id: 2, title: 'My new web development portfolio', author: 'webdev123', createdAt: '2023-06-03T14:35:00Z', replyCount: 8 },
            { id: 6, title: 'Check out my mobile app for fitness tracking', author: 'app_developer', createdAt: '2023-06-06T17:50:00Z', replyCount: 4 },
            { id: 10, title: 'Database project for small businesses', author: 'db_specialist', createdAt: '2023-06-02T15:25:00Z', replyCount: 7 },
            { id: 14, title: 'My experience developing with React Native', author: 'mobile_dev', createdAt: '2023-06-07T12:10:00Z', replyCount: 6 }
          ],
          '4': [
            { id: 3, title: 'Preparing for technical interviews', author: 'tech_seeker', createdAt: '2023-06-05T09:12:00Z', replyCount: 15, isSticky: true },
            { id: 7, title: 'Resume tips for new graduates', author: 'career_advisor', createdAt: '2023-06-04T10:30:00Z', replyCount: 9 },
            { id: 11, title: 'Negotiating your first IT salary', author: 'salary_coach', createdAt: '2023-06-08T08:45:00Z', replyCount: 11 },
            { id: 15, title: 'Remote work opportunities in IT', author: 'remote_worker', createdAt: '2023-06-01T14:20:00Z', replyCount: 12 }
          ]
        };
        
        const foundForum = mockForums.find(f => f.id === forumId);
        
        if (!foundForum) {
          throw new Error('Forum not found');
        }
        
        setForum(foundForum);
        setThreads(mockThreads[forumId] || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load forum. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [forumId]);

  const handleOpenDialog = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewThreadTitle('');
    setNewThreadContent('');
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // For demonstration, just mock the creation
      // In a real app, you would call your API:
      // await axios.post(`/api/forums/${forumId}/threads`, {
      //   title: newThreadTitle,
      //   content: newThreadContent
      // });
      
      // Mock new thread
      const newThread = {
        id: Math.floor(Math.random() * 1000) + 20,
        title: newThreadTitle,
        author: 'current_user',
        createdAt: new Date().toISOString(),
        replyCount: 0
      };
      
      setThreads([newThread, ...threads]);
      handleCloseDialog();
      
      // Normally you would navigate to the new thread
      // navigate(`/threads/${newThreadId}`);
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </Link>
        <Link to="/forums" style={{ textDecoration: 'none', color: 'inherit' }}>
          Forums
        </Link>
        <Typography color="text.primary">{forum.name}</Typography>
      </Breadcrumbs>
      
      {/* Forum Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <ForumIcon />
            </Avatar>
            <Typography variant="h5">{forum.name}</Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {forum.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Chip 
                icon={<ForumIcon fontSize="small" />} 
                label={`${forum.threadCount} Threads`} 
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<CommentIcon fontSize="small" />} 
                label={`${forum.postCount} Posts`} 
                size="small"
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              New Thread
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Thread List */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Threads
      </Typography>
      
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {threads.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary="No threads yet" 
              secondary="Be the first to start a discussion in this forum."
            />
          </ListItem>
        ) : (
          threads.map((thread, index) => (
            <React.Fragment key={thread.id}>
              <ListItem 
                alignItems="flex-start"
                component={Link}
                to={`/threads/${thread.id}`}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  backgroundColor: thread.isSticky ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: thread.isSticky ? 'bold' : 'normal' }}>
                        {thread.title}
                      </Typography>
                      {thread.isSticky && (
                        <Chip 
                          label="Sticky" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1, height: 20 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                          <Typography variant="body2" color="text.secondary">
                            {thread.author}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <ScheduleIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(thread.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                          <Typography variant="body2" color="text.secondary">
                            {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                          </Typography>
                        </Box>
                      </Box>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < threads.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        )}
      </List>
      
      {/* New Thread Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Create New Thread</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Start a new discussion thread in {forum?.name}. Please provide a clear title and initial post content.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Thread Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="content"
            label="Initial Post Content"
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={newThreadContent}
            onChange={(e) => setNewThreadContent(e.target.value)}
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateThread} 
            variant="contained" 
            disabled={!newThreadTitle.trim() || !newThreadContent.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={24} /> : null}
          >
            {submitting ? 'Creating...' : 'Create Thread'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ForumPage; 