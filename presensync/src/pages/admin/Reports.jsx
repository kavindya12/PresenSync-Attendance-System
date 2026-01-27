import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, Clock } from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const AdminReports = () => {
    const [selectedReport, setSelectedReport] = useState('attendance');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    const reportTypes = [
        { id: 'attendance', name: 'Attendance Report', description: 'Overall attendance statistics and trends' },
        { id: 'courses', name: 'Course Report', description: 'Course enrollment and performance metrics' },
        { id: 'users', name: 'User Activity Report', description: 'User login and activity statistics' },
        { id: 'system', name: 'System Report', description: 'System usage and performance metrics' },
    ];

    // Color palette for charts
    const COLORS = {
        primary: '#9333ea', // purple-600
        secondary: '#8b5cf6', // purple-500
        success: '#10b981', // green-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444', // red-500
        info: '#3b82f6', // blue-500
    };

    const CHART_COLORS = ['#9333ea', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

    useEffect(() => {
        fetchChartData();
    }, [selectedReport]);

    const fetchChartData = async () => {
        try {
            setLoading(true);
            
            // Simulate fetching data - in production, fetch from Supabase
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate dynamic data based on report type
            const data = generateChartData(selectedReport);
            setChartData(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (reportType) => {
        const now = new Date();
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        switch (reportType) {
            case 'attendance':
                return {
                    daily: days.map((day, i) => ({
                        date: day,
                        present: Math.floor(Math.random() * 200) + 150,
                        absent: Math.floor(Math.random() * 30) + 10,
                        late: Math.floor(Math.random() * 20) + 5,
                    })),
                    weekly: [
                        { week: 'Week 1', attendance: 92.5, target: 90 },
                        { week: 'Week 2', attendance: 88.3, target: 90 },
                        { week: 'Week 3', attendance: 94.1, target: 90 },
                        { week: 'Week 4', attendance: 91.7, target: 90 },
                        { week: 'Week 5', attendance: 89.8, target: 90 },
                    ],
                    byMethod: [
                        { name: 'QR Code', value: 1250, color: COLORS.primary },
                        { name: 'NFC', value: 320, color: COLORS.secondary },
                        { name: 'Beacon', value: 180, color: COLORS.info },
                        { name: 'Manual', value: 95, color: COLORS.warning },
                    ],
                    byCourse: [
                        { course: 'CS101', attendance: 94.2, students: 45 },
                        { course: 'CS201', attendance: 88.5, students: 38 },
                        { course: 'CS301', attendance: 91.3, students: 42 },
                        { course: 'IT301', attendance: 89.7, students: 35 },
                        { course: 'CS401', attendance: 93.1, students: 40 },
                    ],
                };
            
            case 'courses':
                return {
                    enrollment: [
                        { course: 'CS101', enrolled: 145, capacity: 150 },
                        { course: 'CS201', enrolled: 128, capacity: 150 },
                        { course: 'CS301', enrolled: 142, capacity: 150 },
                        { course: 'IT301', enrolled: 135, capacity: 150 },
                        { course: 'CS401', enrolled: 140, capacity: 150 },
                    ],
                    performance: days.slice(0, 7).map((day, i) => ({
                        date: day,
                        average: Math.floor(Math.random() * 15) + 85,
                        highest: Math.floor(Math.random() * 10) + 95,
                        lowest: Math.floor(Math.random() * 10) + 70,
                    })),
                    distribution: [
                        { name: 'Computer Science', value: 45, color: COLORS.primary },
                        { name: 'IT', value: 25, color: COLORS.secondary },
                        { name: 'Cybersecurity', value: 15, color: COLORS.info },
                        { name: 'Data Science', value: 15, color: COLORS.success },
                    ],
                };
            
            case 'users':
                return {
                    activity: days.map((day, i) => ({
                        date: day,
                        logins: Math.floor(Math.random() * 100) + 200,
                        active: Math.floor(Math.random() * 80) + 150,
                    })),
                    byRole: [
                        { role: 'Students', count: 1250, color: COLORS.primary },
                        { role: 'Lecturers', count: 45, color: COLORS.secondary },
                        { role: 'Admins', count: 5, color: COLORS.info },
                    ],
                    hourly: Array.from({ length: 24 }, (_, i) => ({
                        hour: `${i}:00`,
                        users: i >= 8 && i <= 17 
                            ? Math.floor(Math.random() * 50) + 100 
                            : Math.floor(Math.random() * 20) + 10,
                    })),
                };
            
            case 'system':
                return {
                    usage: days.map((day, i) => ({
                        date: day,
                        requests: Math.floor(Math.random() * 5000) + 10000,
                        responseTime: Math.floor(Math.random() * 50) + 100,
                    })),
                    byFeature: [
                        { feature: 'QR Scan', usage: 1850, color: COLORS.primary },
                        { feature: 'Attendance', usage: 1200, color: COLORS.secondary },
                        { feature: 'Reports', usage: 450, color: COLORS.info },
                        { feature: 'Courses', usage: 320, color: COLORS.success },
                    ],
                    performance: days.slice(0, 7).map((day, i) => ({
                        date: day,
                        cpu: Math.floor(Math.random() * 20) + 40,
                        memory: Math.floor(Math.random() * 15) + 50,
                        storage: Math.floor(Math.random() * 10) + 60,
                    })),
                };
            
            default:
                return null;
        }
    };

    const renderCharts = () => {
        if (loading) {
            return (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            );
        }

        if (!chartData) return null;

        switch (selectedReport) {
            case 'attendance':
                return (
                    <div className="space-y-6">
                        {/* Daily Attendance Trend */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Daily Attendance Trend (Last 30 Days)
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData.daily}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="present" stroke={COLORS.success} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                                    <Area type="monotone" dataKey="absent" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Weekly Attendance vs Target */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Weekly Attendance vs Target
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData.weekly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Legend />
                                        <Bar dataKey="attendance" fill={COLORS.primary} name="Attendance %" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="target" fill={COLORS.warning} name="Target %" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Attendance by Method */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Attendance by Method
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.byMethod}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.byMethod.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Course-wise Attendance */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Course-wise Attendance Performance
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.byCourse} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                                    <YAxis dataKey="course" type="category" stroke="#6b7280" fontSize={12} width={80} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend />
                                    <Bar dataKey="attendance" fill={COLORS.primary} name="Attendance %" radius={[0, 8, 8, 0]} />
                                    <Bar dataKey="students" fill={COLORS.secondary} name="Students" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            case 'courses':
                return (
                    <div className="space-y-6">
                        {/* Enrollment vs Capacity */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Course Enrollment vs Capacity
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.enrollment}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="course" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend />
                                    <Bar dataKey="enrolled" fill={COLORS.primary} name="Enrolled" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="capacity" fill={COLORS.warning} name="Capacity" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Trend */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Performance Trend
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData.performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="average" stroke={COLORS.primary} strokeWidth={2} name="Average" />
                                        <Line type="monotone" dataKey="highest" stroke={COLORS.success} strokeWidth={2} name="Highest" />
                                        <Line type="monotone" dataKey="lowest" stroke={COLORS.danger} strokeWidth={2} name="Lowest" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Department Distribution */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Course Distribution by Department
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.distribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );

            case 'users':
                return (
                    <div className="space-y-6">
                        {/* User Activity Trend */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Daily User Activity (Last 30 Days)
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData.activity}>
                                    <defs>
                                        <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.info} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="logins" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorLogins)" name="Logins" />
                                    <Area type="monotone" dataKey="active" stroke={COLORS.info} fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Users by Role */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Users by Role
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={chartData.byRole}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ role, count }) => `${role}: ${count}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {chartData.byRole.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Hourly Activity */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Hourly User Activity
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData.hourly}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Bar dataKey="users" fill={COLORS.primary} radius={[8, 8, 0, 0]} name="Active Users" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );

            case 'system':
                return (
                    <div className="space-y-6">
                        {/* System Usage */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                System Usage (Last 30 Days)
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData.usage}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px'
                                        }} 
                                    />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="requests" stroke={COLORS.primary} strokeWidth={2} name="Requests" />
                                    <Line yAxisId="right" type="monotone" dataKey="responseTime" stroke={COLORS.warning} strokeWidth={2} name="Response Time (ms)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Feature Usage */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Feature Usage
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData.byFeature} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" stroke="#6b7280" fontSize={12} />
                                        <YAxis dataKey="feature" type="category" stroke="#6b7280" fontSize={12} width={100} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Bar dataKey="usage" fill={COLORS.primary} radius={[0, 8, 8, 0]} name="Usage Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* System Performance */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    System Performance Metrics
                                </h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData.performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="cpu" stroke={COLORS.danger} strokeWidth={2} name="CPU %" />
                                        <Line type="monotone" dataKey="memory" stroke={COLORS.warning} strokeWidth={2} name="Memory %" />
                                        <Line type="monotone" dataKey="storage" stroke={COLORS.info} strokeWidth={2} name="Storage %" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Reports & Analytics</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                    <Download size={20} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportTypes.map((report) => (
                    <button
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={`p-4 rounded-xl border-2 transition ${
                            selectedReport === report.id
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                        }`}
                    >
                        <BarChart3 className={`mb-2 ${selectedReport === report.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} size={24} />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{report.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
                    </button>
                ))}
            </div>

            {/* Report Content */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {reportTypes.find(r => r.id === selectedReport)?.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Calendar className="text-gray-400" size={20} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">1,250</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Average Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">87.5%</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">+5.2%</p>
                        </div>
                    </div>

                    {/* Modern Chart Visualizations */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                        {renderCharts()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
