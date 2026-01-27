import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, BookOpen, Calendar, Zap, Database, Layers, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { generateQRCode } from '../../api/supabaseFunctions';
import { getCachedQR, cacheQR, quickGenerateQR, batchGenerateQR } from '../../utils/qrUtils';
import QRCode from 'react-qr-code';

const QRGenerationModal = ({ isOpen, onClose, onGenerate, course, classData, classId, batchClasses = [] }) => {
    const { user } = useAuth();
    const [generationMode, setGenerationMode] = useState('server'); // 'server', 'quick', 'batch'
    const [formData, setFormData] = useState({
        location: '',
        moduleName: '',
        startTime: '',
        endTime: '',
        duration: 90, // minutes
        expiryMinutes: 30,
    });
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
    const [batchResults, setBatchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lecturerRooms, setLecturerRooms] = useState([
        'IT Building Room 201',
        'IT Building Room 305',
        'IT Building Lab 203',
        'IT Building Lab 402',
        'IT Building Room 208',
        'IT Building Lab 105',
        'IT Building Room 415',
        'IT Building Room 320',
    ]);

    useEffect(() => {
        // Load lecturer settings for QR expiry
        const savedSettings = localStorage.getItem(`lecturer_settings_${user?.id}`);
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                setFormData(prev => ({ ...prev, expiryMinutes: settings.qrCodeExpiry || 30 }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }

        // Pre-fill form if class data exists
        if (classData) {
            setFormData({
                location: classData.room || '',
                moduleName: classData.course?.name || course?.name || '',
                startTime: classData.startTime ? format(new Date(classData.startTime), "yyyy-MM-dd'T'HH:mm") : '',
                endTime: classData.endTime ? format(new Date(classData.endTime), "yyyy-MM-dd'T'HH:mm") : '',
                duration: classData.startTime && classData.endTime
                    ? Math.round((new Date(classData.endTime) - new Date(classData.startTime)) / (1000 * 60))
                    : 90,
                expiryMinutes: 30,
            });
        } else if (course) {
            setFormData(prev => ({
                ...prev,
                moduleName: course.name || '',
            }));
        }
    }, [classData, course, user]);

    const handleDurationChange = (duration) => {
        setFormData(prev => {
            const newDuration = parseInt(duration) || 90;
            let newEndTime = '';
            if (prev.startTime) {
                const start = new Date(prev.startTime);
                const end = new Date(start.getTime() + newDuration * 60 * 1000);
                newEndTime = format(end, "yyyy-MM-dd'T'HH:mm");
            }
            return { ...prev, duration: newDuration, endTime: newEndTime };
        });
    };

    const handleStartTimeChange = (startTime) => {
        setFormData(prev => {
            let newEndTime = '';
            if (startTime && prev.duration) {
                const start = new Date(startTime);
                const end = new Date(start.getTime() + prev.duration * 60 * 1000);
                newEndTime = format(end, "yyyy-MM-dd'T'HH:mm");
            }
            return { ...prev, startTime, endTime: newEndTime };
        });
    };

    // Check cache on form data change
    useEffect(() => {
        if (generationMode === 'server' && formData.location && formData.startTime) {
            const actualClassId = classId || classData?.id;
            if (actualClassId) {
                const qrParams = {
                    class_id: actualClassId,
                    start_time: new Date(formData.startTime).toISOString(),
                    location: formData.location,
                };
                const cached = getCachedQR(qrParams);
                if (cached) {
                    console.log('Found cached QR code');
                }
            }
        }
    }, [formData, classId, classData, generationMode]);

    const handleQuickGenerate = () => {
        if (!formData.location || !formData.moduleName || !formData.startTime || !formData.endTime) {
            setError('Please fill in all required fields');
            return;
        }

        const actualClassId = classId || classData?.id || 'quick-test-' + Date.now();
        
        const qrParams = {
            class_id: actualClassId,
            expiry_minutes: formData.expiryMinutes,
            location: formData.location,
            module_name: formData.moduleName,
            start_time: new Date(formData.startTime).toISOString(),
            end_time: new Date(formData.endTime).toISOString(),
            duration_minutes: formData.duration,
        };

        // Quick generate (client-side)
        const qrData = quickGenerateQR(qrParams);
        
        // Generate QR code URL for display
        const qrUrl = qrData.qrUrl;
        
        // Pass to parent (will use client-side QR generator)
        onGenerate({
            ...qrParams,
            qrUrl,
            qrToken: qrData.qrToken,
            sessionId: qrData.sessionId,
            expiresAt: qrData.expiresAt,
            isQuickGenerate: true,
        });
        onClose();
    };

    const handleBatchGenerate = async () => {
        if (batchClasses.length === 0) {
            setError('No classes selected for batch generation');
            return;
        }

        setLoading(true);
        setError('');
        setBatchProgress({ current: 0, total: batchClasses.length });
        setBatchResults([]);

        try {
            const results = await batchGenerateQR(
                batchClasses.map(cls => ({
                    class_id: cls.id,
                    expiry_minutes: formData.expiryMinutes,
                    location: cls.room || formData.location,
                    module_name: cls.course?.name || formData.moduleName,
                    start_time: cls.startTime ? new Date(cls.startTime).toISOString() : new Date(formData.startTime).toISOString(),
                    end_time: cls.endTime ? new Date(cls.endTime).toISOString() : new Date(formData.endTime).toISOString(),
                    duration_minutes: cls.duration || formData.duration,
                })),
                async (params) => {
                    // Check cache first
                    const cached = getCachedQR(params);
                    if (cached) {
                        return { data: cached };
                    }
                    return await generateQRCode(params);
                },
                (current, total, classData) => {
                    setBatchProgress({ current, total });
                }
            );

            setBatchResults(results);
            
            // Generate QR codes for all successful results
            results.forEach(result => {
                if (result.qrData && !result.error) {
                    onGenerate({
                        ...result,
                        qrImage: result.qrData.qrImage,
                        qrToken: result.qrData.qrToken,
                        sessionId: result.qrData.sessionId,
                        expiresAt: result.qrData.expiresAt,
                    });
                }
            });
        } catch (error) {
            console.error('Error in batch generation:', error);
            setError(`Batch generation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (generationMode === 'quick') {
            handleQuickGenerate();
            return;
        }

        if (generationMode === 'batch') {
            handleBatchGenerate();
            return;
        }
        
        if (!formData.location || !formData.moduleName || !formData.startTime || !formData.endTime) {
            setError('Please fill in all required fields');
            return;
        }

        // Get the correct class_id - prioritize classId prop, then classData.id, never use course.id
        const actualClassId = classId || classData?.id;
        
        // Check if we have a valid class_id (should be UUID format, not demo string)
        if (!actualClassId || (typeof actualClassId === 'string' && actualClassId.length < 30)) {
            if (generationMode !== 'quick') {
                setError('Invalid class ID. Please ensure you have selected a valid class from the database. Demo classes cannot generate QR codes. Use Quick Generate for testing.');
                return;
            }
        }

        // Check cache first
        const qrParams = {
            class_id: actualClassId,
            expiry_minutes: formData.expiryMinutes,
            location: formData.location,
            module_name: formData.moduleName,
            start_time: new Date(formData.startTime).toISOString(),
            end_time: new Date(formData.endTime).toISOString(),
            duration_minutes: formData.duration,
        };

        const cached = getCachedQR(qrParams);
        if (cached) {
            console.log('Using cached QR code');
            onGenerate({
                ...qrParams,
                qrImage: cached.qrImage,
                qrToken: cached.qrToken,
                sessionId: cached.sessionId,
                expiresAt: cached.expiresAt,
                cached: true,
            });
            onClose();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await generateQRCode(qrParams);
            
            if (result.error) {
                const errorMsg = result.error.message || result.error || 'Unknown error';
                console.error('QR Generation Error:', result.error);
                setError(`Failed to generate QR code: ${errorMsg}\n\nMake sure:\n1. The class exists in the database\n2. You are the lecturer for this class\n3. The class has a valid course_id\n\nOr use Quick Generate for testing.`);
                return;
            }

            if (!result.data) {
                setError('Failed to generate QR code: No data returned from server');
                return;
            }

            // Cache the result
            cacheQR(qrParams, result.data);

            // Pass the QR data to parent component
            onGenerate({
                ...qrParams,
                qrImage: result.data.qrImage,
                qrToken: result.data.qrToken,
                sessionId: result.data.sessionId,
                expiresAt: result.data.expiresAt,
            });
            onClose();
        } catch (error) {
            console.error('Error generating QR:', error);
            setError(`Failed to generate QR code: ${error.message || 'Please try again.'}\n\nIf using demo data, please create a real class in the database first, or use Quick Generate for testing.`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Generate QR Code</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Generation Mode Selector */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Generation Mode
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setGenerationMode('server')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                                    generationMode === 'server'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Database size={16} />
                                <span className="text-sm">Server</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGenerationMode('quick')}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                                    generationMode === 'quick'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                            >
                                <Zap size={16} />
                                <span className="text-sm">Quick</span>
                            </button>
                            {batchClasses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setGenerationMode('batch')}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                                        generationMode === 'batch'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <Layers size={16} />
                                    <span className="text-sm">Batch ({batchClasses.length})</span>
                                </button>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {generationMode === 'server' && (
                                <span className="flex items-center gap-1">
                                    <Database size={12} />
                                    Secure server-side generation with validation and caching
                                </span>
                            )}
                            {generationMode === 'quick' && (
                                <span className="flex items-center gap-1 text-orange-600">
                                    <Zap size={12} />
                                    Instant client-side generation for testing (no server validation)
                                </span>
                            )}
                            {generationMode === 'batch' && (
                                <span className="flex items-center gap-1 text-purple-600">
                                    <Layers size={12} />
                                    Generate QR codes for multiple classes at once
                                </span>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">{error}</p>
                        </div>
                    )}

                    {/* Batch Progress */}
                    {generationMode === 'batch' && batchProgress.total > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Generating QR Codes...
                                </span>
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    {batchProgress.current} / {batchProgress.total}
                                </span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Batch Results Summary */}
                    {generationMode === 'batch' && batchResults.length > 0 && !loading && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                                Batch Generation Complete
                            </p>
                            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                                <p>✓ Successful: {batchResults.filter(r => r.qrData && !r.error).length}</p>
                                <p>📦 Cached: {batchResults.filter(r => r.cached).length}</p>
                                {batchResults.filter(r => r.error).length > 0 && (
                                    <p className="text-red-600">✗ Failed: {batchResults.filter(r => r.error).length}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Module Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <BookOpen size={16} />
                            Module Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.moduleName}
                            onChange={(e) => setFormData({ ...formData, moduleName: e.target.value })}
                            placeholder="e.g., Introduction to Computer Science"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Location Selection */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MapPin size={16} />
                            Location (Room) *
                        </label>
                        <select
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">Select a room</option>
                            {lecturerRooms.map((room, idx) => (
                                <option key={idx} value={room}>{room}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Or enter custom location"
                            className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Available Time Period */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar size={16} />
                                Start Time *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.startTime}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar size={16} />
                                End Time *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.endTime}
                                onChange={(e) => {
                                    const endTime = e.target.value;
                                    setFormData(prev => {
                                        let duration = prev.duration;
                                        if (prev.startTime && endTime) {
                                            const start = new Date(prev.startTime);
                                            const end = new Date(endTime);
                                            duration = Math.round((end - start) / (1000 * 60));
                                        }
                                        return { ...prev, endTime, duration };
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Lecture Duration */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Clock size={16} />
                            Lecture Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="15"
                            max="300"
                            step="15"
                            value={formData.duration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Duration: {formData.duration} minutes ({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)
                        </p>
                    </div>

                    {/* QR Code Expiry */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Clock size={16} />
                            QR Code Expiry Time (minutes)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={formData.expiryMinutes}
                            onChange={(e) => setFormData({ ...formData, expiryMinutes: parseInt(e.target.value) || 30 })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            QR code will expire {formData.expiryMinutes} minutes after generation. 
                            Change default in <a href="/lecturer/settings" className="text-orange-600 hover:underline">Settings</a>.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (generationMode === 'batch' && batchClasses.length === 0)}
                            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                generationMode === 'quick'
                                    ? 'bg-orange-600 hover:bg-orange-700'
                                    : generationMode === 'batch'
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                        >
                            {loading
                                ? generationMode === 'batch'
                                    ? `Generating... (${batchProgress.current}/${batchProgress.total})`
                                    : 'Generating...'
                                : generationMode === 'quick'
                                ? 'Quick Generate'
                                : generationMode === 'batch'
                                ? `Generate ${batchClasses.length} QR Codes`
                                : 'Generate QR Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QRGenerationModal;
