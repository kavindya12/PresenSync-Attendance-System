import cron from 'node-cron';
import prisma from '../config/database.js';
import * as notificationService from './notificationService.js';

// Helper function to check database connection
let dbConnectionChecked = false;
let dbAvailable = false;

async function checkDatabaseConnection() {
  if (dbConnectionChecked) return dbAvailable;
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbAvailable = true;
    dbConnectionChecked = true;
    return true;
  } catch (error) {
    dbAvailable = false;
    dbConnectionChecked = true;
    // Only log once to avoid spam
    if (!process.env.DB_ERROR_LOGGED) {
      console.warn('⚠️  Database not available. Scheduler will skip database operations.');
      console.warn('   Configure your DATABASE_URL in .env to enable scheduled tasks.');
      process.env.DB_ERROR_LOGGED = 'true';
    }
    return false;
  }
}

// Schedule class reminders (runs every minute)
cron.schedule('* * * * *', async () => {
  try {
    // Check if database is available first
    const isDbAvailable = await checkDatabaseConnection();
    if (!isDbAvailable) {
      return; // Silently skip if database is not available
    }

    // Find classes starting in 30 minutes
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 30 * 60 * 1000);

    const upcomingClasses = await prisma.class.findMany({
      where: {
        startTime: {
          gte: new Date(reminderTime.getTime() - 60 * 1000), // 1 minute window
          lte: reminderTime,
        },
      },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    for (const classSession of upcomingClasses) {
      for (const enrollment of classSession.course.enrollments) {
        // Check if reminder already sent (you might want to track this)
        await notificationService.sendPushNotification(
          enrollment.student.id,
          'Class Reminder',
          `${classSession.course.name} - ${classSession.title} starts in 30 minutes`,
          'CLASS_REMINDER'
        );

        // Send email if configured
        if (process.env.EMAIL_ENABLED === 'true') {
          await notificationService.sendEmailNotification(
            enrollment.student.id,
            `Class Reminder: ${classSession.course.name}`,
            `${classSession.title} starts in 30 minutes at ${classSession.room || 'TBA'}`
          );
        }
      }
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam
    if (!error.message?.includes('Can\'t reach database server')) {
      console.error('Error in class reminder scheduler:', error.message);
    }
  }
});

// Check attendance thresholds daily (runs at 9 AM)
cron.schedule('0 9 * * *', async () => {
  try {
    // Check if database is available first
    const isDbAvailable = await checkDatabaseConnection();
    if (!isDbAvailable) {
      return; // Silently skip if database is not available
    }

    const courses = await prisma.course.findMany({
      select: { id: true },
    });

    for (const course of courses) {
      await notificationService.checkAttendanceThreshold(course.id, 75);
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam
    if (!error.message?.includes('Can\'t reach database server')) {
      console.error('Error in attendance threshold checker:', error.message);
    }
  }
});

console.log('Scheduled tasks initialized');

