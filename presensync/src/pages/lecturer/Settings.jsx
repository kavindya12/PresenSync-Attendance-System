import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Clock, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LecturerSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        qrCodeExpiry: 30, // Default 30 minutes
        emailNotifications: true,
        smsNotifications: false,
        autoAttendanceReminder: true,
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load settings from localStorage or API
        const savedSettings = localStorage.getItem(`lecturer_settings_${user?.id}`);
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setLoading(true);
            // Save to localStorage (in production, save to API)
            localStorage.setItem(`lecturer_settings_${user?.id}`, JSON.stringify(settings));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h2>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {saved && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                    Settings saved successfully!
                </div>
            )}

            {/* QR Code Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">QR Code Settings</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            QR Code Expiry Time (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={settings.qrCodeExpiry}
                            onChange={(e) => setSettings({ ...settings, qrCodeExpiry: parseInt(e.target.value) || 30 })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Set how long QR codes remain valid (1-120 minutes). Default: 30 minutes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <Bell className="text-orange-600 dark:text-orange-400" size={24} />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h3>
                </div>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">SMS Notifications</span>
                        <input
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Auto Attendance Reminder</span>
                        <input
                            type="checkbox"
                            checked={settings.autoAttendanceReminder}
                            onChange={(e) => setSettings({ ...settings, autoAttendanceReminder: e.target.checked })}
                            className="w-5 h-5 text-orange-600 rounded"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default LecturerSettings;
