import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Divider,
  Avatar,
  Stack,
  Paper,
  Button,
  Container,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Forum as ForumIcon, 
  Comment as CommentIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const [forums, setForums] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For demonstration, use mock data
        // In a real app, you would fetch from your API:
        // const forumsResponse = await axios.get('/api/forums');
        // const threadsResponse = await axios.get('/api/threads/recent');
        
        // Mock data
        const mockForums = [
          { id: 1, name: 'General Discussion', description: 'General topics related to CIT', threadCount: 54, postCount: 128 },
          { id: 2, name: 'Programming Help', description: 'Get help with your programming questions', threadCount: 32, postCount: 89 },
          { id: 3, name: 'Project Showcase', description: 'Share your projects with the community', threadCount: 18, postCount: 45 },
          { id: 4, name: 'Career Advice', description: 'Discuss career paths and opportunities in IT', threadCount: 27, postCount: 73 }
        ];
        
        const mockThreads = [
          { id: 1, title: 'Tips for learning Java programming', author: 'javafan23', createdAt: '2023-06-01T10:24:00Z', replyCount: 12, forumId: 2 },
          { id: 2, title: 'My new web development portfolio', author: 'webdev123', createdAt: '2023-06-03T14:35:00Z', replyCount: 8, forumId: 3 },
          { id: 3, title: 'Preparing for technical interviews', author: 'tech_seeker', createdAt: '2023-06-05T09:12:00Z', replyCount: 15, forumId: 4 },
          { id: 4, title: 'Welcome to CIT Forums!', author: 'admin', createdAt: '2023-06-06T08:45:00Z', replyCount: 7, forumId: 1 }
        ];
        
        setForums(mockForums);
        setRecentThreads(mockThreads);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#2196f3',
          color: '#fff',
          mb: 4,
          py: 6,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                Welcome to CIT Forums
              </Typography>
              <Typography variant="h6" color="inherit" paragraph>
                Connect with the CIT community, share knowledge, discuss projects, and find answers to your questions.
              </Typography>
              {!isAuthenticated && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  component={Link} 
                  to="/register"
                  sx={{ mt: 2 }}
                >
                  Join the Community
                </Button>
              )}
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <ForumIcon sx={{ fontSize: 200, opacity: 0.3 }} />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Forums List */}
      <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
        Forums
      </Typography>
      <Grid container spacing={3}>
        {forums.map((forum) => (
          <Grid item xs={12} md={6} key={forum.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={`/forums/${forum.id}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ForumIcon />
                    </Avatar>
                    <Typography variant="h6" component="div">
                      {forum.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {forum.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack 
                    direction="row" 
                    spacing={3}
                    sx={{ 
                      mt: 2,
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ForumIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{forum.threadCount} Threads</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{forum.postCount} Posts</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Threads */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6, mb: 3 }}>
        <Typography variant="h4">Recent Discussions</Typography>
        <Button 
          variant="outlined" 
          endIcon={<ArrowForwardIcon />}
          component={Link}
          to="/forums"
        >
          View All
        </Button>
      </Box>
      <Grid container spacing={2}>
        {recentThreads.map((thread) => (
          <Grid item xs={12} key={thread.id}>
            <Card 
              sx={{ 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardActionArea 
                component={Link} 
                to={`/threads/${thread.id}`}
              >
                <CardContent>
                  <Typography variant="h6">{thread.title}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {thread.author}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(thread.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage; 