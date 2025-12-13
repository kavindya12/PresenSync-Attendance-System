
import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex flex-col items-center justify-center">
            <div className="text-center p-8">
                <h1 className="text-5xl font-bold mb-6 text-teal-800">
                    Presen<span className="text-orange-600">Sync</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Seamless attendance tracking with QR codes. real-time updates for students, lecturers, and administrators.
                </p>
                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-lg font-semibold"
                    >
                        Get Started
                    </Link>
                    <a
                        href="#features"
                        className="px-6 py-3 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold border border-teal-100"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Landing;
