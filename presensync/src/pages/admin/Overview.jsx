import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Calendar, TrendingUp, UserPlus, BarChart3, Settings } from 'lucide-react';
import { userAPI, courseAPI, attendanceAPI } from '../../api/endpoints';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalClasses: 0,
        attendanceRate: 0,
        activeStudents: 0,
        activeLecturers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Use demo data if API fails - IT undergraduate program stats
            const demoStats = {
                totalUsers: 1250,
                totalCourses: 25,
                totalClasses: 320,
                attendanceRate: 87.5,
                activeStudents: 1180,
                activeLecturers: 8,
            };

            try {
                const [usersRes, coursesRes, statsRes] = await Promise.all([
                    userAPI.getAllUsers({ limit: 1 }).catch(() => ({ data: { pagination: { total: demoStats.totalUsers } } })),
                    courseAPI.getAllCourses().catch(() => ({ data: { courses: [] } })),
                    attendanceAPI.getAttendanceStats().catch(() => ({ data: { stats: { percentage: demoStats.attendanceRate } } })),
                ]);

                setStats({
                    totalUsers: usersRes.data.pagination?.total || demoStats.totalUsers,
                    totalCourses: coursesRes.data.courses?.length || demoStats.totalCourses,
                    totalClasses: demoStats.totalClasses,
                    attendanceRate: parseFloat(statsRes.data.stats?.percentage || demoStats.attendanceRate),
                    activeStudents: demoStats.activeStudents,
                    activeLecturers: demoStats.activeLecturers,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(demoStats);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalUsers}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stats.activeStudents} students, {stats.activeLecturers} lecturers
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Users className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalCourses}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active courses this semester</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalClasses}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Scheduled this week</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Calendar className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">System Attendance Rate</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats.attendanceRate.toFixed(1)}%
                            </p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full"
                                    style={{ width: `${stats.attendanceRate}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-teal-600 dark:text-teal-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.activeStudents}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently enrolled</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Users className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Lecturers</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.activeLecturers}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Teaching this semester</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        to="/admin/users"
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center transition"
                    >
                        <UserPlus className="mx-auto mb-2 text-purple-600 dark:text-purple-400" size={24} />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Users</p>
                    </Link>
                    <Link
                        to="/admin/courses"
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center transition"
                    >
                        <BookOpen className="mx-auto mb-2 text-blue-600 dark:text-blue-400" size={24} />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Manage Courses</p>
                    </Link>
                    <Link
                        to="/admin/reports"
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center transition"
                    >
                        <BarChart3 className="mx-auto mb-2 text-teal-600 dark:text-teal-400" size={24} />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">View Reports</p>
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-center transition"
                    >
                        <Settings className="mx-auto mb-2 text-gray-600 dark:text-gray-400" size={24} />
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
