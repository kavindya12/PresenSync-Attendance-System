import cron from 'node-cron';
import prisma from '../config/database.js';
import * as notificationService from './notificationService.js';

// Schedule class reminders (runs every minute)
cron.schedule('* * * * *', async () => {
  try {
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
    console.error('Error in class reminder scheduler:', error);
  }
});

// Check attendance thresholds daily (runs at 9 AM)
cron.schedule('0 9 * * *', async () => {
  try {
    const courses = await prisma.course.findMany({
      select: { id: true },
    });

    for (const course of courses) {
      await notificationService.checkAttendanceThreshold(course.id, 75);
    }
  } catch (error) {
    console.error('Error in attendance threshold checker:', error);
  }
});

console.log('Scheduled tasks initialized');

