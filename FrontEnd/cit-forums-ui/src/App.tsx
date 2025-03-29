import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/custom.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForumList from './pages/ForumList';
import ThreadList from './pages/ThreadList';
import Thread from './pages/Thread';
import Profile from './pages/Profile';
import CreateThread from './pages/CreateThread';
import CreateForum from './pages/CreateForum';
import { initializeAuth } from './services/authService';

// Initialize authentication on app start
initializeAuth();

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forums" element={<ForumList />} />
          <Route path="/forums/create" element={<CreateForum />} />
          <Route path="/forums/:forumId" element={<ThreadList />} />
          <Route path="/forums/:forumId/threads/create" element={<CreateThread />} />
          <Route path="/forums/:forumId/threads/:threadId" element={<Thread />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 