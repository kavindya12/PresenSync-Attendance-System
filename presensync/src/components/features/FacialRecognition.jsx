import React, { useState, useRef, useEffect } from 'react';
import { attendanceAPI } from '../../api/endpoints';

const FacialRecognition = ({ classId, onSuccess, onError }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        return () => {
            // Cleanup stream on unmount
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            if (onError) {
                onError('Camera access denied or not available');
            }
        }
    };

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || !classId) {
            if (onError) {
                onError('Camera or class ID not available');
            }
            return;
        }

        setCapturing(true);
        setLoading(true);

        try {
            // Capture frame
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Send to backend for facial recognition
            const response = await attendanceAPI.markAttendance({
                method: 'FACIAL',
                data: {
                    classId,
                    image: imageData,
                },
            });

            if (onSuccess) {
                onSuccess(response.data.attendanceRecord);
            }

            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }

            setCapturing(false);
            setLoading(false);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Facial recognition failed';
            if (onError) {
                onError(errorMessage);
            }
            setCapturing(false);
            setLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCapturing(false);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-center mb-4 text-teal-800">
                    Facial Recognition Attendance
                </h3>

                {!stream ? (
                    <button
                        onClick={startCamera}
                        className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        Start Camera
                    </button>
                ) : (
                    <>
                        <div className="relative mb-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-lg"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {loading && (
                            <div className="text-center mb-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                                <p className="text-sm text-gray-600 mt-2">Verifying face...</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={captureAndVerify}
                                disabled={capturing || loading}
                                className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Capture & Verify'}
                            </button>
                            <button
                                onClick={stopCamera}
                                className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Stop Camera
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FacialRecognition;

