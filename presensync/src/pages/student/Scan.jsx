import React, { useState } from 'react';
import QRScanner from '../../components/features/QRScanner';
import FacialRecognition from '../../components/features/FacialRecognition';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { scanQRAndMarkAttendance } from '../../api/supabaseFunctions';
import { getSocket } from '../../utils/socket';

const StudentScan = () => {
    const { user } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [method, setMethod] = useState('QR');
    const [qrMode, setQrMode] = useState('scan'); // 'scan' or 'manual'
    const [manualQrCode, setManualQrCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSuccess = (attendanceRecord) => {
        setScanResult(attendanceRecord);
        setStatus('success');
        setMessage(`Attendance marked successfully! Status: ${attendanceRecord.status}`);
    };

    const handleError = (errorMessage) => {
        setStatus('error');
        setMessage(errorMessage);
    };

    const resetStatus = () => {
        setStatus(null);
        setScanResult(null);
        setMessage('');
        setManualQrCode('');
    };

    const extractTokenFromQR = (qrText) => {
        // QR code can be:
        // 1. URL with token: https://yourapp.com/scan?token=xxx
        // 2. Direct token: xxx-xxx-xxx
        try {
            const url = new URL(qrText);
            return url.searchParams.get('token') || qrText;
        } catch {
            // Not a URL, assume it's a direct token
            return qrText;
        }
    };

    const handleManualQRSubmit = async (e) => {
        e.preventDefault();
        if (!manualQrCode.trim()) {
            handleError('Please enter a QR code');
            return;
        }

        setLoading(true);
        try {
            // Extract token from QR code
            const token = extractTokenFromQR(manualQrCode.trim());
            
            // Validate token and mark attendance using Supabase Edge Functions
            const scanResult = await scanQRAndMarkAttendance(token);

            if (scanResult.success) {
                const attendanceRecord = {
                    ...scanResult.attendance,
                    session: scanResult.session,
                    status: 'PRESENT',
                };
                
                setScanResult(attendanceRecord);
                setStatus('success');
                setMessage(`Attendance marked successfully! Status: ${attendanceRecord.status}`);

                // Emit socket event
                const socket = getSocket();
                if (socket && scanResult.session) {
                    socket.emit('attendance:marked', {
                        classId: scanResult.session.class_id,
                        sessionId: scanResult.session.session_id,
                    });
                }

                setManualQrCode('');
            } else {
                throw new Error(scanResult.error || 'Failed to mark attendance');
            }
        } catch (err) {
            const errorMessage = err.message || err.response?.data?.error || 'Failed to mark attendance';
            handleError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h2>

            {/* Method Selector */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Method</label>
                <div className="grid grid-cols-2 gap-2">
                    {['QR', 'FACIAL'].map((m) => (
                        <button
                            key={m}
                            onClick={() => {
                                setMethod(m);
                                resetStatus();
                            }}
                            className={`px-4 py-2 rounded-lg transition ${
                                method === m
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">{message}</p>
                        {scanResult && (
                            <p className="text-sm text-green-600 mt-1">
                                Class: {scanResult.class?.course?.name || 'N/A'} - {scanResult.class?.title || 'N/A'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={resetStatus}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Scan Another
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                    <XCircle className="text-red-600" size={24} />
                    <div className="flex-1">
                        <p className="font-semibold text-red-800">{message}</p>
                    </div>
                    <button
                        onClick={resetStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Scanner Components */}
            {!status || status === 'error' ? (
                <div>
                    {method === 'QR' && (
                        <div className="space-y-4">
                            {/* QR Mode Toggle */}
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-3">QR Code Method</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setQrMode('scan');
                                            resetStatus();
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                                            qrMode === 'scan'
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Scan QR Code
                                    </button>
                                    <button
                                        onClick={() => {
                                            setQrMode('manual');
                                            resetStatus();
                                        }}
                                        className={`flex-1 px-4 py-2 rounded-lg transition ${
                                            qrMode === 'manual'
                                                ? 'bg-teal-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Enter QR Code
                                    </button>
                                </div>
                            </div>

                            {/* QR Scanner Mode */}
                            {qrMode === 'scan' && (
                                <QRScanner onSuccess={handleSuccess} onError={handleError} />
                            )}

                            {/* Manual QR Code Entry Mode */}
                            {qrMode === 'manual' && (
                                <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h3 className="text-lg font-semibold text-center mb-4 text-teal-800">
                                        Enter QR Code
                                    </h3>
                                    <AlertCircle className="inline text-teal-600 mr-2 mb-2" size={20} />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Enter the QR code digits or URL provided by your lecturer below:
                                    </p>
                                    <p className="text-xs text-teal-600 dark:text-teal-400 mb-4 font-medium">
                                        Demo codes: 10010-10020 (for testing)
                                    </p>
                                    <form onSubmit={handleManualQRSubmit}>
                                        <input
                                            type="text"
                                            placeholder="Enter QR code here or paste QR code URL"
                                            value={manualQrCode}
                                            onChange={(e) => setManualQrCode(e.target.value)}
                                            className="w-full px-4 py-3 border border-teal-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            disabled={loading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !manualQrCode.trim()}
                                            className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </span>
                                            ) : (
                                                'Mark Attendance'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                    {method === 'FACIAL' && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <AlertCircle className="inline text-blue-600 mr-2" size={20} />
                            <span className="text-blue-800 text-sm mb-2 block">
                                Class ID is required for facial recognition. Please get it from your lecturer.
                            </span>
                            <input
                                type="text"
                                placeholder="Enter Class ID"
                                className="w-full px-3 py-2 border border-blue-300 rounded mb-4"
                                id="facial-class-id"
                            />
                            <FacialRecognition
                                classId={document.getElementById('facial-class-id')?.value}
                                onSuccess={handleSuccess}
                                onError={handleError}
                            />
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default StudentScan;
