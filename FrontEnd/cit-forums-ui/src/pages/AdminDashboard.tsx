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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [forums, setForums] = useState<Forum[]>([]);
    const [threads, setThreads] = useState<AdminThread[]>([]);
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
    const [backToReportFunction, setBackToReportFunction] = useState<(() => void) | null>(null);
    const [reportedThreadInfo, setReportedThreadInfo] = useState<{id: number, title: string} | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!isAdmin) {
                    navigate('/admin/login');
                    return;
                }
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
                setLoading(true);
                // Fetch dashboard overview
                const response = await axiosInstance.get('/api/admin/dashboard');
                const dashboardData = response.data;
                
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

                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const loadData = async () => {
        try {
            // Load dashboard data first
            setLoading(true);
            const dashboardResponse = await axiosInstance.get('/api/admin/dashboard');
            const dashboardData = dashboardResponse.data;
            
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
            setLoading(false);
            
            // Load users
            setUserLoading(true);
            try {
                const usersData = await getUsers();
                // Map the API users to our local User interface
                if (usersData && usersData.content) {
                    setUsers(usersData.content.map((user: any) => ({
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        active: user.status === 'ACTIVE',
                        createdAt: user.createdAt
                    })));
                } else {
                    setUsers([]);
                }
            } catch (userErr) {
                console.error('Error loading users:', userErr);
                setUserError('Failed to load user data');
                setUsers([]);
            } finally {
                setUserLoading(false);
            }

            // Load threads
            try {
                const threadsData = await getThreads();
                if (threadsData && threadsData.content) {
                    setThreads(threadsData.content.map((thread: any) => ({
                        id: thread.id,
                        title: thread.title,
                        content: thread.content,
                        createdAt: thread.createdAt,
                        author: thread.author || { username: thread.username || 'Unknown' },
                        username: thread.username || 'Unknown',
                        forumTitle: thread.forum?.title
                    })));
                } else {
                    setThreads([]);
                }
            } catch (threadErr) {
                console.error('Error loading threads:', threadErr);
                setThreads([]);
            }

            // Load reports
            setModerationLoading(true);
            try {
                const reportsData = await getReportedContent();
                if (reportsData && reportsData.content) {
                    setReportedContent(reportsData.content);
                } else {
                    setReportedContent([]);
                }
            } catch (reportErr) {
                console.error('Error loading reports:', reportErr);
                setModerationLoading(false);
                setReportedContent([]);
            } finally {
                setModerationLoading(false);
            }

            // Load analytics - only if needed
            if (activeTab === 'analytics') {
                setAnalyticsLoading(true);
                try {
                    const forumStatsData = await getForumStats();
                    setForumStats(forumStatsData);
                    const userStatsData = await getUserStats();
                    setUserStats(userStatsData);
                } catch (analyticsErr) {
                    console.error('Error loading analytics:', analyticsErr);
                    setAnalyticsError('Failed to load analytics data');
                } finally {
                    setAnalyticsLoading(false);
                }
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
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

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

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

    useEffect(() => {
        if (activeTab === 'moderation') {
            loadReportedContent();
        }
    }, [activeTab]);

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

    useEffect(() => {
        if (activeTab === 'reports') {
            loadAnalytics();
        }
    }, [activeTab]);

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
            setActiveTab('reports');
            
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
                    setActiveTab('threads');
                    
                    // Add a back button function to return to the report
                    if (currentReport) {
                        setBackToReportFunction(() => {
                            setSelectedReport(currentReport);
                            setActiveTab('reports');
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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'users':
                return (
                    <div className="admin-section">
                        <h2 className="admin-section-title">User Management</h2>
                        {userLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                            </div>
                        ) : userError ? (
                            <div className="text-red-500 text-center">{userError}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <select 
                                                        value={user.role}
                                                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                                        className="admin-select"
                                                    >
                                                        <option value="USER">User</option>
                                                        <option value="MODERATOR">Moderator</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <span className={user.active ? 'admin-badge-active' : 'admin-badge-inactive'}>
                                                        {user.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(user.id, !user.active)}
                                                        className="admin-btn-secondary"
                                                    >
                                                        {user.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'reports':
                return viewMode === 'detail' && selectedReport ? (
                    <div className="space-y-4">
                        <div className="flex items-center mb-4">
                            <button 
                                onClick={backToList}
                                className="admin-btn-secondary mr-4"
                            >
                                ← Back to Reports
                            </button>
                            <h2 className="admin-section-title">Report Details</h2>
                        </div>
                        
                        <div className="admin-card">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-highlight mb-2">Report Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-secondary"><span className="font-semibold">ID:</span> {selectedReport?.id}</p>
                                        <p className="text-secondary"><span className="font-semibold">Type:</span> {selectedReport?.contentType}</p>
                                        <p className="text-secondary"><span className="font-semibold">Content ID:</span> {selectedReport?.contentId}</p>
                                        <p className="text-secondary"><span className="font-semibold">Status:</span> 
                                            <span className={selectedReport?.status === 'PENDING' ? 'admin-badge-pending' : 'admin-badge-resolved'}>
                                                {selectedReport?.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-secondary"><span className="font-semibold">Reported By:</span> {selectedReport?.reporter?.username || 'Anonymous'}</p>
                                        <p className="text-secondary"><span className="font-semibold">Date:</span> {new Date(selectedReport?.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-highlight mb-2">Reason for Report</h3>
                                <p className="text-secondary p-3 bg-maroon-700 rounded">{selectedReport?.reason}</p>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-highlight mb-2">Content Information</h3>
                                {selectedReport?.contentType === 'THREAD' && (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-maroon-700 rounded mb-3">
                                            <h4 className="text-md font-semibold text-gold mb-1">Thread Title:</h4>
                                            <p className="text-secondary">{reportedThreadInfo?.title || 'Loading thread information...'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Thread ID: {selectedReport?.contentId}</p>
                                        </div>
                                        <div className="flex space-x-3 mb-4">
                                            <button 
                                                onClick={() => {
                                                    if (selectedReport?.contentId) {
                                                        const threadId = Number(selectedReport.contentId);
                                                        if (!isNaN(threadId)) {
                                                            viewThreadDetails(threadId);
                                                        } else {
                                                            alert('Invalid thread ID');
                                                        }
                                                    }
                                                }}
                                                className="admin-btn-primary"
                                            >
                                                View Thread
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedReport?.contentId) {
                                                        const threadId = Number(selectedReport.contentId);
                                                        if (!isNaN(threadId)) {
                                                            if (window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
                                                                deleteThread(threadId);
                                                                if (selectedReport?.id) {
                                                                    handleResolveReport(selectedReport.id, 'resolve');
                                                                }
                                                                backToList();
                                                            }
                                                        } else {
                                                            alert('Invalid thread ID');
                                                        }
                                                    }
                                                }}
                                                className="admin-btn-danger"
                                            >
                                                Delete Thread
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {selectedReport?.contentType === 'COMMENT' && (
                                    <p className="text-secondary">Comment ID: {selectedReport?.contentId}</p>
                                )}
                            </div>
                            
                            <div className="flex space-x-4 mt-6">
                                <button
                                    onClick={() => {
                                        handleResolveReport(selectedReport?.id, 'resolve');
                                        backToList();
                                    }}
                                    className="admin-btn-primary"
                                >
                                    Resolve Report
                                </button>
                                <button
                                    onClick={() => {
                                        handleResolveReport(selectedReport?.id, 'dismiss');
                                        backToList();
                                    }}
                                    className="admin-btn-secondary"
                                >
                                    Dismiss Report
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="admin-section-title">Reports</h2>
                        <div className="bg-white p-4 rounded-lg shadow">
                            {reportedContent.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No reports found</p>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2">Type</th>
                                            <th className="px-4 py-2">Content ID</th>
                                            <th className="px-4 py-2">Reason</th>
                                            <th className="px-4 py-2">Reported By</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportedContent.map(report => (
                                            <tr key={report.id}>
                                                <td className="px-4 py-2">{report.contentType}</td>
                                                <td className="px-4 py-2">{report.contentId}</td>
                                                <td className="px-4 py-2 truncate max-w-xs">{report.reason}</td>
                                                <td className="px-4 py-2">{report.reporter?.username || 'Anonymous'}</td>
                                                <td className="px-4 py-2">{report.status}</td>
                                                <td className="px-4 py-2 flex space-x-2">
                                                    <button
                                                        onClick={() => viewReportDetails(report)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveReport(report.id, 'resolve')}
                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveReport(report.id, 'dismiss')}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );
            case 'threads':
                return viewMode === 'detail' && selectedThread ? (
                    <div className="space-y-4">
                        <div className="flex items-center mb-4">
                            {backToReportFunction ? (
                                <button 
                                    onClick={backToReportFunction}
                                    className="admin-btn-secondary mr-4 flex items-center"
                                >
                                    <span className="mr-1">←</span> Back to Report
                                </button>
                            ) : (
                                <button 
                                    onClick={backToList}
                                    className="admin-btn-secondary mr-4"
                                >
                                    Back to List
                                </button>
                            )}
                            <h2 className="admin-section-title">Thread Details</h2>
                        </div>
                        
                        <div className="admin-card">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-highlight">{selectedThread?.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Posted by {selectedThread?.author?.username || selectedThread?.username} on {new Date(selectedThread?.createdAt).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="mb-4 p-4 bg-maroon-700 rounded">
                                <p className="text-secondary whitespace-pre-wrap">{selectedThread?.content}</p>
                            </div>
                            
                            <div className="flex space-x-4 mt-6">
                                <button
                                    onClick={() => {
                                        // Redirect to the thread page on the main site
                                        window.open(`/forums/thread/${selectedThread?.id}`, '_blank');
                                    }}
                                    className="admin-btn-primary"
                                >
                                    View on Site
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this thread?')) {
                                            deleteThread(selectedThread?.id);
                                            backToList();
                                        }
                                    }}
                                    className="admin-btn-danger"
                                >
                                    Delete Thread
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="admin-section-title">Threads</h2>
                        <div className="bg-white p-4 rounded-lg shadow">
                            {threads.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No threads found</p>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2">Title</th>
                                            <th className="px-4 py-2">Author</th>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {threads.map(thread => (
                                            <tr key={thread.id}>
                                                <td className="px-4 py-2">{thread.title}</td>
                                                <td className="px-4 py-2">{thread.author?.username || thread.username}</td>
                                                <td className="px-4 py-2">{new Date(thread.createdAt).toLocaleString()}</td>
                                                <td className="px-4 py-2 flex space-x-2">
                                                    <button
                                                        onClick={() => viewThreadDetails(thread.id)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this thread?')) {
                                                                deleteThread(thread.id);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div>Invalid tab</div>;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <button 
                    onClick={handleLogout}
                    className="admin-btn-secondary"
                >
                    Logout
                </button>
            </div>
            <div className="admin-tabs">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                >
                    Users
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
                >
                    Reports
                </button>
                <button 
                    onClick={() => setActiveTab('threads')}
                    className={`admin-tab ${activeTab === 'threads' ? 'active' : ''}`}
                >
                    Threads
                </button>
            </div>
            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;