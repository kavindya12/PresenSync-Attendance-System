
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { signOut } = useAuth();
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">Sign Out</button>
            <div className="mt-4">Admin features coming soon...</div>
        </div>
    );
};
export default AdminDashboard;
