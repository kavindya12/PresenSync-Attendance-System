import React, { useState, useEffect } from 'react';
import { QrCode, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseAPI, attendanceAPI, classAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const StudentOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        enrolledCourses: 0,
        classesToday: 0,
    });
    const [todayClasses, setTodayClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Demo data for IT undergraduate student
            const demoStats = {
                attendancePercentage: 91.5,
                enrolledCourses: 6,
                classesToday: 3,
            };

            const demoTodayClasses = [
                {
                    id: '1',
                    course: { code: 'CS101', name: 'Introduction to Computer Science' },
                    title: 'Lecture 12: Object-Oriented Programming Concepts',
                    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 201',
                },
                {
                    id: '2',
                    course: { code: 'CS201', name: 'Data Structures and Algorithms' },
                    title: 'Lecture 10: Binary Trees and Traversal',
                    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 305',
                },
                {
                    id: '3',
                    course: { code: 'CS202', name: 'Object-Oriented Programming' },
                    title: 'Lab Session 7: Java Collections Framework',
                    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 7.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 203',
                },
            ];

            try {
                // Fetch courses
                const coursesRes = await courseAPI.getAllCourses().catch(() => ({ data: { courses: [] } }));
                const courses = coursesRes.data.courses || [];
                setStats(prev => ({ ...prev, enrolledCourses: courses.length || demoStats.enrolledCourses }));

                // Fetch today's classes
                const classesRes = await classAPI.getAllClasses({
                    startDate: today.toISOString(),
                    endDate: tomorrow.toISOString(),
                }).catch(() => ({ data: { classes: [] } }));
                const classes = classesRes.data.classes || [];
                setStats(prev => ({ ...prev, classesToday: classes.length || demoStats.classesToday }));
                
                if (classes.length > 0) {
                    setTodayClasses(classes);
                } else {
                    setTodayClasses(demoTodayClasses);
                }

                // Fetch attendance stats
                const statsRes = await attendanceAPI.getAttendanceStats({
                    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
                }).catch(() => ({ data: { stats: {} } }));
                const statsData = statsRes.data.stats || {};
                setStats(prev => ({
                    ...prev,
                    attendancePercentage: parseFloat(statsData.percentage || demoStats.attendancePercentage),
                }));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Use demo data on error
                setStats(demoStats);
                setTodayClasses(demoTodayClasses);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Attendance</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.attendancePercentage.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Enrolled Courses</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.enrolledCourses}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Classes Today</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.classesToday}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                        <QrCode size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Quick Scan</p>
                        <Link
                            to="/student/scan"
                            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                        >
                            Mark Attendance →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            to="/student/scan"
                            className="block w-full text-center py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        >
                            Scan Attendance QR
                        </Link>
                        <Link
                            to="/student/courses"
                            className="block w-full text-center py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                        >
                            View My Courses
                        </Link>
                        <Link
                            to="/student/leaves"
                            className="block w-full text-center py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                        >
                            Leave Requests
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-lg mb-4">Today's Schedule</h3>
                    <div className="space-y-4">
                        {todayClasses.length > 0 ? (
                            todayClasses.map((classItem) => (
                                <div
                                    key={classItem.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{classItem.course?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(classItem.startTime), 'hh:mm a')} -{' '}
                                            {format(new Date(classItem.endTime), 'hh:mm a')}
                                        </p>
                                        <p className="text-xs text-gray-400">{classItem.room || 'Room TBA'}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                        {new Date(classItem.startTime) > new Date() ? 'Upcoming' : 'In Progress'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOverview;
