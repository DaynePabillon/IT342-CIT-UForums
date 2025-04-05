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
import axiosInstance from './services/axiosInstance';
import { getAuthToken } from './services/authService';

// Initialize axios with token if it exists
const token = getAuthToken();
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

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
          <Route path="/forums/:forumId/threads" element={<ThreadList />} />
          <Route path="/forums/:forumId/threads/create" element={<CreateThread />} />
          <Route path="/forums/:forumId/threads/:threadId" element={<Thread />} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 