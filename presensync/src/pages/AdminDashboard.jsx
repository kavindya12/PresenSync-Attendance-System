import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, BarChart2, Settings, LogOut } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import { userAPI, courseAPI, attendanceAPI } from '../api/endpoints';

const AdminDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalClasses: 0,
        attendanceRate: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [usersRes, coursesRes, statsRes] = await Promise.all([
                userAPI.getAllUsers({ limit: 1 }),
                courseAPI.getAllCourses(),
                attendanceAPI.getAttendanceStats(),
            ]);

            setStats({
                totalUsers: usersRes.data.pagination?.total || 0,
                totalCourses: coursesRes.data.courses?.length || 0,
                totalClasses: 0, // Would need separate endpoint
                attendanceRate: parseFloat(statsRes.data.stats?.percentage || 0),
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Use default stats if API fails
            setStats({
                totalUsers: 0,
                totalCourses: 0,
                totalClasses: 0,
                attendanceRate: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '.', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
        { path: 'users', icon: <Users size={20} />, label: 'Users' },
        { path: 'courses', icon: <BookOpen size={20} />, label: 'Courses' },
        { path: 'reports', icon: <BarChart2 size={20} />, label: 'Reports' },
        { path: 'settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">Presen<span className="text-orange-500 dark:text-orange-400">Sync</span></h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider text-red-600 dark:text-red-400">Admin Portal</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-700 dark:text-red-400 font-bold">
                            {user?.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.fullName || 'Admin'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-gray-50 dark:bg-gray-900">
                <Routes>
                    <Route index element={
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h2>
                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.totalUsers}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.totalCourses}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{stats.totalClasses}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">System Attendance Rate</p>
                                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                                {stats.attendanceRate.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <NavLink
                                            to="users"
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center"
                                        >
                                            <Users className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Users</p>
                                        </NavLink>
                                        <NavLink
                                            to="courses"
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center"
                                        >
                                            <BookOpen className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Courses</p>
                                        </NavLink>
                                        <NavLink
                                            to="reports"
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center"
                                        >
                                            <BarChart2 className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">View Reports</p>
                                        </NavLink>
                                        <NavLink
                                            to="settings"
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center"
                                        >
                                            <Settings className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                                        </NavLink>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                    <Route path="users" element={<div className="text-center py-20 text-gray-500 dark:text-gray-400">User Management Coming Soon</div>} />
                    <Route path="courses" element={<div className="text-center py-20 text-gray-500 dark:text-gray-400">Course Management Coming Soon</div>} />
                    <Route path="reports" element={<div className="text-center py-20 text-gray-500 dark:text-gray-400">Reports Coming Soon</div>} />
                    <Route path="settings" element={<div className="text-center py-20 text-gray-500 dark:text-gray-400">Settings Coming Soon</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
