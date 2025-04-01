import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Container,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Brightness4, 
  Brightness7, 
  Forum,
  Home,
  Login,
  Logout,
  PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };
  
  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/login');
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/', auth: false },
    { text: 'Forums', icon: <Forum />, path: '/forums', auth: false },
    { text: 'Profile', icon: <AccountCircle />, path: '/profile', auth: true },
    { text: 'Login', icon: <Login />, path: '/login', auth: false, hideWhenAuth: true },
    { text: 'Register', icon: <PersonAdd />, path: '/register', auth: false, hideWhenAuth: true },
  ];

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems
          .filter(item => !item.hideWhenAuth || !isAuthenticated)
          .filter(item => !item.auth || isAuthenticated)
          .map((item, index) => (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              to={item.path}
              sx={{
                backgroundColor: window.location.pathname === item.path ? 
                  theme.palette.action.selected : 'transparent'
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      <Divider />
      <List>
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
        <ListItem button onClick={toggleTheme}>
          <ListItemIcon>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </ListItemIcon>
          <ListItemText primary={`${mode === 'dark' ? 'Light' : 'Dark'} Mode`} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            CIT Forums
          </Typography>
          
          {!isMobile && (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/"
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/forums"
              >
                Forums
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/profile"
                  >
                    Profile
                  </Button>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={menuAnchor}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem 
                      component={Link} 
                      to="/profile"
                      onClick={handleCloseMenu}
                    >
                      My Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                  >
                    Login
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/register"
                  >
                    Register
                  </Button>
                </>
              )}
              
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label="toggle theme"
              >
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerList()}
      </Drawer>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[200] 
            : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' CIT Forums. All rights reserved.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 