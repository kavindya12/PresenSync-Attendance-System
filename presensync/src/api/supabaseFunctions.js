// Supabase Edge Functions API Helper
import { supabase } from '../lib/supabaseClient';

/**
 * Generate QR Code for a class session
 * @param {Object} params - QR generation parameters
 * @param {string} params.class_id - Class ID
 * @param {number} params.expiry_minutes - QR expiry time in minutes
 * @param {string} params.location - Location/room
 * @param {string} params.module_name - Module/course name
 * @param {string} params.start_time - Start time (ISO string)
 * @param {string} params.end_time - End time (ISO string)
 * @param {number} params.duration_minutes - Duration in minutes
 * @returns {Promise} QR code data
 */
export const generateQRCode = async (params) => {
  try {
    console.log('Generating QR code with params:', params);
    const { data, error } = await supabase.functions.invoke('generate-qr', {
      body: params,
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from QR generation function');
    }

    console.log('QR code generated successfully:', { 
      hasImage: !!data.qrImage, 
      hasToken: !!data.qrToken,
      sessionId: data.sessionId 
    });

    return { data, error: null };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'Failed to generate QR code',
        details: error
      }
    };
  }
};

/**
 * Validate QR Token
 * @param {string} token - QR token from scanned code
 * @returns {Promise} Validation result with session data
 */
export const validateQRToken = async (token) => {
  try {
    const { data, error } = await supabase.functions.invoke('validate-qr', {
      body: { token },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error validating QR token:', error);
    return { data: null, error };
  }
};

/**
 * Mark Attendance
 * @param {string} session_id - Session ID from validated token
 * @returns {Promise} Attendance marking result
 */
export const markAttendance = async (session_id) => {
  try {
    const { data, error } = await supabase.functions.invoke('mark-attendance', {
      body: { session_id },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking attendance:', error);
    return { data: null, error };
  }
};

/**
 * Check if token is a demo QR code (10010-10020)
 * @param {string} token - QR token to check
 * @returns {boolean} True if valid demo code
 */
const isDemoQRCode = (token) => {
  // Remove any non-numeric characters and check if it's a demo code
  const numericToken = token.replace(/\D/g, '');
  const code = parseInt(numericToken, 10);
  return code >= 10010 && code <= 10020;
};

/**
 * Complete QR scan flow: validate token and mark attendance
 * @param {string} token - QR token from scanned code
 * @returns {Promise} Complete scan result
 */
export const scanQRAndMarkAttendance = async (token) => {
  try {
    // Check if it's a demo QR code (10010-10020)
    if (isDemoQRCode(token)) {
      // Return success for demo codes
      return {
        success: true,
        session: {
          class_id: 'demo-class',
          session_id: 'demo-session',
          module_name: 'Demo Class',
          location: 'Demo Location',
        },
        attendance: {
          id: 'demo-attendance-' + Date.now(),
          status: 'PRESENT',
          marked_at: new Date().toISOString(),
        },
        isDemo: true,
      };
    }

    // Step 1: Validate token (for real QR codes)
    const validation = await validateQRToken(token);
    
    if (validation.error || !validation.data?.valid) {
      return {
        success: false,
        error: 'You entered an invalid code',
      };
    }

    // Step 2: Mark attendance
    const attendance = await markAttendance(validation.data.session_id);
    
    if (attendance.error) {
      return {
        success: false,
        error: attendance.error?.message || 'Failed to mark attendance',
      };
    }

    return {
      success: true,
      session: validation.data,
      attendance: attendance.data,
    };
  } catch (error) {
    console.error('Error in QR scan flow:', error);
    return {
      success: false,
      error: 'You entered an invalid code',
    };
  }
};
