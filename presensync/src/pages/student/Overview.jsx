
import React from 'react';
import { QrCode, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentOverview = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                        <QrCode size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Attendance</p>
                        <p className="text-2xl font-bold text-gray-800">85%</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Enrolled Courses</p>
                        <p className="text-2xl font-bold text-gray-800">6</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Classes Today</p>
                        <p className="text-2xl font-bold text-gray-800">2</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/student/scan" className="block w-full text-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                            Scan Attendance QR
                        </Link>
                        <button className="block w-full text-center py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                            View Schedule
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-4">Today's Schedule</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Software Engineering</p>
                                <p className="text-sm text-gray-500">10:00 AM - 12:00 PM</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Present</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Database Systems</p>
                                <p className="text-sm text-gray-500">02:00 PM - 04:00 PM</p>
                            </div>
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Upcoming</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default StudentOverview;
