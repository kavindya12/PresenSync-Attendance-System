import React from 'react';
import { Link } from 'react-router-dom';
import { User, GraduationCap, Shield, ArrowRight } from 'lucide-react';

const DemoAccess = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 text-teal-800">
                        Presen<span className="text-orange-600">Sync</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">Demo Access - All Dashboards</p>
                    <p className="text-sm text-gray-500">Access all dashboards without authentication for testing</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Student Dashboard */}
                    <Link
                        to="/student?demo=true"
                        className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-teal-200 hover:border-teal-400"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition">
                                <User className="text-teal-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Student Dashboard</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                View courses, attendance, leave requests, and achievements
                            </p>
                            <div className="flex items-center text-teal-600 font-semibold group-hover:text-teal-700">
                                <span>Access Dashboard</span>
                                <ArrowRight className="ml-2" size={20} />
                            </div>
                        </div>
                    </Link>

                    {/* Lecturer Dashboard */}
                    <Link
                        to="/lecturer?demo=true"
                        className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-orange-200 hover:border-orange-400"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
                                <GraduationCap className="text-orange-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Lecturer Dashboard</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage classes, generate QR codes, view attendance reports
                            </p>
                            <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700">
                                <span>Access Dashboard</span>
                                <ArrowRight className="ml-2" size={20} />
                            </div>
                        </div>
                    </Link>

                    {/* Admin Dashboard */}
                    <Link
                        to="/admin?demo=true"
                        className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-purple-200 hover:border-purple-400"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                                <Shield className="text-purple-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Manage users, courses, system settings, and analytics
                            </p>
                            <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                                <span>Access Dashboard</span>
                                <ArrowRight className="ml-2" size={20} />
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="text-teal-600 hover:text-teal-700 font-semibold"
                    >
                        Or login with real credentials →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DemoAccess;
