
import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, QrCode, BookOpen, FileText, LogOut, User, Trophy } from 'lucide-react';
import StudentOverview from './student/Overview';
import StudentScan from './student/Scan';
import Gamification from './student/Gamification';
import ThemeToggle from '../components/common/ThemeToggle';

const StudentDashboard = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
        { path: '/student/scan', icon: <QrCode size={20} />, label: 'Scan QR' },
        { path: '/student/courses', icon: <BookOpen size={20} />, label: 'My Courses' },
        { path: '/student/leaves', icon: <FileText size={20} />, label: 'Leave Requests' },
        { path: '/student/achievements', icon: <Trophy size={20} />, label: 'Achievements' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">Presen<span className="text-orange-500 dark:text-orange-400">Sync</span></h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Student Portal</p>
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
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium'
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
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.fullName || 'User'}</p>
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

            {/* Mobile Header */}
            <div className="md:hidden fixed w-full bg-white dark:bg-gray-800 z-20 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold text-teal-700 dark:text-teal-400">PresenSync</h1>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button className="text-gray-600 dark:text-gray-300"><User size={24} /></button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-gray-50 dark:bg-gray-900">
                <Routes>
                    <Route path="/" element={<StudentOverview />} />
                    <Route path="/scan" element={<StudentScan />} />
                    <Route path="/courses" element={<div className="text-gray-500 dark:text-gray-400 text-center py-20">Courses coming soon</div>} />
                    <Route path="/leaves" element={<div className="text-gray-500 dark:text-gray-400 text-center py-20">Leaves coming soon</div>} />
                    <Route path="/achievements" element={<Gamification />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
