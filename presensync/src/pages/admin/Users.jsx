import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter } from 'lucide-react';
import { userAPI } from '../../api/endpoints';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Comprehensive demo data for IT undergraduate system
    const demoUsers = [
        // Students - Computer Science
        { id: '1', email: 'john.doe@university.edu', fullName: 'John Doe', role: 'STUDENT', studentId: 'STU2024001', department: 'Computer Science', isActive: true },
        { id: '2', email: 'sarah.johnson@university.edu', fullName: 'Sarah Johnson', role: 'STUDENT', studentId: 'STU2024002', department: 'Computer Science', isActive: true },
        { id: '3', email: 'michael.wong@university.edu', fullName: 'Michael Wong', role: 'STUDENT', studentId: 'STU2024003', department: 'Computer Science', isActive: true },
        { id: '4', email: 'emily.chen@university.edu', fullName: 'Emily Chen', role: 'STUDENT', studentId: 'STU2024004', department: 'Computer Science', isActive: true },
        { id: '5', email: 'david.kumar@university.edu', fullName: 'David Kumar', role: 'STUDENT', studentId: 'STU2024005', department: 'Computer Science', isActive: true },
        { id: '6', email: 'james.patel@university.edu', fullName: 'James Patel', role: 'STUDENT', studentId: 'STU2024006', department: 'Computer Science', isActive: true },
        { id: '7', email: 'sophia.kim@university.edu', fullName: 'Sophia Kim', role: 'STUDENT', studentId: 'STU2024007', department: 'Computer Science', isActive: true },
        { id: '8', email: 'william.zhang@university.edu', fullName: 'William Zhang', role: 'STUDENT', studentId: 'STU2024008', department: 'Computer Science', isActive: true },
        
        // Students - Information Technology
        { id: '9', email: 'jane.smith@university.edu', fullName: 'Jane Smith', role: 'STUDENT', studentId: 'STU2024009', department: 'Information Technology', isActive: true },
        { id: '10', email: 'robert.tan@university.edu', fullName: 'Robert Tan', role: 'STUDENT', studentId: 'STU2024010', department: 'Information Technology', isActive: true },
        { id: '11', email: 'amanda.lee@university.edu', fullName: 'Amanda Lee', role: 'STUDENT', studentId: 'STU2024011', department: 'Information Technology', isActive: true },
        { id: '12', email: 'lisa.anderson@university.edu', fullName: 'Lisa Anderson', role: 'STUDENT', studentId: 'STU2024012', department: 'Information Technology', isActive: true },
        { id: '13', email: 'thomas.brown@university.edu', fullName: 'Thomas Brown', role: 'STUDENT', studentId: 'STU2024013', department: 'Information Technology', isActive: true },
        { id: '14', email: 'olivia.martinez@university.edu', fullName: 'Olivia Martinez', role: 'STUDENT', studentId: 'STU2024014', department: 'Information Technology', isActive: true },
        
        // Students - Software Engineering
        { id: '15', email: 'alex.wilson@university.edu', fullName: 'Alex Wilson', role: 'STUDENT', studentId: 'STU2024015', department: 'Software Engineering', isActive: true },
        { id: '16', email: 'chloe.davis@university.edu', fullName: 'Chloe Davis', role: 'STUDENT', studentId: 'STU2024016', department: 'Software Engineering', isActive: true },
        { id: '17', email: 'ryan.moore@university.edu', fullName: 'Ryan Moore', role: 'STUDENT', studentId: 'STU2024017', department: 'Software Engineering', isActive: true },
        { id: '18', email: 'mia.taylor@university.edu', fullName: 'Mia Taylor', role: 'STUDENT', studentId: 'STU2024018', department: 'Software Engineering', isActive: true },
        
        // Students - Cybersecurity
        { id: '19', email: 'ethan.jackson@university.edu', fullName: 'Ethan Jackson', role: 'STUDENT', studentId: 'STU2024019', department: 'Cybersecurity', isActive: true },
        { id: '20', email: 'ava.white@university.edu', fullName: 'Ava White', role: 'STUDENT', studentId: 'STU2024020', department: 'Cybersecurity', isActive: true },
        { id: '21', email: 'noah.harris@university.edu', fullName: 'Noah Harris', role: 'STUDENT', studentId: 'STU2024021', department: 'Cybersecurity', isActive: true },
        
        // Students - Data Science
        { id: '22', email: 'isabella.martin@university.edu', fullName: 'Isabella Martin', role: 'STUDENT', studentId: 'STU2024022', department: 'Data Science', isActive: true },
        { id: '23', email: 'lucas.thompson@university.edu', fullName: 'Lucas Thompson', role: 'STUDENT', studentId: 'STU2024023', department: 'Data Science', isActive: true },
        { id: '24', email: 'emma.garcia@university.edu', fullName: 'Emma Garcia', role: 'STUDENT', studentId: 'STU2024024', department: 'Data Science', isActive: true },
        
        // Lecturers - Computer Science
        { id: '25', email: 'dr.chen@university.edu', fullName: 'Dr. Michael Chen', role: 'LECTURER', department: 'Computer Science', isActive: true },
        { id: '26', email: 'prof.rodriguez@university.edu', fullName: 'Prof. Emily Rodriguez', role: 'LECTURER', department: 'Database Systems', isActive: true },
        { id: '27', email: 'dr.kim@university.edu', fullName: 'Dr. David Kim', role: 'LECTURER', department: 'Software Engineering', isActive: true },
        { id: '28', email: 'prof.thomas@university.edu', fullName: 'Prof. Sarah Thomas', role: 'LECTURER', department: 'Cybersecurity', isActive: true },
        { id: '29', email: 'dr.wilson@university.edu', fullName: 'Dr. James Wilson', role: 'LECTURER', department: 'Machine Learning', isActive: true },
        { id: '30', email: 'prof.martinez@university.edu', fullName: 'Prof. Carlos Martinez', role: 'LECTURER', department: 'Network Security', isActive: true },
        { id: '31', email: 'dr.brown@university.edu', fullName: 'Dr. Jennifer Brown', role: 'LECTURER', department: 'Data Science', isActive: true },
        { id: '32', email: 'prof.anderson@university.edu', fullName: 'Prof. Lisa Anderson', role: 'LECTURER', department: 'Web Development', isActive: true },
        { id: '33', email: 'dr.johnson@university.edu', fullName: 'Dr. Sarah Johnson', role: 'LECTURER', department: 'Computer Science', isActive: true },
        { id: '34', email: 'prof.lee@university.edu', fullName: 'Prof. Kevin Lee', role: 'LECTURER', department: 'Information Technology', isActive: true },
        
        // Admins
        { id: '35', email: 'admin@university.edu', fullName: 'Admin User', role: 'ADMIN', department: 'Administration', isActive: true },
        { id: '36', email: 'dept.head@university.edu', fullName: 'Dr. Robert Head', role: 'DEPT_HEAD', department: 'Computer Science', isActive: true },
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllUsers().catch(() => ({ data: { users: [] } }));
            if (response.data.users && response.data.users.length > 0) {
                setUsers(response.data.users);
            } else {
                setUsers(demoUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers(demoUsers);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role?.toLowerCase() === filterRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role) => {
        const r = (role || '').toLowerCase();
        if (r === 'admin' || r === 'dept_head') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
        if (r === 'lecturer') return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
        return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400';
    };

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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">User Management</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    <UserPlus size={20} />
                    <span>Add User</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or student ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.fullName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            {user.studentId && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">ID: {user.studentId}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.department || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.isActive 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mr-4">
                                            Edit
                                        </button>
                                        <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
