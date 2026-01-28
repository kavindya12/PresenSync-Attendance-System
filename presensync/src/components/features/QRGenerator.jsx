
import React from 'react';
import QRCode from 'react-qr-code';

const QRGenerator = ({ value }) => {
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
            <div className="bg-white p-2 border-2 border-orange-500 rounded">
                <QRCode
                    value={value}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <p className="mt-4 text-sm text-gray-500 font-mono text-center break-all max-w-xs">{value}</p>
            <p className="mt-2 text-xs text-orange-600 font-semibold">Scan to mark attendance</p>
        </div>
    );
};

export default QRGenerator;
