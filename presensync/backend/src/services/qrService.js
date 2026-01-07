import QRCode from 'qrcode';
import { supabase } from '../config/database.js';

export const generateQRCode = async (classId) => {
  // Generate unique QR data
  const qrData = JSON.stringify({
    classId,
    timestamp: Date.now(),
    type: 'attendance',
  });

  // Generate QR code image
  const qrCodeImage = await QRCode.toDataURL(qrData);

  // Set expiry (30 minutes from now)
  const qrCodeExpiry = new Date(Date.now() + 30 * 60 * 1000);

  return {
    qrCode: qrData,
    qrCodeImage,
    qrCodeExpiry,
  };
};

export const validateQRCode = async (qrCode) => {
  try {
    const data = JSON.parse(qrCode);

    if (data.type !== 'attendance' || !data.classId) {
      throw new Error('Invalid QR code');
    }

    // Check if class exists and QR is valid
    const { data: classSession, error: classError } = await supabase
      .from('class')
      .select('*, course(*)')
      .eq('id', data.classId)
      .single();

    if (classError) {
      throw new Error(classError.message);
    }

    return { classId: data.classId, class: classSession };
  } catch (error) {
    throw new Error('Invalid QR code');
  }
};

