import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../api/endpoints';

const BeaconDetector = ({ beaconId, onSuccess, onError }) => {
    const [supported, setSupported] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [proximity, setProximity] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        // Check if Web Bluetooth is supported
        if (navigator.bluetooth) {
            setSupported(true);
        }

        // Get user location for proximity check
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                () => {
                    console.warn('Location access denied');
                }
            );
        }
    }, []);

    useEffect(() => {
        if (!supported || !beaconId || !scanning) return;

        const scanForBeacon = async () => {
            try {
                // Request Bluetooth device
                const device = await navigator.bluetooth.requestDevice({
                    filters: [{ services: ['0000feaa-0000-1000-8000-00805f9b34fb'] }], // Eddystone UUID
                });

                const server = await device.gatt.connect();
                const service = await server.getPrimaryService('0000feaa-0000-1000-8000-00805f9b34fb');
                const characteristic = await service.getCharacteristic('0000feab-0000-1000-8000-00805f9b34fb');

                // Monitor beacon proximity
                characteristic.addEventListener('characteristicvaluechanged', async (event) => {
                    const value = event.target.value;
                    // Calculate proximity based on RSSI
                    const rssi = value.getInt8(0);
                    const distance = Math.pow(10, (-69 - rssi) / (10 * 2)); // Approximate distance in meters

                    setProximity(distance);

                    // Auto-mark attendance when within 5 meters
                    if (distance < 5 && !scanning) {
                        try {
                            const response = await attendanceAPI.markAttendance({
                                method: 'BEACON',
                                data: beaconId,
                                latitude: location?.latitude,
                                longitude: location?.longitude,
                            });

                            if (onSuccess) {
                                onSuccess(response.data.attendanceRecord);
                            }

                            setScanning(false);
                        } catch (err) {
                            if (onError) {
                                onError(err.response?.data?.error || 'Failed to mark attendance');
                            }
                        }
                    }
                });

                await characteristic.startNotifications();
            } catch (err) {
                if (onError) {
                    onError('Bluetooth scanning failed or device not found');
                }
                setScanning(false);
            }
        };

        scanForBeacon();
    }, [beaconId, scanning, supported, location, onSuccess, onError]);

    if (!supported) {
        return (
            <div className="w-full max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                    Bluetooth is not supported on this device. Please use QR code scanning instead.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <h3 className="text-lg font-semibold mb-4 text-teal-800">Beacon Attendance</h3>
                {proximity && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Distance: {proximity.toFixed(1)}m
                            {proximity < 5 && <span className="text-green-600 ml-2">✓ In range</span>}
                        </p>
                    </div>
                )}
                <button
                    onClick={() => setScanning(true)}
                    disabled={scanning}
                    className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                    {scanning ? 'Scanning for beacon...' : 'Start Beacon Scan'}
                </button>
            </div>
        </div>
    );
};

export default BeaconDetector;

