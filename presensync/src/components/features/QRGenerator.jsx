
import React from 'react';
import QRCode from 'react-qr-code';
import { AlertCircle } from 'lucide-react';

const QRGenerator = ({ value, qrImage, qrUrl, isQuickGenerate, cached }) => {
    // If qrImage is provided (from Edge Function), display it
    // Otherwise, generate QR code from value or qrUrl
    const displayValue = qrUrl || value;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
            {/* Quick Generate Warning */}
            {isQuickGenerate && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3 w-full">
                    <div className="flex items-center gap-2 text-orange-800 text-sm">
                        <AlertCircle size={16} />
                        <span className="font-semibold">Quick Generate Mode</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                        This QR code was generated client-side for testing. It will not work for actual attendance marking without server validation.
                    </p>
                </div>
            )}

            {/* Cached Indicator */}
            {cached && (
                <div className="mb-2 text-xs text-teal-600 font-medium">
                    ✓ Loaded from cache
                </div>
            )}

            {qrImage ? (
                // Display QR image from Edge Function
                <div className="bg-white p-2 border-2 border-orange-500 rounded">
                    <img src={qrImage} alt="QR Code" className="w-64 h-64" />
                </div>
            ) : (
                // Generate QR code client-side
                <div className="bg-white p-2 border-2 border-orange-500 rounded">
                    <QRCode
                        value={displayValue}
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            )}
            <p className="mt-4 text-sm text-gray-500 font-mono text-center break-all max-w-xs">
                {displayValue}
            </p>
            <p className="mt-2 text-xs text-orange-600 font-semibold">Scan to mark attendance</p>
        </div>
    );
};

export default QRGenerator;
