import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  try {
    if (socket?.connected) {
      return socket;
    }

    const token = localStorage.getItem('token');

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error (non-critical):', error.message);
      // Don't throw - socket is optional
    });

    return socket;
  } catch (error) {
    console.warn('Socket initialization failed (non-critical):', error);
    // Return null instead of throwing - socket is optional
    return null;
  }
};

export const getSocket = () => {
  try {
    if (!socket) {
      return initializeSocket();
    }
    return socket;
  } catch (error) {
    console.warn('Socket get failed (non-critical):', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper to join class room
export const joinClassRoom = (classId) => {
  try {
    const socket = getSocket();
    if (socket) {
      socket.emit('join:class', classId);
    }
  } catch (error) {
    console.warn('Failed to join class room (non-critical):', error);
  }
};

// Helper to leave class room
export const leaveClassRoom = (classId) => {
  try {
    const socket = getSocket();
    if (socket) {
      socket.emit('leave:class', classId);
    }
  } catch (error) {
    console.warn('Failed to leave class room (non-critical):', error);
  }
};

export default getSocket;

