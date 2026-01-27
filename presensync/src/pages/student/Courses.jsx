import React, { useState, useEffect } from 'react';
import { courseAPI, attendanceAPI } from '../../api/endpoints';
import { BookOpen, Clock, Users, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Demo data for IT undergraduate courses
    const demoCourses = [
        {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Dr. Sarah Johnson' },
            attendancePercentage: 92,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
            room: 'IT Building Room 201'
        },
        {
            id: '2',
            code: 'CS201',
            name: 'Data Structures and Algorithms',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Prof. Michael Chen' },
            attendancePercentage: 88,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
            room: 'IT Building Room 305'
        },
        {
            id: '3',
            code: 'CS301',
            name: 'Database Systems',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Dr. Emily Rodriguez' },
            attendancePercentage: 95,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed 9:00 AM - 10:30 AM',
            room: 'IT Building Room 402'
        },
        {
            id: '4',
            code: 'CS401',
            name: 'Software Engineering',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Prof. David Kim' },
            attendancePercentage: 90,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 11:00 AM - 12:30 PM',
            room: 'IT Building Room 208'
        },
        {
            id: '5',
            code: 'IT301',
            name: 'Web Development Technologies',
            semester: 'Fall 2024',
            department: 'Information Technology',
            lecturer: { fullName: 'Dr. Lisa Anderson' },
            attendancePercentage: 87,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed, Fri 1:00 PM - 2:00 PM',
            room: 'IT Building Lab 105'
        },
        {
            id: '6',
            code: 'CS501',
            name: 'Machine Learning Fundamentals',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Prof. James Wilson' },
            attendancePercentage: 93,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 3:00 PM - 4:30 PM',
            room: 'IT Building Room 310'
        },
        {
            id: '7',
            code: 'CS202',
            name: 'Object-Oriented Programming',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Dr. David Kim' },
            attendancePercentage: 91,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
            room: 'IT Building Lab 203'
        },
        {
            id: '8',
            code: 'CS302',
            name: 'Operating Systems',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Prof. Carlos Martinez' },
            attendancePercentage: 89,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 34 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 9:00 AM - 10:30 AM',
            room: 'IT Building Room 415'
        },
        {
            id: '9',
            code: 'CS303',
            name: 'Computer Networks',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Prof. Jennifer Brown' },
            attendancePercentage: 94,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed 11:00 AM - 12:30 PM',
            room: 'IT Building Room 320'
        },
        {
            id: '10',
            code: 'IT302',
            name: 'Mobile Application Development',
            semester: 'Fall 2024',
            department: 'Information Technology',
            lecturer: { fullName: 'Prof. Lisa Anderson' },
            attendancePercentage: 88,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 1:00 PM - 2:30 PM',
            room: 'IT Building Lab 105'
        },
        {
            id: '11',
            code: 'CS402',
            name: 'Software Design Patterns',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Dr. Michael Chen' },
            attendancePercentage: 92,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
            room: 'IT Building Lab 203'
        },
        {
            id: '8',
            code: 'CS302',
            name: 'Operating Systems',
            semester: 'Fall 2024',
            department: 'Computer Science',
            lecturer: { fullName: 'Dr. Carlos Martinez' },
            attendancePercentage: 89,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 34 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 9:00 AM - 10:30 AM',
            room: 'IT Building Room 415'
        },
        {
            id: '9',
            code: 'IT401',
            name: 'Cloud Computing',
            semester: 'Fall 2024',
            department: 'Information Technology',
            lecturer: { fullName: 'Dr. James Wilson' },
            attendancePercentage: 86,
            totalClasses: 15,
            attendedClasses: 13,
            nextClass: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
            schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
            room: 'IT Building Lab 210'
        },
        {
            id: '10',
            code: 'CS402',
            name: 'Cybersecurity Fundamentals',
            semester: 'Fall 2024',
            department: 'Cybersecurity',
            lecturer: { fullName: 'Prof. Sarah Thomas' },
            attendancePercentage: 94,
            totalClasses: 15,
            attendedClasses: 14,
            nextClass: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
            schedule: 'Tue, Thu 1:00 PM - 2:30 PM',
            room: 'IT Building Room 320'
        },
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAllCourses();
            if (response.data.courses && response.data.courses.length > 0) {
                // Fetch attendance for each course
                const coursesWithAttendance = await Promise.all(
                    response.data.courses.map(async (course) => {
                        try {
                            const attendanceRes = await attendanceAPI.getAttendanceStats({
                                courseId: course.id
                            });
                            return {
                                ...course,
                                attendancePercentage: attendanceRes.data?.attendancePercentage || 0,
                                totalClasses: attendanceRes.data?.totalClasses || 0,
                                attendedClasses: attendanceRes.data?.attendedClasses || 0,
                            };
                        } catch (error) {
                            return course;
                        }
                    })
                );
                setCourses(coursesWithAttendance);
            } else {
                // Use demo data if no courses found
                setCourses(demoCourses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            // Use demo data on error
            setCourses(demoCourses);
        } finally {
            setLoading(false);
        }
    };

    const getAttendanceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400';
        if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getAttendanceBgColor = (percentage) => {
        if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/30';
        if (percentage >= 75) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Courses</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Enrolled
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="text-teal-600 dark:text-teal-400" size={20} />
                                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                                        {course.code}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {course.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {course.semester || 'Fall 2024'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Users size={16} />
                                <span>Lecturer: {course.lecturer?.fullName || 'TBA'}</span>
                            </div>
                            {course.schedule && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Clock size={16} />
                                    <span>{course.schedule}</span>
                                </div>
                            )}
                            {course.room && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <Calendar size={16} />
                                    <span>{course.room}</span>
                                </div>
                            )}
                        </div>

                        <div className={`p-3 rounded-lg ${getAttendanceBgColor(course.attendancePercentage || 0)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Attendance
                                </span>
                                <span className={`text-lg font-bold ${getAttendanceColor(course.attendancePercentage || 0)}`}>
                                    {course.attendancePercentage || 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${
                                        (course.attendancePercentage || 0) >= 90
                                            ? 'bg-green-500'
                                            : (course.attendancePercentage || 0) >= 75
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                                    style={{ width: `${course.attendancePercentage || 0}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <span>
                                    {course.attendedClasses || 0} / {course.totalClasses || 0} classes
                                </span>
                                <TrendingUp size={14} />
                            </div>
                        </div>

                        {course.nextClass && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Class</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {format(new Date(course.nextClass), 'EEE, MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No courses enrolled yet.</p>
                </div>
            )}
        </div>
    );
};

export default Courses;
