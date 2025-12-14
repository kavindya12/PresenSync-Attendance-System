import React, { useState, useEffect } from 'react';
import QRGenerator from '../../components/features/QRGenerator';
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
            const response = await classAPI.getAllClasses();
            setClasses(response.data.classes || []);
            if (response.data.classes?.length > 0) {
                setSelectedClass(response.data.classes[0]);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
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

    const handleGenerateQR = async () => {
        if (!selectedClass) return;
        try {
            setQrLoading(true);
            const response = await classAPI.generateQR(selectedClass.id);
            setSelectedClass({ ...selectedClass, qrCode: response.data.qrCode, qrCodeExpiry: response.data.qrCodeExpiry });
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
                                    <QRGenerator value={selectedClass.qrCode} />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Expires: {selectedClass.qrCodeExpiry ? format(new Date(selectedClass.qrCodeExpiry), 'hh:mm a') : 'N/A'}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <QrCode className="mx-auto text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-500 mb-4">No QR code generated</p>
                                    <button
                                        onClick={handleGenerateQR}
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
                                    onClick={handleGenerateQR}
                                    className="px-4 py-2 border border-orange-200 text-orange-600 rounded hover:bg-orange-50"
                                >
                                    Refresh QR
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
        </div>
    );
};

export default LecturerClasses;
