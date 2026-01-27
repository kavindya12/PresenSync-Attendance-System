import React, { useState, useEffect } from 'react';
import QRGenerator from '../../components/features/QRGenerator';
import QRGenerationModal from '../../components/features/QRGenerationModal';
import { classAPI, attendanceAPI } from '../../api/endpoints';
import { format } from 'date-fns';
import { QrCode, Users, Clock, MapPin } from 'lucide-react';
import { getSocket, joinClassRoom } from '../../utils/socket';

const LecturerClasses = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrLoading, setQrLoading] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchClassAttendance();
            joinClassRoom(selectedClass.id);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            // Try to fetch from Supabase first
            const { supabase } = await import('../../lib/supabaseClient');
            const { data: supabaseClasses, error: supabaseError } = await supabase
                .from('classes')
                .select(`
                    id,
                    title,
                    room,
                    start_time,
                    end_time,
                    course_id,
                    courses (
                        id,
                        code,
                        name,
                        lecturer_id
                    )
                `)
                .order('start_time', { ascending: false });

            if (!supabaseError && supabaseClasses && supabaseClasses.length > 0) {
                // Transform Supabase data to match expected format
                const transformedClasses = supabaseClasses.map(cls => ({
                    id: cls.id,
                    course: cls.courses ? {
                        id: cls.courses.id,
                        code: cls.courses.code,
                        name: cls.courses.name
                    } : null,
                    title: cls.title,
                    startTime: cls.start_time,
                    endTime: cls.end_time,
                    room: cls.room,
                    courseId: cls.course_id
                }));
                setClasses(transformedClasses);
                if (transformedClasses.length > 0) {
                    setSelectedClass(transformedClasses[0]);
                }
                setLoading(false);
                return;
            }

            // Fallback to API endpoint
            const response = await classAPI.getAllClasses().catch(() => ({ data: { classes: [] } }));
            
            // Comprehensive demo data for IT-related lectures/classes
            const now = Date.now();
            const demoClasses = [
                // Today's Classes
                {
                    id: '1',
                    course: { code: 'CS101', name: 'Introduction to Computer Science' },
                    title: 'Lecture 12: Object-Oriented Programming Concepts',
                    startTime: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 3.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 201',
                    courseId: '1'
                },
                {
                    id: '2',
                    course: { code: 'CS201', name: 'Data Structures and Algorithms' },
                    title: 'Lecture 10: Binary Trees and Traversal Algorithms',
                    startTime: new Date(now + 4 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 5.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 305',
                    courseId: '2'
                },
                {
                    id: '3',
                    course: { code: 'CS202', name: 'Object-Oriented Programming' },
                    title: 'Lab Session 7: Java Collections Framework',
                    startTime: new Date(now + 6 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 7.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 203',
                    courseId: '3'
                },
                {
                    id: '4',
                    course: { code: 'CS301', name: 'Database Systems' },
                    title: 'Lab Session 8: SQL Queries and Joins',
                    startTime: new Date(now + 8 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 9.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 402',
                    courseId: '4'
                },
                
                // Tomorrow's Classes
                {
                    id: '5',
                    course: { code: 'CS401', name: 'Software Engineering' },
                    title: 'Lecture 11: Agile Development Methodologies',
                    startTime: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 25.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 208',
                    courseId: '5'
                },
                {
                    id: '6',
                    course: { code: 'IT301', name: 'Web Development Technologies' },
                    title: 'Lab Session 9: React.js and State Management',
                    startTime: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 27.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 105',
                    courseId: '6'
                },
                {
                    id: '7',
                    course: { code: 'CS302', name: 'Operating Systems' },
                    title: 'Lecture 9: Process Scheduling Algorithms',
                    startTime: new Date(now + 28 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 29.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 415',
                    courseId: '7'
                },
                {
                    id: '8',
                    course: { code: 'CS303', name: 'Computer Networks' },
                    title: 'Lecture 8: TCP/IP Protocol Suite',
                    startTime: new Date(now + 30 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 31.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 320',
                    courseId: '8'
                },
                
                // Day After Tomorrow
                {
                    id: '9',
                    course: { code: 'CS501', name: 'Machine Learning Fundamentals' },
                    title: 'Lecture 13: Neural Networks and Deep Learning',
                    startTime: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 49.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 310',
                    courseId: '9'
                },
                {
                    id: '10',
                    course: { code: 'CS502', name: 'Artificial Intelligence' },
                    title: 'Lab Session 10: Implementing Search Algorithms',
                    startTime: new Date(now + 50 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 51.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 310',
                    courseId: '10'
                },
                {
                    id: '11',
                    course: { code: 'CY301', name: 'Network Security' },
                    title: 'Lecture 7: Firewall Configuration and Management',
                    startTime: new Date(now + 52 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 53.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 405',
                    courseId: '11'
                },
                {
                    id: '12',
                    course: { code: 'DS301', name: 'Big Data Technologies' },
                    title: 'Lab Session 6: Hadoop and MapReduce',
                    startTime: new Date(now + 54 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 55.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 501',
                    courseId: '12'
                },
                
                // Additional Classes
                {
                    id: '13',
                    course: { code: 'CS402', name: 'Software Design Patterns' },
                    title: 'Lecture 10: Creational and Structural Patterns',
                    startTime: new Date(now + 72 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 73.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 208',
                    courseId: '13'
                },
                {
                    id: '14',
                    course: { code: 'IT302', name: 'Mobile Application Development' },
                    title: 'Lab Session 8: React Native Development',
                    startTime: new Date(now + 74 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 75.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Lab 105',
                    courseId: '14'
                },
                {
                    id: '15',
                    course: { code: 'CS403', name: 'Distributed Systems' },
                    title: 'Lecture 9: Microservices Architecture',
                    startTime: new Date(now + 76 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(now + 77.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 415',
                    courseId: '15'
                },
            ];
            
            if (response.data.classes && response.data.classes.length > 0) {
                setClasses(response.data.classes);
                if (response.data.classes.length > 0) {
                    setSelectedClass(response.data.classes[0]);
                }
            } else {
                // Use demo data but show warning
                console.warn('Using demo classes. QR generation will not work with demo data. Please create classes in the database.');
                setClasses(demoClasses);
                setSelectedClass(demoClasses[0]);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            // Use demo data on error
            const demoClasses = [
                {
                    id: '1',
                    course: { code: 'CS101', name: 'Introduction to Computer Science' },
                    title: 'Lecture 12: Object-Oriented Programming Concepts',
                    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    endTime: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
                    room: 'IT Building Room 201',
                },
            ];
            setClasses(demoClasses);
            setSelectedClass(demoClasses[0]);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassAttendance = async () => {
        if (!selectedClass) return;
        try {
            const response = await attendanceAPI.getClassAttendance(selectedClass.id);
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleGenerateQR = async (qrData) => {
        if (!selectedClass) return;
        try {
            setQrLoading(true);
            
            // QR data from Edge Function includes qrImage, qrToken, sessionId, expiresAt
            // Store QR token in the class for reference
            const qrCodeData = qrData.qrToken || qrData.qrImage; // Use token or image as QR value
            
            // Update selected class with QR code data
            setSelectedClass({
                ...selectedClass,
                qrCode: qrCodeData,
                qrCodeExpiry: qrData.expiresAt,
                qrImage: qrData.qrImage, // Store the image
                qrToken: qrData.qrToken, // Store the token
                sessionId: qrData.sessionId, // Store session ID
                room: qrData.location,
            });
        } catch (error) {
            console.error('Error generating QR:', error);
            alert('Failed to generate QR code');
        } finally {
            setQrLoading(false);
        }
    };

    // Listen for real-time attendance updates
    useEffect(() => {
        const socket = getSocket();
        if (socket && selectedClass) {
            socket.on('attendance:marked', (data) => {
                if (data.attendanceRecord?.classId === selectedClass.id) {
                    fetchClassAttendance();
                }
            });

            return () => {
                socket.off('attendance:marked');
            };
        }
    }, [selectedClass]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
                <button
                    onClick={() => alert('Create class feature coming soon')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                    + Create Class
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <li
                                    key={cls.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition flex justify-between items-center ${
                                        selectedClass?.id === cls.id ? 'bg-teal-50' : ''
                                    }`}
                                    onClick={() => setSelectedClass(cls)}
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">{cls.course?.name || 'N/A'}</h4>
                                        <p className="text-sm text-gray-500">{cls.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {format(new Date(cls.startTime), 'MMM dd, yyyy • hh:mm a')}
                                        </p>
                                    </div>
                                    <div className="text-orange-600 text-sm font-medium">View</div>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-center text-gray-500">No classes found</li>
                        )}
                    </ul>
                </div>

                {/* Detail / QR */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {selectedClass ? (
                        <div>
                            <h3 className="text-xl font-bold mb-2">{selectedClass.course?.name || 'N/A'}</h3>
                            <p className="text-gray-500 mb-2">{selectedClass.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                                <span className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {format(new Date(selectedClass.startTime), 'hh:mm a')} -{' '}
                                    {format(new Date(selectedClass.endTime), 'hh:mm a')}
                                </span>
                                {selectedClass.room && (
                                    <span className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        {selectedClass.room}
                                    </span>
                                )}
                            </div>

                            {selectedClass.qrCode ? (
                                <div className="text-center">
                                    <QRGenerator 
                                        value={selectedClass.qrCode} 
                                        qrImage={selectedClass.qrImage}
                                        qrUrl={selectedClass.qrToken ? `${window.location.origin}/scan?token=${selectedClass.qrToken}` : null}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Expires: {selectedClass.qrCodeExpiry ? format(new Date(selectedClass.qrCodeExpiry), 'hh:mm a') : 'N/A'}
                                    </p>
                                    {selectedClass.qrToken && (
                                        <p className="text-xs text-gray-400 mt-1 font-mono">
                                            Token: {selectedClass.qrToken.substring(0, 8)}...
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-500 mb-4">No QR code generated</p>
                                    {selectedClass && typeof selectedClass.id === 'string' && selectedClass.id.length < 30 && (
                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-xs text-yellow-800">
                                                ⚠️ Demo class detected. QR generation requires a real class from the database.
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setShowQRModal(true)}
                                        disabled={qrLoading}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        {qrLoading ? 'Generating...' : 'Generate QR Code'}
                                    </button>
                                </div>
                            )}

                            {attendance && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Users size={20} />
                                            Attendance
                                        </h4>
                                        <span className="text-sm text-gray-600">
                                            {attendance.stats?.present || 0} / {attendance.stats?.total || 0}
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {attendance.attendance?.slice(0, 5).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                            >
                                                <span className="text-sm">{item.student?.fullName || 'N/A'}</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        item.status === 'PRESENT'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {attendance.attendance?.length > 5 && (
                                        <button
                                            onClick={() => alert('View full attendance list')}
                                            className="mt-2 text-sm text-teal-600 hover:text-teal-700"
                                        >
                                            View All ({attendance.attendance.length} students)
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowQRModal(true)}
                                    className="px-4 py-2 border border-orange-200 text-orange-600 rounded hover:bg-orange-50"
                                >
                                    {selectedClass.qrCode ? 'Regenerate QR' : 'Generate QR'}
                                </button>
                                <button
                                    onClick={fetchClassAttendance}
                                    className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                                >
                                    View Attendance
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                            <p>Select a class to view details and QR code</p>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Generation Modal */}
            <QRGenerationModal
                isOpen={showQRModal}
                onClose={() => setShowQRModal(false)}
                onGenerate={handleGenerateQR}
                course={selectedClass?.course}
                classData={selectedClass}
                classId={selectedClass?.id}
            />
        </div>
    );
};

export default LecturerClasses;
