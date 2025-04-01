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
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import {
  Forum as ForumIcon,
  Search as SearchIcon,
  Comment as CommentIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForumsListPage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For demonstration, use mock data
        // In a real app, you would fetch from your API:
        // const response = await axios.get('/api/forums');
        // setForums(response.data);
        
        // Mock data
        const mockForums = [
          { 
            id: '1', 
            name: 'General Discussion', 
            description: 'General topics related to CIT', 
            threadCount: 54, 
            postCount: 128,
            latestThread: {
              title: 'Welcome to CIT Forums!',
              author: 'admin',
              createdAt: '2023-06-06T08:45:00Z'
            }
          },
          { 
            id: '2', 
            name: 'Programming Help', 
            description: 'Get help with your programming questions', 
            threadCount: 32, 
            postCount: 89,
            latestThread: {
              title: 'Tips for learning Java programming',
              author: 'javafan23',
              createdAt: '2023-06-01T10:24:00Z'
            }
          },
          { 
            id: '3', 
            name: 'Project Showcase', 
            description: 'Share your projects with the community', 
            threadCount: 18, 
            postCount: 45,
            latestThread: {
              title: 'My new web development portfolio',
              author: 'webdev123',
              createdAt: '2023-06-03T14:35:00Z'
            }
          },
          { 
            id: '4', 
            name: 'Career Advice', 
            description: 'Discuss career paths and opportunities in IT', 
            threadCount: 27, 
            postCount: 73,
            latestThread: {
              title: 'Preparing for technical interviews',
              author: 'tech_seeker',
              createdAt: '2023-06-05T09:12:00Z'
            }
          },
          { 
            id: '5', 
            name: 'Technology News', 
            description: 'Discuss the latest trends and news in technology', 
            threadCount: 42, 
            postCount: 96,
            latestThread: {
              title: 'New JavaScript framework released',
              author: 'js_enthusiast',
              createdAt: '2023-06-08T11:30:00Z'
            }
          },
          { 
            id: '6', 
            name: 'Networking', 
            description: 'Discussions about computer networking and infrastructure', 
            threadCount: 15, 
            postCount: 37,
            latestThread: {
              title: 'Understanding TCP/IP fundamentals',
              author: 'network_guru',
              createdAt: '2023-06-04T13:15:00Z'
            }
          },
          { 
            id: '7', 
            name: 'Cybersecurity', 
            description: 'Topics related to information security and privacy', 
            threadCount: 23, 
            postCount: 58,
            latestThread: {
              title: 'Best practices for securing a web application',
              author: 'security_expert',
              createdAt: '2023-06-07T16:45:00Z'
            }
          },
          { 
            id: '8', 
            name: 'Database Systems', 
            description: 'Discuss database design, optimization and management', 
            threadCount: 19, 
            postCount: 41,
            latestThread: {
              title: 'NoSQL vs SQL databases: when to use which?',
              author: 'data_architect',
              createdAt: '2023-06-02T10:05:00Z'
            }
          }
        ];
        
        setForums(mockForums);
        setFilteredForums(mockForums);
      } catch (err) {
        console.error('Error fetching forums:', err);
        setError('Failed to load forums. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Filter forums based on search term
    if (searchTerm.trim() === '') {
      setFilteredForums(forums);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = forums.filter(forum => 
        forum.name.toLowerCase().includes(term) || 
        forum.description.toLowerCase().includes(term)
      );
      setFilteredForums(filtered);
    }
  }, [searchTerm, forums]);
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleCreateForum = () => {
    // In a real app, this would navigate to a forum creation page
    // or open a dialog to create a new forum
    alert('Forum creation would be implemented here');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Forums
        </Typography>
        
        {isAuthenticated && currentUser?.isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleCreateForum}
          >
            Create Forum
          </Button>
        )}
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search forums..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {filteredForums.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No forums found matching your search criteria.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {filteredForums.map((forum) => (
          <Grid item xs={12} key={forum.id}>
            <Card variant="outlined">
              <CardActionArea 
                component={Link} 
                to={`/forums/${forum.id}`}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 56, 
                        height: 56, 
                        mr: 2 
                      }}
                    >
                      <ForumIcon />
                    </Avatar>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {forum.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {forum.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          icon={<ForumIcon fontSize="small" />} 
                          label={`${forum.threadCount} Threads`} 
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          icon={<CommentIcon fontSize="small" />} 
                          label={`${forum.postCount} Posts`} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    {forum.latestThread && (
                      <Box 
                        sx={{ 
                          ml: 2, 
                          minWidth: 200,
                          display: { xs: 'none', sm: 'block' },
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                          pl: 2
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Latest Thread
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {forum.latestThread.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          by {forum.latestThread.author} on {formatDate(forum.latestThread.createdAt)}
                        </Typography>
                      </Box>
                    )}
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

export default ForumsListPage; 