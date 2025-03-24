import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
  Avatar,
  useTheme
} from '@mui/material';
import { Forum as ForumIcon } from '@mui/icons-material';

const AuthLayout = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Link 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none', 
            color: 'inherit' 
          }}
        >
          <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="div" color="primary.main">
            CIT Forums
          </Typography>
        </Link>
      </Box>
      
      {/* Main Content */}
      <Container 
        component="main" 
        maxWidth="xs" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <ForumIcon />
          </Avatar>
          
          {/* Render the nested route component */}
          <Outlet />
        </Paper>
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          mt: 'auto',
          textAlign: 'center',
          bgcolor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} CIT Forums - All rights reserved
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Link 
            component={RouterLink} 
            to="/" 
            color="inherit" 
            sx={{ mx: 1 }}
          >
            Home
          </Link>
          <Link 
            component={RouterLink} 
            to="/forums" 
            color="inherit"
            sx={{ mx: 1 }}
          >
            Forums
          </Link>
          <Link 
            href="#" 
            color="inherit"
            sx={{ mx: 1 }}
            onClick={(e) => {
              e.preventDefault();
              // Open contact dialog or navigate to contact page
            }}
          >
            Contact
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout; 