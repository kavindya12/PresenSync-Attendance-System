import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prisma from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/socketHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get user count
    const userCount = await prisma.user.count();
    
    // Get table information
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      statistics: {
        totalUsers: userCount,
        totalTables: tables.length,
      },
      tables: tables.map(t => t.table_name),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import classRoutes from './routes/classes.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import gamificationRoutes from './routes/gamification.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/gamification', gamificationRoutes);

// Initialize Socket.io
initializeSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start scheduled tasks
import './services/scheduler.js';

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server initialized`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
