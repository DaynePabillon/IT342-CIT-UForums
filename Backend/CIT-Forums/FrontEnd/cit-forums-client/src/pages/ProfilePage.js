import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  Tabs, 
  Tab, 
  Button, 
  TextField, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Person as PersonIcon,
  Forum as ForumIcon,
  Comment as CommentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || 'John',
    lastName: currentUser?.lastName || 'Doe',
    email: currentUser?.email || 'johndoe@example.com',
    bio: currentUser?.bio || 'CIT student passionate about technology and learning new skills.'
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Mock data for demonstration
  const userThreads = [
    { id: 101, title: 'How to optimize database queries?', forum: 'Programming Help', createdAt: '2023-06-02T10:24:00Z', replyCount: 7 },
    { id: 102, title: 'My experience with React and Next.js', forum: 'Project Showcase', createdAt: '2023-06-05T14:35:00Z', replyCount: 4 },
    { id: 103, title: 'Looking for study group for IT342', forum: 'General Discussion', createdAt: '2023-06-08T09:12:00Z', replyCount: 3 }
  ];
  
  const userReplies = [
    { id: 201, threadId: 50, threadTitle: 'Tips for learning Java programming', content: 'I found the official documentation to be really helpful when starting out.', createdAt: '2023-06-03T11:42:00Z' },
    { id: 202, threadId: 55, threadTitle: 'Preparing for technical interviews', content: 'Practice on LeetCode helped me a lot with algorithm questions.', createdAt: '2023-06-07T15:31:00Z' },
    { id: 203, threadId: 60, threadTitle: 'Which IDE for Python development?', content: 'I personally prefer PyCharm for larger projects and VS Code for quick scripts.', createdAt: '2023-06-09T08:55:00Z' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleCancel = () => {
    setEditing(false);
    // Reset form data to current user data
    setFormData({
      firstName: currentUser?.firstName || 'John',
      lastName: currentUser?.lastName || 'Doe',
      email: currentUser?.email || 'johndoe@example.com',
      bio: currentUser?.bio || 'CIT student passionate about technology and learning new skills.'
    });
    setSuccessMessage(null);
    setErrorMessage(null);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // In a real app, you would call your API:
      // await axios.put('/api/user/profile', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
              >
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              {!editing && (
                <>
                  <Typography variant="h5" align="center">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {formData.email}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                </>
              )}
              
              {editing && (
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {successMessage}
                    </Alert>
                  )}
                  
                  {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errorMessage}
                    </Alert>
                  )}
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={saving}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={saving}
                      />
                    </Grid>
                  </Grid>
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    required
                    disabled={saving}
                  />
                  
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={4}
                    disabled={saving}
                  />
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      variant="contained" 
                      startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            
            {!editing && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph>
                  {formData.bio}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Member since {formatDate('2023-01-15T00:00:00Z')}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* Activity Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="My Threads" icon={<ForumIcon />} iconPosition="start" />
              <Tab label="My Replies" icon={<CommentIcon />} iconPosition="start" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              {userThreads.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {userThreads.map((thread, index) => (
                    <React.Fragment key={thread.id}>
                      <ListItem 
                        alignItems="flex-start"
                        component={Link}
                        to={`/threads/${thread.id}`}
                        sx={{ 
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <ForumIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={thread.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {thread.forum}
                              </Typography>
                              {` — Posted on ${formatDate(thread.createdAt)} • ${thread.replyCount} replies`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < userThreads.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  You haven't created any threads yet.
                </Typography>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {userReplies.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {userReplies.map((reply, index) => (
                    <React.Fragment key={reply.id}>
                      <ListItem 
                        alignItems="flex-start"
                        component={Link}
                        to={`/threads/${reply.threadId}`}
                        sx={{ 
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <CommentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Re: ${reply.threadTitle}`}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 0.5, mb: 0.5 }}
                              >
                                {reply.content.length > 100 
                                  ? `${reply.content.substring(0, 100)}...` 
                                  : reply.content}
                              </Typography>
                              {`Posted on ${formatDate(reply.createdAt)}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      {index < userReplies.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  You haven't replied to any threads yet.
                </Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage; 