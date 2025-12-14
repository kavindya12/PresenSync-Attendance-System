import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const token = localStorage.getItem('token');

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
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

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper to join class room
export const joinClassRoom = (classId) => {
  const socket = getSocket();
  socket.emit('join:class', classId);
};

// Helper to leave class room
export const leaveClassRoom = (classId) => {
  const socket = getSocket();
  socket.emit('leave:class', classId);
};

export default getSocket;

