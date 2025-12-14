import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../api/endpoints';

const NFCReader = ({ onSuccess, onError }) => {
    const [supported, setSupported] = useState(false);
    const [reading, setReading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if Web NFC is supported
        if ('NDEFReader' in window) {
            setSupported(true);
        }
    }, []);

    const handleNFCScan = async () => {
        if (!supported) {
            if (onError) {
                onError('NFC is not supported on this device');
            }
            return;
        }

        try {
            setReading(true);
            setLoading(true);

            const reader = new NDEFReader();
            await reader.scan();

            reader.addEventListener('reading', async ({ message, serialNumber }) => {
                try {
                    const nfcTagId = serialNumber || message.records[0]?.data;

                    const response = await attendanceAPI.markAttendance({
                        method: 'NFC',
                        data: nfcTagId,
                    });

                    if (onSuccess) {
                        onSuccess(response.data.attendanceRecord);
                    }

                    setReading(false);
                    setLoading(false);
                } catch (err) {
                    const errorMessage = err.response?.data?.error || 'Failed to mark attendance';
                    if (onError) {
                        onError(errorMessage);
                    }
                    setReading(false);
                    setLoading(false);
                }
            });

            reader.addEventListener('readingerror', () => {
                if (onError) {
                    onError('NFC reading error');
                }
                setReading(false);
                setLoading(false);
            });
        } catch (err) {
            if (onError) {
                onError('Failed to start NFC reader');
            }
            setReading(false);
            setLoading(false);
        }
    };

    if (!supported) {
        return (
            <div className="w-full max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                    NFC is not supported on this device. Please use QR code scanning instead.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4 text-teal-800">NFC Attendance</h3>
                {loading && (
                    <div className="mb-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                        <p className="text-sm text-gray-600 mt-2">Reading NFC tag...</p>
                    </div>
                )}
                <button
                    onClick={handleNFCScan}
                    disabled={reading || loading}
                    className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {reading ? 'Tap NFC Tag...' : 'Start NFC Scan'}
                </button>
            </div>
        </div>
    );
};

export default NFCReader;

