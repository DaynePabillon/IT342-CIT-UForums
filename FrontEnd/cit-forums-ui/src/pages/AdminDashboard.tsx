import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getForums, Forum } from '../services/forumService';
import { Thread } from '../services/threadService';
import { checkAdminStatus, deleteForum, deleteThread, updateForum, updateThread, getThreads, getUsers, updateUserRole, updateUserStatus, ReportedContent, getReportedContent, getForumStats, getUserStats, resolveReport, getThreadById } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';
import '../styles/adminTheme.css';

interface Tab {
    id: string;
    label: string;
    component: React.ReactNode;
}

interface Report {
    id: number;
    title: string;
    status: string;
    createdAt: string;
}

interface AdminThread {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    author: {
        username: string;
    };
    username: string;
    forumTitle?: string;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [userLoading, setUserLoading] = useState(true);
    const [userError, setUserError] = useState<string | null>(null);
    const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
    const [moderationLoading, setModerationLoading] = useState(true);
    const [moderationError, setModerationError] = useState<string | null>(null);
    const [forumStats, setForumStats] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalThreads: 0,
        totalReports: 0,
        activeReports: 0
    });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
    const [selectedThread, setSelectedThread] = useState<AdminThread | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [reportedThreadInfo, setReportedThreadInfo] = useState<any>(null);
    const [backToReportFunction, setBackToReportFunction] = useState<(() => void) | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('AdminDashboard - Checking admin status, isAdmin:', isAdmin);
                if (!isAdmin) {
                    console.log('AdminDashboard - User is not admin, redirecting to login');
                    navigate('/admin/login');
                    return;
                }
                console.log('AdminDashboard - User is admin, loading data');
                await loadData();
            } catch (err) {
                console.error('Error checking admin status:', err);
                navigate('/admin/login');
            }
        };

        checkAuth();
    }, [navigate, isAdmin]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('AdminDashboard - Fetching dashboard data');
                setLoading(true);
                setError(null);
                
                // Fetch dashboard overview
                console.log('AdminDashboard - Making API call to /api/admin/dashboard');
                const response = await axiosInstance.get('/api/admin/dashboard');
                console.log('AdminDashboard - API response received:', response);
                
                const dashboardData = response.data;
                console.log('AdminDashboard - Dashboard data:', dashboardData);
                
                // Update stats with actual counts
                setStats({
                    totalUsers: dashboardData.totalUsers || 0,
                    totalThreads: dashboardData.totalThreads || 0,
                    totalReports: dashboardData.totalReports || 0,
                    activeReports: dashboardData.activeReports || 0
                });
                
                // Set recent reports and users
                setRecentReports(dashboardData.recentReports || []);
                setRecentUsers(dashboardData.recentUsers || []);

                console.log('AdminDashboard - Data processed successfully');
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err?.message || 'Failed to load dashboard data');
                setLoading(false);
                
                // Log detailed error information
                if (err?.response) {
                    console.error('Error response:', {
                        status: err.response.status,
                        data: err.response.data,
                        headers: err.response.headers
                    });
                } else if (err?.request) {
                    console.error('Error request:', err.request);
                } else {
                    console.error('Error message:', err.message);
                }
            }
        };

        fetchDashboardData();
    }, []);

    const loadData = async () => {
        try {
            console.log('AdminDashboard - Loading all dashboard data');
            await Promise.all([
                loadUsers(),
                loadReportedContent(),
                loadAnalytics()
            ]);
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        }
    };

    const loadUsers = async () => {
        try {
            setUserLoading(true);
            const response = await getUsers();
            // Map the API users to our local User interface
            setUsers(response.content.map((user: any) => ({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.status === 'ACTIVE',
                createdAt: user.createdAt
            })));
        } catch (err) {
            setUserError('Failed to load users');
            console.error('Error loading users:', err);
        } finally {
            setUserLoading(false);
        }
    };

    const handleUpdateRole = async (userId: number, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            console.error('Error updating user role:', err);
            setUserError('Failed to update user role');
        }
    };

    const handleUpdateStatus = async (userId: number, newStatus: boolean) => {
        try {
            await updateUserStatus(userId, newStatus ? 'active' : 'inactive');
            setUsers(users.map(user => 
                user.id === userId ? { ...user, active: newStatus } : user
            ));
        } catch (err) {
            console.error('Error updating user status:', err);
            setUserError('Failed to update user status');
        }
    };

    const loadReportedContent = async () => {
        try {
            setModerationLoading(true);
            const response = await getReportedContent();
            setReportedContent(response.content);
        } catch (err) {
            setModerationError('Failed to load reported content');
            console.error('Error loading reported content:', err);
        } finally {
            setModerationLoading(false);
        }
    };

    const handleResolveReport = async (reportId: number, action: 'resolve' | 'dismiss') => {
        try {
            await resolveReport(reportId, action);
            setReportedContent(reportedContent.filter(report => report.id !== reportId));
        } catch (err) {
            console.error('Error resolving report:', err);
            setModerationError('Failed to resolve report');
        }
    };

    const loadAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const forumStatsData = await getForumStats();
            setForumStats(forumStatsData);
            const userStatsData = await getUserStats();
            setUserStats(userStatsData);
        } catch (err) {
            setAnalyticsError('Failed to load analytics');
            console.error('Error loading analytics:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axiosInstance.delete(`/api/admin/users/${userId}`);
            setRecentUsers(recentUsers.filter(user => user.id !== userId));
            setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        } catch (err) {
            console.error('Error deleting user:', err);
            setError('Failed to delete user');
        }
    };

    const viewReportDetails = async (report: ReportedContent) => {
        try {
            setSelectedReport(report);
            setViewMode('detail');
            
            // If this is a thread report, fetch the thread title
            if (report.contentType === 'THREAD') {
                try {
                    const threadId = Number(report.contentId);
                    if (!isNaN(threadId)) {
                        const response = await axiosInstance.get(`/api/threads/${threadId}`);
                        if (response && response.data) {
                            setReportedThreadInfo({
                                id: threadId,
                                title: response.data.title || 'Unknown Thread Title'
                            });
                        } else {
                            setReportedThreadInfo({
                                id: threadId,
                                title: 'Thread Not Found'
                            });
                        }
                    } else {
                        setReportedThreadInfo({
                            id: 0,
                            title: 'Invalid Thread ID'
                        });
                    }
                } catch (err) {
                    console.error('Error fetching thread info:', err);
                    setReportedThreadInfo({
                        id: Number(report.contentId) || 0,
                        title: 'Error Loading Thread Information'
                    });
                }
            } else {
                setReportedThreadInfo(null);
            }
        } catch (err) {
            console.error('Error viewing report details:', err);
        }
    };

    const viewThreadDetails = async (threadId: number) => {
        try {
            setLoading(true);
            console.log('Viewing thread details for ID:', threadId);
            
            // Store the current report to return to it later
            const currentReport = selectedReport;
            
            // Use the admin service to fetch thread details
            try {
                const thread = await getThreadById(threadId);
                console.log('Thread data received:', thread);
                
                if (thread) {
                    setSelectedThread({
                        id: thread.id,
                        title: thread.title || 'Untitled Thread',
                        content: thread.content || 'No content',
                        createdAt: thread.createdAt || new Date().toISOString(),
                        author: thread.author || { username: thread.username || 'Unknown' },
                        username: thread.author?.username || thread.username || 'Unknown',
                        forumTitle: thread.forum?.title || 'Unknown Forum'
                    });
                    
                    // Switch to thread detail view
                    setViewMode('detail');
                    
                    // Add a back button function to return to the report
                    if (currentReport) {
                        setBackToReportFunction(() => {
                            setSelectedReport(currentReport);
                            setViewMode('detail');
                            setSelectedThread(null);
                        });
                    }
                } else {
                    alert('Thread not found or could not be loaded');
                }
            } catch (fetchError) {
                console.error('Error fetching thread details:', fetchError);
                alert('Error loading thread details. Please try again.');
            }
        } catch (err) {
            console.error('Error in viewThreadDetails:', err);
            alert('Error loading thread details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchThreadDetails = async (threadId: number) => {
        try {
            const response = await axiosInstance.get(`/api/threads/${threadId}`);
            setSelectedThread(response.data);
            setViewMode('detail');
        } catch (err) {
            console.error('Error fetching thread details:', err);
            setError('Failed to load thread details');
        }
    };

    const fetchThreadTitle = async (threadId: number) => {
        try {
            const response = await axiosInstance.get(`/api/threads/${threadId}`);
            return response.data.title;
        } catch (err) {
            console.error('Error fetching thread title:', err);
            return 'Unknown Thread';
        }
    };

    const backToList = () => {
        setViewMode('list');
        setSelectedReport(null);
        setSelectedThread(null);
        if (backToReportFunction) {
            backToReportFunction();
            setBackToReportFunction(null);
        }
    };

    const renderDashboard = () => {
        return (
            <div className="admin-section">
                <h2 className="admin-section-title">Admin Overview</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center">{error}</div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="admin-stat-card">
                                <h3>Total Users</h3>
                                <p>{stats.totalUsers}</p>
                            </div>
                            <div className="admin-stat-card">
                                <h3>Total Threads</h3>
                                <p>{stats.totalThreads}</p>
                            </div>
                            <div className="admin-stat-card">
                                <h3>Total Reports</h3>
                                <p>{stats.totalReports}</p>
                            </div>
                            <div className="admin-stat-card">
                                <h3>Active Reports</h3>
                                <p>{stats.activeReports}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="admin-card">
                                <h3 className="admin-section-title">Recent Reports</h3>
                                {recentReports.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentReports.map((report) => (
                                            <div 
                                                key={report.id} 
                                                className="admin-list-item cursor-pointer hover:bg-maroon-600 transition-colors"
                                                onClick={() => viewReportDetails(report)}
                                            >
                                                <div className="flex justify-between">
                                                    <span className="text-primary">{report.contentType} Report</span>
                                                    <span className={report.status === 'PENDING' ? 'admin-badge-pending' : 'admin-badge-resolved'}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-secondary mt-1 truncate">{report.reason}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-secondary">No recent reports</p>
                                )}
                            </div>
                            <div className="admin-card">
                                <h3 className="admin-section-title">Recent Users</h3>
                                {recentUsers.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentUsers.map((user) => (
                                            <div key={user.id} className="admin-list-item">
                                                <div className="flex justify-between">
                                                    <span className="text-primary">{user.username}</span>
                                                    <span className="text-xs text-gray-400">{user.role}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Joined: {new Date(user.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-secondary">No recent users</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <div className="admin-header-actions">
                    <button 
                        onClick={handleLogout}
                        className="admin-btn-secondary"
                    >
                        Logout
                    </button>
                </div>
            </div>
            {renderDashboard()}
        </div>
    );
};

export default AdminDashboard;