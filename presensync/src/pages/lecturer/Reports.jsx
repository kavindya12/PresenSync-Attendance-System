import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportAPI, courseAPI, attendanceAPI } from '../../api/endpoints';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const LecturerReports = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);

    const COLORS = ['#008080', '#FFA500', '#34A853', '#EA4335', '#4285F4'];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAnalytics();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getAllCourses();
            setCourses(response.data.courses || []);
            if (response.data.courses?.length > 0) {
                setSelectedCourse(response.data.courses[0].id);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getAnalytics({
                courseId: selectedCourse,
            });
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await reportAPI.generatePDFReport({
                courseId: selectedCourse,
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-report-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await reportAPI.generateExcelReport({
                courseId: selectedCourse,
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-report-${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Failed to generate Excel report');
        }
    };

    // Mock data for charts (replace with real analytics data)
    const attendanceData = [
        { name: 'Week 1', present: 45, absent: 5 },
        { name: 'Week 2', present: 48, absent: 2 },
        { name: 'Week 3', present: 42, absent: 8 },
        { name: 'Week 4', present: 50, absent: 0 },
    ];

    const methodData = [
        { name: 'QR', value: 120 },
        { name: 'NFC', value: 30 },
        { name: 'Beacon', value: 15 },
        { name: 'Facial', value: 5 },
        { name: 'Manual', value: 10 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <FileText size={20} />
                        Export PDF
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <FileSpreadsheet size={20} />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-lg mb-4">Attendance Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="present" stroke="#008080" name="Present" />
                                <Line type="monotone" dataKey="absent" stroke="#EA4335" name="Absent" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Attendance by Method */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-lg mb-4">Attendance by Method</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={methodData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {methodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Weekly Attendance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-lg mb-4">Weekly Attendance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" fill="#008080" name="Present" />
                                <Bar dataKey="absent" fill="#EA4335" name="Absent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-lg mb-4">Summary Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Total Attendance Records</span>
                                <span className="font-bold text-gray-800">180</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Average Attendance</span>
                                <span className="font-bold text-teal-600">92.5%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Perfect Attendance</span>
                                <span className="font-bold text-green-600">15 students</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Below Threshold</span>
                                <span className="font-bold text-red-600">3 students</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerReports;

