import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getForums, Forum } from '../services/forumService';
import { Thread } from '../services/threadService';
import { checkAdminStatus, deleteForum, deleteThread, updateForum, updateThread, getThreads } from '../services/adminService';

const AdminDashboard: React.FC = () => {
    const [forums, setForums] = useState<Forum[]>([]);
    const [threads, setThreads] = useState<(Thread & { forumTitle: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAdmin = await checkAdminStatus();
                if (!isAdmin) {
                    navigate('/');
                    return;
                }
                await loadData();
            } catch (err) {
                console.error('Error checking admin status:', err);
                navigate('/');
            }
        };

        checkAuth();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [forumsData, threadsData] = await Promise.all([
                getForums(),
                getThreads()
            ]);
            setForums(forumsData.content);
            setThreads(threadsData.content);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteForum = async (forumId: number) => {
        if (!window.confirm('Are you sure you want to delete this forum?')) return;
        try {
            await deleteForum(forumId);
            setForums(forums.filter(forum => forum.id !== forumId));
        } catch (err) {
            console.error('Error deleting forum:', err);
            setError('Failed to delete forum');
        }
    };

    const handleDeleteThread = async (threadId: number) => {
        if (!window.confirm('Are you sure you want to delete this thread?')) return;
        try {
            await deleteThread(threadId);
            setThreads(threads.filter(thread => thread.id !== threadId));
        } catch (err) {
            console.error('Error deleting thread:', err);
            setError('Failed to delete thread');
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Forums</h2>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {forums.map(forum => (
                                <tr key={forum.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{forum.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{forum.categoryName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDeleteForum(forum.id)}
                                            className="text-red-600 hover:text-red-900 mr-4"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Threads</h2>
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {threads.map(thread => (
                                <tr key={thread.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{thread.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{thread.forumTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{thread.createdBy?.name || 'Unknown User'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDeleteThread(thread.id)}
                                            className="text-red-600 hover:text-red-900 mr-4"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 