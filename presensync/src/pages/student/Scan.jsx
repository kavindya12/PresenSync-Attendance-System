import React, { useState } from 'react';
import QRScanner from '../../components/features/QRScanner';
import NFCReader from '../../components/features/NFCReader';
import BeaconDetector from '../../components/features/BeaconDetector';
import FacialRecognition from '../../components/features/FacialRecognition';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StudentScan = () => {
    const { user } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [method, setMethod] = useState('QR');

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
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h2>

            {/* Method Selector */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Method</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['QR', 'NFC', 'BEACON', 'FACIAL'].map((m) => (
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
                    {method === 'QR' && <QRScanner onSuccess={handleSuccess} onError={handleError} />}
                    {method === 'NFC' && <NFCReader onSuccess={handleSuccess} onError={handleError} />}
                    {method === 'BEACON' && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="inline text-yellow-600 mr-2" size={20} />
                            <span className="text-yellow-800 text-sm">
                                Beacon ID will be provided by your lecturer. Enter it below:
                            </span>
                            <input
                                type="text"
                                placeholder="Enter Beacon ID"
                                className="mt-2 w-full px-3 py-2 border border-yellow-300 rounded"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        <BeaconDetector beaconId={e.target.value} onSuccess={handleSuccess} onError={handleError} />;
                                    }
                                }}
                            />
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
