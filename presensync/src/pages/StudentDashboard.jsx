
import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, QrCode, BookOpen, FileText, LogOut, User } from 'lucide-react';
import StudentOverview from './student/Overview';
import StudentScan from './student/Scan';

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
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-teal-700">Presen<span className="text-orange-500">Sync</span></h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Student Portal</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 mb-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed w-full bg-white z-20 border-b px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold text-teal-700">PresenSync</h1>
                <button className="text-gray-600"><User size={24} /></button>
                {/* Simple mobile menu trigger would go here */}
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-gray-50">
                <Routes>
                    <Route path="/" element={<StudentOverview />} />
                    <Route path="/scan" element={<StudentScan />} />
                    <Route path="/courses" element={<div className="text-gray-500 text-center py-20">Courses coming soon</div>} />
                    <Route path="/leaves" element={<div className="text-gray-500 text-center py-20">Leaves coming soon</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
