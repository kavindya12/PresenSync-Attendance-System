
import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, QrCode, BookOpen, FileText, LogOut, User, Menu, X } from 'lucide-react';
import StudentOverview from './student/Overview';
import StudentScan from './student/Scan';
import Courses from './student/Courses';
import LeaveRequests from './student/LeaveRequests';
import ThemeToggle from '../components/common/ThemeToggle';

const StudentDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
        { path: '/student/scan', icon: <QrCode size={20} />, label: 'Scan QR' },
        { path: '/student/courses', icon: <BookOpen size={20} />, label: 'My Courses' },
        { path: '/student/leaves', icon: <FileText size={20} />, label: 'Leave Requests' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out shadow-lg ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">Presen<span className="text-orange-500 dark:text-orange-400">Sync</span></h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Student Portal</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                title="Close sidebar"
                            >
                                <X size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40 text-teal-700 dark:text-teal-300 font-semibold shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:translate-x-1'
                                }`
                            }
                        >
                            <span className={({ isActive }) => isActive ? 'text-teal-600 dark:text-teal-400' : ''}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center space-x-3 mb-4 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-700 flex items-center justify-center text-white font-bold shadow-md">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:shadow-md font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed w-full bg-white dark:bg-gray-800 z-30 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center shadow-sm">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                    <Menu size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-bold text-teal-700 dark:text-teal-400">PresenSync</h1>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-gray-50 dark:bg-gray-900">
                <Routes>
                    <Route path="/" element={<StudentOverview />} />
                    <Route path="/scan" element={<StudentScan />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/leaves" element={<LeaveRequests />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
