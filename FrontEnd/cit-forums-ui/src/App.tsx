import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GuidelinesProvider } from './context/GuidelinesContext';
import { DevelopmentNoticeProvider } from './context/DevelopmentNoticeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import './App.css';
import './styles/custom.css';
import './styles/forum-theme.css';
import './styles/adminReadability.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForumList from './pages/ForumList';
import ThreadList from './pages/ThreadList';
import Thread from './pages/Thread';
import Profile from './pages/Profile';
import CreateThread from './pages/CreateThread';
import CreateForum from './pages/CreateForum';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import AdminReportHistory from './pages/AdminReportHistory';
import AdminUsers from './pages/AdminUsers';
import axiosInstance from './services/axiosInstance';
import { getAuthToken } from './services/authService';

// Initialize axios with token if it exists
const token = getAuthToken();
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GuidelinesProvider>
        <DevelopmentNoticeProvider>
          <div className="App">
            <Navbar />
            <main className="container mt-4">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/forums" element={<ForumList />} />
                <Route path="/forums/create" element={<CreateForum />} />
                <Route path="/forums/:forumId/threads" element={<ThreadList />} />
                <Route path="/forums/:forumId/threads/create" element={<CreateThread />} />
                <Route path="/forums/:forumId/threads/:threadId" element={<Thread />} />
                
                {/* Admin Routes - protected by ProtectedAdminRoute which handles authentication */}
                <Route path="/admin/dashboard" element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedAdminRoute>
                    <AdminReports />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedAdminRoute>
                    <AdminUsers />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/report-history" element={
                  <ProtectedAdminRoute>
                    <AdminReportHistory />
                  </ProtectedAdminRoute>
                } />

                {/* Protected user routes */}
                <Route path="/user/dashboard" element={
                  <ProtectedRoute>
                    <div>User Dashboard</div>
                  </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </DevelopmentNoticeProvider>
      </GuidelinesProvider>
    </AuthProvider>
  );
};

export default App;