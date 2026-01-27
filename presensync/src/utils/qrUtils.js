// QR Code Utilities: Caching and Quick Generation
import QRCode from 'react-qr-code';

const CACHE_PREFIX = 'qr_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate cache key from QR parameters
 */
const getCacheKey = (params) => {
  const key = `${params.class_id}_${params.start_time}_${params.location}`;
  return `${CACHE_PREFIX}${key}`;
};

/**
 * Get cached QR code if available and not expired
 */
export const getCachedQR = (params) => {
  try {
    const cacheKey = getCacheKey(params);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading QR cache:', error);
    return null;
  }
};

/**
 * Cache QR code data
 */
export const cacheQR = (params, qrData) => {
  try {
    const cacheKey = getCacheKey(params);
    const cacheData = {
      data: qrData,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching QR:', error);
    // If storage is full, clear old cache entries
    clearOldCache();
  }
};

/**
 * Clear expired cache entries
 */
const clearOldCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (now - cached.timestamp > CACHE_EXPIRY) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Quick Generate QR Code (client-side, for testing)
 * Generates QR code immediately without server call
 */
export const quickGenerateQR = (params) => {
  const appUrl = window.location.origin;
  const qrToken = crypto.randomUUID();
  const qrUrl = `${appUrl}/scan?token=${qrToken}`;
  
  // Generate QR code as data URL using canvas (client-side)
  // Note: This is a simplified version - for production, use server-side generation
  const qrData = {
    qrToken,
    qrUrl,
    sessionId: null, // Will be null for quick generate
    expiresAt: new Date(Date.now() + (params.expiry_minutes || 30) * 60 * 1000).toISOString(),
    isQuickGenerate: true, // Flag to indicate this is a test QR
  };
  
  return qrData;
};

/**
 * Generate QR code image from URL (client-side)
 * This uses react-qr-code component approach
 */
export const generateQRImage = (qrUrl) => {
  // For client-side generation, we return the URL
  // The QRGenerator component will handle rendering
  return qrUrl;
};

/**
 * Batch generate QR codes
 */
export const batchGenerateQR = async (classes, generateFunction, onProgress) => {
  const results = [];
  const total = classes.length;
  
  for (let i = 0; i < classes.length; i++) {
    const classData = classes[i];
    
    try {
      // Check cache first
      const cached = getCachedQR(classData);
      if (cached) {
        results.push({ ...classData, qrData: cached, cached: true });
        if (onProgress) onProgress(i + 1, total, classData);
        continue;
      }
      
      // Generate QR code
      const result = await generateFunction(classData);
      if (result.data) {
        cacheQR(classData, result.data);
        results.push({ ...classData, qrData: result.data, cached: false });
      } else {
        results.push({ ...classData, error: result.error, cached: false });
      }
      
      if (onProgress) onProgress(i + 1, total, classData);
    } catch (error) {
      results.push({ ...classData, error: error.message, cached: false });
      if (onProgress) onProgress(i + 1, total, classData);
    }
    
    // Small delay to prevent overwhelming the server
    if (i < classes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

/**
 * Clear all QR cache
 */
export const clearAllQRCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing QR cache:', error);
  }
};
