import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { courseAPI } from '../../api/endpoints';
import CourseModal from '../../components/features/CourseModal';
import CourseDetailsModal from '../../components/features/CourseDetailsModal';
import { supabase } from '../../lib/supabaseClient';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Comprehensive demo data for IT undergraduate courses/modules
    const demoCourses = [
        // Foundation Courses - Computer Science
        { id: '1', code: 'CS101', name: 'Introduction to Computer Science', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. Sarah Johnson' } },
        { id: '2', code: 'CS102', name: 'Programming Fundamentals', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. Michael Chen' } },
        { id: '3', code: 'CS103', name: 'Discrete Mathematics', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Emily Rodriguez' } },
        { id: '4', code: 'CS104', name: 'Computer Systems Fundamentals', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        
        // Core CS Courses - Year 2
        { id: '5', code: 'CS201', name: 'Data Structures and Algorithms', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Michael Chen' } },
        { id: '6', code: 'CS202', name: 'Object-Oriented Programming', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. David Kim' } },
        { id: '7', code: 'CS203', name: 'Computer Organization and Architecture', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        { id: '8', code: 'CS204', name: 'Software Design Principles', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. Michael Chen' } },
        
        // Advanced CS Courses - Year 3
        { id: '9', code: 'CS301', name: 'Database Systems', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. Emily Rodriguez' } },
        { id: '10', code: 'CS302', name: 'Operating Systems', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Carlos Martinez' } },
        { id: '11', code: 'CS303', name: 'Computer Networks', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Jennifer Brown' } },
        { id: '12', code: 'CS304', name: 'Software Testing and Quality Assurance', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. David Kim' } },
        
        // Specialized CS Courses - Year 4
        { id: '13', code: 'CS401', name: 'Software Engineering', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. David Kim' } },
        { id: '14', code: 'CS402', name: 'Software Design Patterns', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. Michael Chen' } },
        { id: '15', code: 'CS403', name: 'Distributed Systems', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Carlos Martinez' } },
        { id: '16', code: 'CS404', name: 'Cloud Computing', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Jennifer Brown' } },
        
        // Advanced Topics - Year 4/5
        { id: '17', code: 'CS501', name: 'Machine Learning Fundamentals', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. James Wilson' } },
        { id: '18', code: 'CS502', name: 'Artificial Intelligence', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        { id: '19', code: 'CS503', name: 'Deep Learning', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Dr. James Wilson' } },
        { id: '20', code: 'CS504', name: 'Natural Language Processing', semester: 'Fall 2024', department: 'Computer Science', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        
        // Information Technology Courses
        { id: '21', code: 'IT101', name: 'Introduction to Information Technology', semester: 'Fall 2024', department: 'Information Technology', lecturer: { fullName: 'Prof. Kevin Lee' } },
        { id: '22', code: 'IT201', name: 'Network Administration', semester: 'Fall 2024', department: 'Information Technology', lecturer: { fullName: 'Prof. Kevin Lee' } },
        { id: '23', code: 'IT301', name: 'Web Development Technologies', semester: 'Fall 2024', department: 'Information Technology', lecturer: { fullName: 'Prof. Lisa Anderson' } },
        { id: '24', code: 'IT302', name: 'Mobile Application Development', semester: 'Fall 2024', department: 'Information Technology', lecturer: { fullName: 'Prof. Lisa Anderson' } },
        { id: '25', code: 'IT401', name: 'Enterprise Systems Integration', semester: 'Fall 2024', department: 'Information Technology', lecturer: { fullName: 'Prof. Kevin Lee' } },
        
        // Cybersecurity Courses
        { id: '26', code: 'CY201', name: 'Introduction to Cybersecurity', semester: 'Fall 2024', department: 'Cybersecurity', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        { id: '27', code: 'CY301', name: 'Network Security', semester: 'Fall 2024', department: 'Cybersecurity', lecturer: { fullName: 'Prof. Carlos Martinez' } },
        { id: '28', code: 'CY302', name: 'Ethical Hacking', semester: 'Fall 2024', department: 'Cybersecurity', lecturer: { fullName: 'Prof. Sarah Thomas' } },
        { id: '29', code: 'CY401', name: 'Digital Forensics', semester: 'Fall 2024', department: 'Cybersecurity', lecturer: { fullName: 'Prof. Carlos Martinez' } },
        
        // Data Science Courses
        { id: '30', code: 'DS201', name: 'Data Analytics Fundamentals', semester: 'Fall 2024', department: 'Data Science', lecturer: { fullName: 'Dr. Jennifer Brown' } },
        { id: '31', code: 'DS301', name: 'Big Data Technologies', semester: 'Fall 2024', department: 'Data Science', lecturer: { fullName: 'Dr. Jennifer Brown' } },
        { id: '32', code: 'DS302', name: 'Data Visualization', semester: 'Fall 2024', department: 'Data Science', lecturer: { fullName: 'Dr. Jennifer Brown' } },
        { id: '33', code: 'DS401', name: 'Advanced Data Mining', semester: 'Fall 2024', department: 'Data Science', lecturer: { fullName: 'Dr. Jennifer Brown' } },
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // Try to fetch from Supabase first
            const { data: supabaseCourses, error: supabaseError } = await supabase
                .from('courses')
                .select(`
                    *,
                    profiles:lecturer_id (
                        id,
                        full_name,
                        email,
                        department
                    )
                `)
                .order('created_at', { ascending: false });

            if (!supabaseError && supabaseCourses && supabaseCourses.length > 0) {
                // Transform Supabase data to match expected format
                const transformedCourses = supabaseCourses.map(course => ({
                    id: course.id,
                    code: course.code,
                    name: course.name,
                    semester: course.semester,
                    department: course.department,
                    lecturer_id: course.lecturer_id,
                    description: course.description,
                    created_at: course.created_at,
                    lecturer: course.profiles ? {
                        id: course.profiles.id,
                        fullName: course.profiles.full_name,
                        email: course.profiles.email,
                    } : null,
                }));
                setCourses(transformedCourses);
            } else {
                // Fallback to API endpoint
                const response = await courseAPI.getAllCourses().catch(() => ({ data: { courses: [] } }));
                if (response.data.courses && response.data.courses.length > 0) {
                    setCourses(response.data.courses);
                } else {
                    setCourses(demoCourses);
                }
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses(demoCourses);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = (newCourse) => {
        // Refresh the courses list to get the latest data
        fetchCourses();
        setShowAddModal(false);
    };

    const handleEditCourse = (updatedCourse) => {
        // Refresh the courses list to get the latest data
        fetchCourses();
        setShowEditModal(false);
        setSelectedCourse(null);
    };

    const handleViewDetails = (course) => {
        setSelectedCourse(course);
        setShowDetailsModal(true);
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setShowEditModal(true);
    };

    const filteredCourses = courses.filter(course =>
        course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Course Management</h2>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    <Plus size={20} />
                    <span>Add Course</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses by code, name, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="text-purple-600 dark:text-purple-400" size={20} />
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
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

                        <div className="space-y-2 mb-4">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Department:</span> {course.department || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Lecturer:</span> {course.lecturer?.fullName || 'TBA'}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleEdit(course)}
                                className="flex-1 px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleViewDetails(course)}
                                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No courses found</p>
                </div>
            )}

            {/* Add Course Modal */}
            <CourseModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddCourse}
                mode="add"
            />

            {/* Edit Course Modal */}
            <CourseModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCourse(null);
                }}
                onSave={handleEditCourse}
                course={selectedCourse}
                mode="edit"
            />

            {/* Course Details Modal */}
            <CourseDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedCourse(null);
                }}
                course={selectedCourse}
            />
        </div>
    );
};

export default AdminCourses;
