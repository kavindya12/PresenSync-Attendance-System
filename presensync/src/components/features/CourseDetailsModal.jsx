import React from 'react';
import { X, BookOpen, User, Building2, Calendar, FileText, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const CourseDetailsModal = ({ isOpen, onClose, course }) => {
    if (!isOpen || !course) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Course Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
                            <div>
                                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                    {course.code}
                                </span>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {course.name}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Course Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Semester */}
                        <div className="flex items-start gap-3">
                            <Calendar className="text-gray-400 mt-1" size={20} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Semester</p>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                    {course.semester || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex items-start gap-3">
                            <Building2 className="text-gray-400 mt-1" size={20} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                    {course.department || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Lecturer */}
                        <div className="flex items-start gap-3">
                            <User className="text-gray-400 mt-1" size={20} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Lecturer</p>
                                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                    {course.lecturer?.fullName || course.lecturer?.full_name || course.lecturer?.email || 'TBA'}
                                </p>
                                {course.lecturer?.email && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {course.lecturer.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Created Date */}
                        {course.created_at && (
                            <div className="flex items-start gap-3">
                                <Clock className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                        {format(new Date(course.created_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {course.description && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="text-gray-400" size={20} />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Statistics (if available) */}
                    {course._count && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="text-gray-400" size={20} />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Statistics</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled Students</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {course._count.enrollments || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                        {course._count.classes || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsModal;
