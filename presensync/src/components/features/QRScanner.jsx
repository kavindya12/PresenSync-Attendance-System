import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { scanQRAndMarkAttendance } from '../../api/supabaseFunctions';
import { getSocket } from '../../utils/socket';

const QRScanner = ({ onSuccess, onError }) => {
    const [data, setData] = useState('');
    const [scanning, setScanning] = useState(true);
    const [loading, setLoading] = useState(false);

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

    const handleResult = async (result, error) => {
        if (!!result && result.text && scanning && !loading) {
            setScanning(false);
            setLoading(true);
            setData(result.text);

            try {
                // Extract token from QR code
                const token = extractTokenFromQR(result.text);
                
                // Validate token and mark attendance using Supabase Edge Functions
                const scanResult = await scanQRAndMarkAttendance(token);

                if (scanResult.success) {
                    if (onSuccess) {
                        onSuccess({
                            ...scanResult.attendance,
                            session: scanResult.session,
                            status: 'PRESENT',
                        });
                    }

                    // Emit socket event
                    const socket = getSocket();
                    if (socket && scanResult.session) {
                        socket.emit('attendance:marked', {
                            classId: scanResult.session.class_id,
                            sessionId: scanResult.session.session_id,
                        });
                    }

                    // Reset after 2 seconds
                    setTimeout(() => {
                        setScanning(true);
                        setData('');
                        setLoading(false);
                    }, 2000);
                } else {
                    throw new Error(scanResult.error || 'Failed to mark attendance');
                }
            } catch (err) {
                const errorMessage = err.message || err.response?.data?.error || 'Failed to mark attendance';
                if (onError) {
                    onError(errorMessage);
                }
                setScanning(true);
                setLoading(false);
            }
        }
        if (!!error) {
            // Silently handle camera errors
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center mb-4 text-teal-800">
                    Scan Attendance QR
                </h3>
                {loading && (
                    <div className="text-center mb-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                        <p className="text-sm text-gray-600 mt-2">Processing...</p>
                    </div>
                )}
                <div className="overflow-hidden rounded-lg border-2 border-teal-500 relative">
                    {scanning && (
                        <QrReader
                            constraints={{ facingMode: 'environment' }}
                            onResult={handleResult}
                            className="w-full"
                            videoContainerStyle={{ paddingTop: '100%' }}
                            videoStyle={{ objectFit: 'cover' }}
                        />
                    )}
                </div>
                {data && (
                    <p className="text-center mt-4 text-gray-600 word-break text-sm">
                        Scanned: <span className="font-mono text-xs">{data.substring(0, 50)}...</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
