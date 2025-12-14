import React, { useState, useEffect } from 'react';
import { courseAPI, classAPI, attendanceAPI } from '../../api/endpoints';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

const LecturerOverview = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        todayClasses: 0,
        totalStudents: 0,
        attendanceRate: 0,
    });
    const [recentClasses, setRecentClasses] = useState([]);
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

            // Fetch courses
            const coursesRes = await courseAPI.getAllCourses();
            const courses = coursesRes.data.courses || [];
            setStats(prev => ({ ...prev, totalCourses: courses.length }));

            // Fetch today's classes
            const classesRes = await classAPI.getAllClasses({
                startDate: today.toISOString(),
                endDate: tomorrow.toISOString(),
            });
            const classes = classesRes.data.classes || [];
            setStats(prev => ({ ...prev, todayClasses: classes.length }));
            setRecentClasses(classes.slice(0, 5));

            // Calculate total students across all courses
            let totalStudents = 0;
            for (const course of courses) {
                const studentsRes = await courseAPI.getEnrolledStudents(course.id);
                totalStudents += (studentsRes.data.students || []).length;
            }
            setStats(prev => ({ ...prev, totalStudents }));

            // Fetch attendance stats
            const statsRes = await attendanceAPI.getAttendanceStats();
            const statsData = statsRes.data.stats || {};
            setStats(prev => ({
                ...prev,
                attendanceRate: parseFloat(statsData.percentage || 0),
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
            <h2 className="text-2xl font-bold text-gray-800">Lecturer Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Courses</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalCourses}</p>
                        </div>
                        <div className="bg-teal-100 p-3 rounded-lg">
                            <Calendar className="text-teal-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Today's Classes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.todayClasses}</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <Clock className="text-orange-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Attendance Rate</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-4">Recent Classes</h3>
                {recentClasses.length > 0 ? (
                    <div className="space-y-3">
                        {recentClasses.map((classItem) => (
                            <div
                                key={classItem.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium">{classItem.course?.name || 'N/A'}</p>
                                    <p className="text-sm text-gray-500">{classItem.title}</p>
                                    <p className="text-xs text-gray-400">{classItem.room || 'Room TBA'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {new Date(classItem.startTime).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {classItem._count?.attendanceRecords || 0} present
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
                )}
            </div>
        </div>
    );
};

export default LecturerOverview;

