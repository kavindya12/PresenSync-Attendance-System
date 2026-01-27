import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, Database } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        autoAttendanceReminder: true,
        qrCodeExpiry: 30,
        attendanceThreshold: 75,
    });

    const handleSave = () => {
        // Save settings logic
        console.log('Saving settings:', settings);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">System Settings</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                    <Save size={20} />
                    <span>Save Changes</span>
                </button>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Bell className="text-purple-600 dark:text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h3>
                </div>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="w-5 h-5 text-purple-600 rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            className="w-5 h-5 text-purple-600 rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Auto Attendance Reminder</span>
                        <input
                            type="checkbox"
                            checked={settings.autoAttendanceReminder}
                            onChange={(e) => setSettings({ ...settings, autoAttendanceReminder: e.target.checked })}
                            className="w-5 h-5 text-purple-600 rounded"
                        />
                    </label>
                </div>
            </div>

            {/* Attendance Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-purple-600 dark:text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Attendance Settings</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            QR Code Expiry Time (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.qrCodeExpiry}
                            onChange={(e) => setSettings({ ...settings, qrCodeExpiry: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attendance Threshold (%)
                        </label>
                        <input
                            type="number"
                            value={settings.attendanceThreshold}
                            onChange={(e) => setSettings({ ...settings, attendanceThreshold: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="text-purple-600 dark:text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">1.0.0</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">December 2024</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
