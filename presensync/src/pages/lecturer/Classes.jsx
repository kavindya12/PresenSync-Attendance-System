
import React, { useState } from 'react';
import QRGenerator from '../../components/features/QRGenerator';

const LecturerClasses = () => {
    // Mock data
    const [selectedClass, setSelectedClass] = useState(null);

    // In real app, fetch classes from Supabase
    const classes = [
        { id: 'c1', title: 'Intro to Programming Lecture 1', date: '2023-11-01', time: '10:00 AM' },
        { id: 'c2', title: 'Advanced Algorithms', date: '2023-11-01', time: '02:00 PM' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    + Create Class
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {classes.map(cls => (
                            <li
                                key={cls.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition flex justify-between items-center"
                                onClick={() => setSelectedClass(cls)}
                            >
                                <div>
                                    <h4 className="font-medium text-gray-900">{cls.title}</h4>
                                    <p className="text-sm text-gray-500">{cls.date} • {cls.time}</p>
                                </div>
                                <div className="text-orange-600 text-sm font-medium">View</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Detail / QR */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {selectedClass ? (
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">{selectedClass.title}</h3>
                            <p className="text-gray-500 mb-6">{selectedClass.date} • {selectedClass.time}</p>

                            <div className="max-w-xs mx-auto">
                                <QRGenerator value={selectedClass.id} />
                            </div>

                            <div className="mt-8 flex justify-center space-x-4">
                                <button className="px-4 py-2 border border-orange-200 text-orange-600 rounded hover:bg-orange-50">
                                    Project on Screen
                                </button>
                                <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
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
