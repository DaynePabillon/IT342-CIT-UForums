import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Avatar, 
  Button, 
  TextField,
  Grid,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Breadcrumbs,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Comment as CommentIcon,
  Reply as ReplyIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  NavigateNext as NavigateNextIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ThreadPage = () => {
  const { threadId } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const replyFormRef = useRef(null);
  
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // For post actions
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For demonstration, use mock data
        // In a real app, you would fetch from your API:
        // const threadResponse = await axios.get(`/api/threads/${threadId}`);
        // const postsResponse = await axios.get(`/api/threads/${threadId}/posts`);
        
        // Mock data
        const mockThread = {
          id: Number(threadId),
          title: 'Tips for learning Java programming',
          forum: { id: 2, name: 'Programming Help' },
          author: 'javafan23',
          createdAt: '2023-06-01T10:24:00Z',
          viewCount: 143,
          isSticky: true
        };
        
        const mockPosts = [
          {
            id: 101,
            threadId: Number(threadId),
            content: "If you're getting started with Java, here are some tips that helped me:\n\n1. Practice coding every day, even if it's just for 30 minutes\n2. Work on small projects to apply what you've learned\n3. Use the official Java documentation as a reference\n4. Join communities like Stack Overflow or Reddit's r/java to ask questions\n5. Consider taking a structured course on platforms like Coursera or Udemy\n\nWhat resources have you found helpful so far?",
            author: 'javafan23',
            authorRole: 'member',
            createdAt: '2023-06-01T10:24:00Z',
            editedAt: null,
            upvotes: 15,
            downvotes: 2,
            isOriginalPost: true
          },
          {
            id: 102,
            threadId: Number(threadId),
            content: 'Thanks for the tips! I found the book "Head First Java" to be really helpful for beginners. It explains concepts in a visual and engaging way.',
            author: 'java_newbie',
            authorRole: 'member',
            createdAt: '2023-06-01T11:35:00Z',
            editedAt: null,
            upvotes: 8,
            downvotes: 0,
            isOriginalPost: false
          },
          {
            id: 103,
            threadId: Number(threadId),
            content: 'I would also recommend checking out some YouTube channels like "Coding with John" and "Java Brains". They have excellent tutorials for beginners and intermediate programmers.',
            author: 'code_mentor',
            authorRole: 'moderator',
            createdAt: '2023-06-01T13:42:00Z',
            editedAt: null,
            upvotes: 12,
            downvotes: 1,
            isOriginalPost: false
          },
          {
            id: 104,
            threadId: Number(threadId),
            content: 'For practice, I recommend solving problems on LeetCode or HackerRank. Start with easy problems and gradually move to more difficult ones. This really helped me understand data structures and algorithms in Java.',
            author: 'algorithm_enthusiast',
            authorRole: 'member',
            createdAt: '2023-06-02T09:18:00Z',
            editedAt: null,
            upvotes: 10,
            downvotes: 0,
            isOriginalPost: false
          },
          {
            id: 105,
            threadId: Number(threadId),
            content: 'Don\'t forget about IDEs! IntelliJ IDEA has been a game-changer for me. The code suggestions and debugging tools save a lot of time.',
            author: 'dev_tools_fan',
            authorRole: 'member',
            createdAt: '2023-06-02T15:30:00Z',
            editedAt: '2023-06-02T15:45:00Z',
            upvotes: 7,
            downvotes: 1,
            isOriginalPost: false
          }
        ];
        
        // Simulate current user's post for edit/delete functionality
        if (currentUser) {
          mockPosts.push({
            id: 106,
            threadId: Number(threadId),
            content: 'I've been using Spring Boot for my Java projects. It simplifies a lot of the configuration and lets you focus on writing business logic.',
            author: currentUser.username || 'current_user',
            authorRole: 'member',
            createdAt: '2023-06-03T10:12:00Z',
            editedAt: null,
            upvotes: 4,
            downvotes: 0,
            isOriginalPost: false
          });
        }
        
        setThread(mockThread);
        setPosts(mockPosts);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load thread. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [threadId, currentUser]);

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setShowReplyForm(true);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!newPostContent.trim() || !isAuthenticated) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, you would call your API:
      // await axios.post(`/api/threads/${threadId}/posts`, {
      //   content: newPostContent
      // });
      
      // Mock new post
      const newPost = {
        id: Math.floor(Math.random() * 1000) + 200,
        threadId: Number(threadId),
        content: newPostContent,
        author: currentUser?.username || 'current_user',
        authorRole: 'member',
        createdAt: new Date().toISOString(),
        editedAt: null,
        upvotes: 0,
        downvotes: 0,
        isOriginalPost: false
      };
      
      setPosts([...posts, newPost]);
      setNewPostContent('');
      setShowReplyForm(false);
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Post menu handling
  const handleOpenMenu = (event, postId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedPostId(null);
  };
  
  const handleEditPost = () => {
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
      setEditingPostId(selectedPostId);
      setEditContent(post.content);
    }
    handleCloseMenu();
  };
  
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };
  
  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) {
      return;
    }
    
    try {
      // In a real app, you would call your API:
      // await axios.put(`/api/posts/${postId}`, {
      //   content: editContent
      // });
      
      // Update post in state
      setPosts(posts.map(post => 
        post.id === postId 
          ? {...post, content: editContent, editedAt: new Date().toISOString()} 
          : post
      ));
      
      setEditingPostId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    }
  };
  
  const handleDeleteClick = () => {
    setDeletingPostId(selectedPostId);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };
  
  const handleConfirmDelete = async () => {
    try {
      // In a real app, you would call your API:
      // await axios.delete(`/api/posts/${deletingPostId}`);
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== deletingPostId));
      
      setDeleteDialogOpen(false);
      setDeletingPostId(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingPostId(null);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const isCurrentUserAuthor = (authorName) => {
    if (!currentUser) return false;
    return currentUser.username === authorName || 'current_user' === authorName;
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
        <Link to={`/forums/${thread.forum.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {thread.forum.name}
        </Link>
        <Typography color="text.primary">{thread.title}</Typography>
      </Breadcrumbs>
      
      {/* Thread Title */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {thread.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<PersonIcon fontSize="small" />}
            label={`By: ${thread.author}`}
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<ScheduleIcon fontSize="small" />}
            label={`Posted: ${formatDate(thread.createdAt)}`}
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<CommentIcon fontSize="small" />}
            label={`${posts.length} Replies`}
            size="small"
            variant="outlined"
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={handleReplyClick}
          >
            Reply
          </Button>
        </Box>
      </Paper>
      
      {/* Thread Posts */}
      <Box sx={{ mb: 4 }}>
        {posts.map((post) => (
          <Card 
            key={post.id} 
            id={`post-${post.id}`}
            sx={{ 
              mb: 3, 
              border: post.isOriginalPost ? '1px solid' : 'none',
              borderColor: 'primary.main'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: post.authorRole === 'moderator' ? 'secondary.main' : 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              }
              action={
                <>
                  {isCurrentUserAuthor(post.author) && (
                    <IconButton 
                      aria-label="post settings"
                      onClick={(e) => handleOpenMenu(e, post.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {post.author}
                  </Typography>
                  {post.authorRole === 'moderator' && (
                    <Chip 
                      label="Moderator" 
                      size="small" 
                      color="secondary"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                  {post.isOriginalPost && (
                    <Chip 
                      label="Original Post" 
                      size="small" 
                      color="primary"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Box>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  {formatDate(post.createdAt)}
                  {post.editedAt && ' (edited)'}
                </Typography>
              }
            />
            <CardContent>
              {editingPostId === post.id ? (
                <Box component="form">
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => handleSaveEdit(post.id)}
                      disabled={!editContent.trim()}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {post.content}
                </Typography>
              )}
            </CardContent>
            <Divider />
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
              <IconButton size="small" aria-label="upvote">
                <ThumbUpIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 0.5 }}>
                {post.upvotes}
              </Typography>
              <IconButton size="small" aria-label="downvote">
                <ThumbDownIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 0.5 }}>
                {post.downvotes}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton 
                size="small" 
                aria-label="reply to this post"
                onClick={handleReplyClick}
              >
                <ReplyIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="report post">
                <FlagIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="bookmark post">
                <BookmarkBorderIcon fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>
      
      {/* Reply Form */}
      {showReplyForm && (
        <Paper ref={replyFormRef} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Post a Reply
          </Typography>
          <form onSubmit={handleSubmitReply}>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Write your reply here..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              variant="outlined"
              required
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowReplyForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                disabled={!newPostContent.trim() || submitting}
                startIcon={submitting ? <CircularProgress size={24} /> : null}
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}
      
      {!showReplyForm && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={handleReplyClick}
            size="large"
          >
            Reply to Thread
          </Button>
        </Box>
      )}
      
      {/* Post Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEditPost}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreadPage; 