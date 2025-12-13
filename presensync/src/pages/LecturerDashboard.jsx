
import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, BarChart2, LogOut } from 'lucide-react';
import LecturerClasses from './lecturer/Classes';

const LecturerDashboard = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/lecturer', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
        { path: '/lecturer/classes', icon: <Calendar size={20} />, label: 'My Classes' },
        { path: '/lecturer/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/lecturer/reports', icon: <BarChart2 size={20} />, label: 'Reports' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-teal-700">Presen<span className="text-orange-500">Sync</span></h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider text-orange-600">Lecturer Portal</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-orange-50 text-orange-700 font-medium'
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
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            {profile?.full_name?.charAt(0) || 'L'}
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

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-gray-50">
                <Routes>
                    <Route path="/" element={<div className="text-center py-20 text-gray-500">Overview Dashboard Coming Soon</div>} />
                    <Route path="/classes" element={<LecturerClasses />} />
                    <Route path="/students" element={<div className="text-center py-20 text-gray-500">Student List Coming Soon</div>} />
                    <Route path="/reports" element={<div className="text-center py-20 text-gray-500">Analytics Coming Soon</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default LecturerDashboard;
