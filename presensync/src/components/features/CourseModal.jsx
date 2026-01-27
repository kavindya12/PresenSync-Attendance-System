import React, { useState, useEffect } from 'react';
import { X, BookOpen, User, Building2, Calendar, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CourseModal = ({ isOpen, onClose, onSave, course = null, mode = 'add' }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        semester: 'Fall 2024',
        department: 'Computer Science',
        lecturer_id: '',
        description: '',
    });
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingLecturers, setLoadingLecturers] = useState(true);

    const departments = [
        'Computer Science',
        'Information Technology',
        'Cybersecurity',
        'Data Science',
        'Software Engineering',
        'Network Engineering',
    ];

    const semesters = [
        'Fall 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2025',
        'Spring 2025',
    ];

    useEffect(() => {
        if (isOpen) {
            fetchLecturers();
            if (mode === 'edit' && course) {
                setFormData({
                    code: course.code || '',
                    name: course.name || '',
                    semester: course.semester || 'Fall 2024',
                    department: course.department || 'Computer Science',
                    lecturer_id: course.lecturer_id || course.lecturer?.id || '',
                    description: course.description || '',
                });
            } else {
                setFormData({
                    code: '',
                    name: '',
                    semester: 'Fall 2024',
                    department: 'Computer Science',
                    lecturer_id: '',
                    description: '',
                });
            }
            setError('');
        }
    }, [isOpen, course, mode]);

    const fetchLecturers = async () => {
        try {
            setLoadingLecturers(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, department')
                .eq('role', 'lecturer')
                .order('full_name');

            if (error) throw error;

            setLecturers(data || []);
        } catch (error) {
            console.error('Error fetching lecturers:', error);
            setLecturers([]);
        } finally {
            setLoadingLecturers(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.code || !formData.name || !formData.lecturer_id) {
            setError('Please fill in all required fields (Code, Name, and Lecturer)');
            setLoading(false);
            return;
        }

        try {
            if (mode === 'add') {
                // Create new course
                const { data, error } = await supabase
                    .from('courses')
                    .insert([{
                        code: formData.code.trim().toUpperCase(),
                        name: formData.name.trim(),
                        semester: formData.semester,
                        department: formData.department,
                        lecturer_id: formData.lecturer_id,
                        description: formData.description || null,
                    }])
                    .select(`
                        *,
                        profiles:lecturer_id (
                            id,
                            full_name,
                            email
                        )
                    `)
                    .single();

                if (error) {
                    // Check if it's a unique constraint violation
                    if (error.code === '23505' || error.message?.includes('duplicate')) {
                        throw new Error('A course with this code already exists');
                    }
                    throw error;
                }

                onSave(data);
            } else {
                // Update existing course
                const { data, error } = await supabase
                    .from('courses')
                    .update({
                        code: formData.code.trim().toUpperCase(),
                        name: formData.name.trim(),
                        semester: formData.semester,
                        department: formData.department,
                        lecturer_id: formData.lecturer_id,
                        description: formData.description || null,
                    })
                    .eq('id', course.id)
                    .select(`
                        *,
                        profiles:lecturer_id (
                            id,
                            full_name,
                            email
                        )
                    `)
                    .single();

                if (error) {
                    // Check if it's a unique constraint violation
                    if (error.code === '23505' || error.message?.includes('duplicate')) {
                        throw new Error('A course with this code already exists');
                    }
                    throw error;
                }

                onSave(data);
            }
            onClose();
        } catch (error) {
            console.error('Error saving course:', error);
            setError(error.message || 'Failed to save course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {mode === 'add' ? 'Add New Course' : 'Edit Course'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Course Code */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <BookOpen size={16} />
                            Course Code *
                        </label>
                        <input
                            type="text"
                            name="code"
                            required
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="e.g., CS101"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            maxLength={10}
                        />
                    </div>

                    {/* Course Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <BookOpen size={16} />
                            Course Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Introduction to Computer Science"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Grid: Semester and Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar size={16} />
                                Semester
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                {semesters.map(sem => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Building2 size={16} />
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Lecturer */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <User size={16} />
                            Lecturer *
                        </label>
                        {loadingLecturers ? (
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <p className="text-sm text-gray-500">Loading lecturers...</p>
                            </div>
                        ) : (
                            <select
                                name="lecturer_id"
                                required
                                value={formData.lecturer_id}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Select a lecturer</option>
                                {lecturers.map(lecturer => (
                                    <option key={lecturer.id} value={lecturer.id}>
                                        {lecturer.full_name || lecturer.email} {lecturer.department ? `(${lecturer.department})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        {lecturers.length === 0 && !loadingLecturers && (
                            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                No lecturers found. Please create lecturer profiles first.
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FileText size={16} />
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Course description, objectives, prerequisites..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : mode === 'add' ? 'Add Course' : 'Update Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseModal;
