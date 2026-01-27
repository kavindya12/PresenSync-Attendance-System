import React, { useState, useEffect } from 'react';
import { leaveAPI, courseAPI } from '../../api/endpoints';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        classId: '',
        reason: '',
        startDate: '',
        endDate: '',
    });

    // Demo data for IT undergraduate leave requests
    const demoLeaves = [
        {
            id: '1',
            reason: 'Medical appointment for annual checkup',
            startDate: '2024-12-10T09:00:00',
            endDate: '2024-12-10T11:00:00',
            status: 'APPROVED',
            approvedAt: '2024-12-08T10:30:00',
            createdAt: '2024-12-07T14:20:00',
            class: {
                course: {
                    code: 'CS101',
                    name: 'Introduction to Computer Science'
                }
            },
            approver: {
                fullName: 'Dr. Sarah Johnson'
            }
        },
        {
            id: '2',
            reason: 'Family emergency - need to travel home',
            startDate: '2024-12-18T08:00:00',
            endDate: '2024-12-20T17:00:00',
            status: 'PENDING',
            createdAt: '2024-12-12T09:15:00',
            class: {
                course: {
                    code: 'CS201',
                    name: 'Data Structures and Algorithms'
                }
            }
        },
        {
            id: '3',
            reason: 'Participating in Hackathon competition',
            startDate: '2024-12-15T08:00:00',
            endDate: '2024-12-15T17:00:00',
            status: 'APPROVED',
            approvedAt: '2024-12-13T16:45:00',
            createdAt: '2024-12-12T11:30:00',
            class: {
                course: {
                    code: 'IT301',
                    name: 'Web Development Technologies'
                }
            },
            approver: {
                fullName: 'Dr. Lisa Anderson'
            }
        },
        {
            id: '4',
            reason: 'Job interview for software developer position',
            startDate: '2024-12-19T10:00:00',
            endDate: '2024-12-19T14:00:00',
            status: 'PENDING',
            createdAt: '2024-12-14T08:20:00',
            class: {
                course: {
                    code: 'CS401',
                    name: 'Software Engineering'
                }
            }
        },
        {
            id: '5',
            reason: 'Personal reasons - need mental health day',
            startDate: '2024-12-11T08:00:00',
            endDate: '2024-12-11T17:00:00',
            status: 'REJECTED',
            createdAt: '2024-12-09T15:10:00',
            class: {
                course: {
                    code: 'CS301',
                    name: 'Database Systems'
                }
            },
            approver: {
                fullName: 'Dr. Emily Rodriguez'
            }
        }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leavesRes, coursesRes] = await Promise.all([
                leaveAPI.getLeaves().catch(() => ({ data: { leaves: [] } })),
                courseAPI.getAllCourses().catch(() => ({ data: { courses: [] } }))
            ]);

            if (leavesRes.data.leaves && leavesRes.data.leaves.length > 0) {
                setLeaves(leavesRes.data.leaves);
            } else {
                setLeaves(demoLeaves);
            }

            if (coursesRes.data.courses && coursesRes.data.courses.length > 0) {
                setCourses(coursesRes.data.courses);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setLeaves(demoLeaves);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await leaveAPI.createLeave(formData);
            setShowForm(false);
            setFormData({ classId: '', reason: '', startDate: '', endDate: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating leave request:', error);
            alert('Failed to create leave request. Please try again.');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'REJECTED':
                return <XCircle className="text-red-500" size={20} />;
            case 'PENDING':
                return <AlertCircle className="text-yellow-500" size={20} />;
            default:
                return <Clock className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
            case 'REJECTED':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
            case 'PENDING':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Leave Requests</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                    <Plus size={20} />
                    <span>New Request</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Create Leave Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Course/Class
                            </label>
                            <select
                                value={formData.classId}
                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reason
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                rows={3}
                                required
                                placeholder="Please provide a reason for your leave request..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                Submit Request
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ classId: '', reason: '', startDate: '', endDate: '' });
                                }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {leaves.map((leave) => (
                    <div
                        key={leave.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="text-teal-600 dark:text-teal-400" size={20} />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {leave.class?.course?.code || 'N/A'} - {leave.class?.course?.name || 'General Leave'}
                                    </h3>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{leave.reason}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                                {getStatusIcon(leave.status)}
                                <span>{leave.status}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar size={16} />
                                <span>
                                    <strong>Start:</strong> {format(new Date(leave.startDate), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar size={16} />
                                <span>
                                    <strong>End:</strong> {format(new Date(leave.endDate), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <span>Requested: {format(new Date(leave.createdAt), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                            {leave.approver && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <span>Approved by: {leave.approver.fullName}</span>
                                    {leave.approvedAt && (
                                        <span> on {format(new Date(leave.approvedAt), 'MMM d, yyyy')}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {leaves.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No leave requests yet.</p>
                </div>
            )}
        </div>
    );
};

export default LeaveRequests;
