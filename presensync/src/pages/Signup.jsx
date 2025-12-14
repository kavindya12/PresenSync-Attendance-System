import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [studentId, setStudentId] = useState('');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const redirectByRole = (role) => {
        switch (role) {
            case 'STUDENT':
                navigate('/student');
                break;
            case 'LECTURER':
                navigate('/lecturer');
                break;
            case 'ADMIN':
            case 'DEPT_HEAD':
                navigate('/admin');
                break;
            default:
                navigate('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const metadata = {
                fullName,
                role,
                ...(role === 'STUDENT' && studentId && { studentId }),
                ...(department && { department }),
            };
            const { error, data } = await signUp(email, password, metadata);
            if (error) throw new Error(error.message);
            if (data?.user) {
                redirectByRole(data.user.role);
            }
        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-800">
                        Create Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                            sign in to existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="LECTURER">Lecturer</option>
                        </select>
                    </div>

                    {role === 'STUDENT' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department (Optional)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
