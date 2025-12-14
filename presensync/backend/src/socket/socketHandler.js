import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

let ioInstance = null;

export const initializeSocket = (io) => {
  ioInstance = io;

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          fullName: true,
        },
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join role-based rooms
    if (socket.user.role === 'LECTURER' || socket.user.role === 'ADMIN') {
      socket.join('lecturers');
    }
    if (socket.user.role === 'ADMIN') {
      socket.join('admins');
    }

    // Join class room when requested
    socket.on('join:class', (classId) => {
      socket.join(`class:${classId}`);
      console.log(`User ${socket.user.email} joined class:${classId}`);
    });

    // Leave class room
    socket.on('leave:class', (classId) => {
      socket.leave(`class:${classId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

// Export io instance for use in controllers
export const getIO = () => ioInstance;

// Export io for backward compatibility
export { ioInstance as io };

