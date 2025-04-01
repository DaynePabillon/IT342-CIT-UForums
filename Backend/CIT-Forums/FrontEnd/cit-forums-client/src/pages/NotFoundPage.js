import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          mt: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <SadIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h2" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/" 
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/forums"
          >
            Browse Forums
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage; 