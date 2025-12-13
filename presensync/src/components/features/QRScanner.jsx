
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const QRScanner = ({ onScan }) => {
    const [data, setData] = useState('No result');

    // Wrapper to handle onResult which is the v3 API
    const handleResult = (result, error) => {
        if (!!result) {
            setData(result?.text);
            if (onScan) onScan(result?.text);
        }
        if (!!error) {
            // console.info(error);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center mb-4 text-teal-800">Scan Attendance QR</h3>
                <div className="overflow-hidden rounded-lg border-2 border-teal-500 relative">
                    <QrReader
                        constraints={{ facingMode: 'environment' }}
                        onResult={handleResult}
                        className="w-full"
                        videoContainerStyle={{ paddingTop: '100%' }}
                        videoStyle={{ objectFit: 'cover' }}
                    />
                </div>
                <p className="text-center mt-4 text-gray-600 word-break text-sm">
                    Result: <span className="font-mono">{data}</span>
                </p>
            </div>
        </div>
    );
};

export default QRScanner;
