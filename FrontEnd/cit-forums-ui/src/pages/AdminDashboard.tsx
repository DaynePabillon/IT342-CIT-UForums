import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getForums, Forum } from '../services/forumService';
import { Thread } from '../services/threadService';
import { checkAdminStatus, deleteForum, deleteThread, updateForum, updateThread, getThreads, getUsers, updateUserRole, updateUserStatus, ReportedContent, getReportedContent, resolveReport, getForumStats, getUserStats } from '../services/adminService';
import { User } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

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
    forumTitle?: string;
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
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);

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
                // Fetch users count
                const usersResponse = await axiosInstance.get('/api/admin/users');
                const users = usersResponse.data;
                
                // Fetch threads count
                const threadsResponse = await axiosInstance.get('/api/admin/threads');
                const threads = threadsResponse.data.data;

                // Update stats with actual counts
                setStats({
                    totalUsers: users.length || 0,
                    totalThreads: threads.length || 0,
                    totalReports: stats.totalReports,
                    activeReports: stats.activeReports
                });

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
            setLoading(true);
            const [forumsData, threadsData] = await Promise.all([
                getForums(),
                getThreads()
            ]);
            setForums(forumsData.content);
            // Transform the threads data to match AdminThread type
            const transformedThreads = threadsData.content.map(thread => ({
                ...thread,
                author: {
                    username: thread.createdBy?.name || 'Unknown'
                }
            }));
            setThreads(transformedThreads);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setUserLoading(true);
            const response = await getUsers();
            setUsers(response.content);
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

    const handleUpdateStatus = async (userId: number, newStatus: string) => {
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(users.map(user => 
                user.id === userId ? { ...user, status: newStatus } : user
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
            const [forumStatsData, userStatsData] = await Promise.all([
                getForumStats(),
                getUserStats()
            ]);
            setForumStats(forumStatsData);
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

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
    return (
                    <div className="space-y-4">
                        <div className="bg-maroon-800 px-6 py-4 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold text-gold-500">Admin Overview</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-maroon-800">{stats.totalUsers}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Threads</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-maroon-800">{stats.totalThreads}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-maroon-800">{stats.totalReports}</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Reports</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-maroon-800">{stats.activeReports}</dd>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="bg-white shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-maroon-800">Recent Reports</h3>
                                    <div className="mt-4">
                                        {recentReports.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {recentReports.map((report) => (
                                                    <li key={report.id} className="py-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-maroon-800">{report.title}</p>
                                                                <p className="text-sm text-gray-500">Status: {report.status}</p>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {new Date(report.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">No recent reports</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white shadow rounded-lg border-l-4 border-maroon-800">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-maroon-800">Recent Users</h3>
                                    <div className="mt-4">
                                        {recentUsers.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {recentUsers.map((user) => (
                                                    <li key={user.id} className="py-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-maroon-800">{user.username}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.role}
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500">No recent users</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-4">
                        <div className="bg-maroon-800 px-6 py-4 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold text-gold-500">User Management</h2>
                        </div>
                        {userLoading ? (
                            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-800 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading users...</p>
                            </div>
                        ) : userError ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {userError}</span>
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg overflow-hidden border-l-4 border-maroon-800">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                                        {users && users.length > 0 ? (
                                            users.map(user => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-maroon-800">{user.username}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-maroon-800">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-maroon-800">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                    No users found
                                                </td>
                                            </tr>
                                        )}
                        </tbody>
                    </table>
                </div>
                        )}
            </div>
                );
            case 'reports':
                return (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Reports</h2>
                        <div className="bg-white p-4 rounded-lg shadow">
                            <table className="min-w-full">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Content</th>
                                        <th className="px-4 py-2">Reported By</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                                <tbody>
                                    {reportedContent.map(report => (
                                        <tr key={report.id}>
                                            <td className="px-4 py-2">{report.type}</td>
                                            <td className="px-4 py-2">{report.contentId}</td>
                                            <td className="px-4 py-2">{report.reportedBy.username}</td>
                                            <td className="px-4 py-2">{report.status}</td>
                                            <td className="px-4 py-2">
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
                </div>
            </div>
                );
            case 'moderation':
                return (
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-maroon-800 px-6 py-4 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold text-gold-500">Moderation Tools</h2>
                        </div>
                        
                        <div className="space-y-8">
                            {/* Content Moderation Section */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-maroon-800">
                                <h3 className="text-xl font-semibold text-maroon-800 mb-4">Content Moderation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        Review Flagged Content
                                    </button>
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        Moderate Threads
                                    </button>
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        Manage Comments
                                    </button>
                                </div>
                            </div>

                            {/* User Moderation Section */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-maroon-800">
                                <h3 className="text-xl font-semibold text-maroon-800 mb-4">User Moderation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        Manage User Rights
                                    </button>
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        View User Reports
                                    </button>
                                    <button className="px-4 py-3 bg-gold-500 text-maroon-800 rounded-lg hover:bg-gold-600 font-medium transition-colors duration-200">
                                        Ban Users
                                    </button>
                                </div>
                            </div>

                            {/* Statistics Section */}
                            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-maroon-800">
                                <h3 className="text-xl font-semibold text-maroon-800 mb-4">Moderation Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Pending Reports</p>
                                        <p className="text-2xl font-bold text-maroon-800">12</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Actions Today</p>
                                        <p className="text-2xl font-bold text-maroon-800">45</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Active Moderators</p>
                                        <p className="text-2xl font-bold text-maroon-800">8</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'threads':
                return (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                All Threads
                            </h3>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : error ? (
                            <div className="text-center py-4 text-red-600">{error}</div>
                        ) : (
                            <div className="border-t border-gray-200">
                                <ul className="divide-y divide-gray-200">
                                    {threads.map((thread) => (
                                        <li key={thread.id} className="px-4 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-lg font-semibold">{thread.title}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        By {thread.author.username} on{' '}
                                                        {new Date(thread.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                        onClick={() => {
                                                            // TODO: Implement delete functionality
                                                            console.log('Delete thread:', thread.id);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-maroon-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <div className="bg-gold-500 px-6 py-3 rounded-lg">
                                    <h1 className="text-xl font-bold text-maroon-800">Admin Dashboard</h1>
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`${
                                        activeTab === 'dashboard'
                                            ? 'border-gold-500 text-gold-500'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gold-400'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`${
                                        activeTab === 'users'
                                            ? 'border-gold-500 text-gold-500'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gold-400'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Users
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    className={`${
                                        activeTab === 'reports'
                                            ? 'border-gold-500 text-gold-500'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gold-400'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Reports
                                </button>
                                <button
                                    onClick={() => setActiveTab('moderation')}
                                    className={`${
                                        activeTab === 'moderation'
                                            ? 'border-gold-500 text-gold-500'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gold-400'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Moderation
                                </button>
                                <button
                                    onClick={() => setActiveTab('threads')}
                                    className={`${
                                        activeTab === 'threads'
                                            ? 'border-gold-500 text-gold-500'
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gold-400'
                                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                                >
                                    Threads
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-maroon-800 bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard; 