
import React, { useState } from 'react';
import QRScanner from '../../components/features/QRScanner';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const StudentScan = () => {
    const { user } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleScan = async (code) => {
        if (status === 'loading' || status === 'success') return; // Debounce
        if (!code) return;

        setScanResult(code);
        setStatus('loading');
        setMessage('Processing attendance...');

        try {
            // Expected code format: "cls_<uuid>" or json
            // For now assume just class_id in code
            // Ensure code is valid
            if (!code) throw new Error("Invalid code");

            // Call backend or insert directly
            // Insert into attendance_records
            // class_id would be extracted from code
            const classId = code; // Simplify for now

            const { error } = await supabase
                .from('attendance_records')
                .insert({
                    class_id: classId,
                    student_id: user.id,
                    status: 'present',
                    method: 'qr'
                });

            if (error) {
                if (error.code === '23505') throw new Error("Already marked present for this class!");
                throw error;
            }

            setStatus('success');
            setMessage('Attendance marked successfully!');
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Failed to mark attendance');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Scan Class QR Code</h2>

            {!status || status === 'error' ? (
                <QRScanner onScan={handleScan} />
            ) : (
                <div className={`p-6 rounded-lg text-center ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    <p className="text-xl font-bold">{message}</p>
                    {status === 'success' && (
                        <button
                            onClick={() => { setStatus(null); setScanResult(null); }}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Scan Another
                        </button>
                    )}
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded text-center">
                    {message}
                    <button
                        onClick={() => setStatus(null)}
                        className="ml-4 underline hover:text-red-900"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentScan;
