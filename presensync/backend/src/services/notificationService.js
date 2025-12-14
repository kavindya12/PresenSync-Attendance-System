import prisma from '../config/database.js';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email transporter (configure with your SMTP settings)
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Twilio client (if configured)
const twilioClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendEmailNotification = async (userId, subject, message) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    });

    if (!user || !user.email) {
      return;
    }

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@presensync.com',
      to: user.email,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendSMSNotification = async (phoneNumber, message) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio not configured, skipping SMS');
    return;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

export const sendPushNotification = async (userId, title, message, type = 'SYSTEM') => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const scheduleClassReminder = async (classId) => {
  const classSession = await prisma.class.findUnique({
    where: { id: classId },
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

  if (!classSession) {
    return;
  }

  // Calculate reminder time (30 minutes before class)
  const reminderTime = new Date(classSession.startTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 30);

  // This will be handled by the scheduler
  return {
    classId,
    reminderTime,
    students: classSession.course.enrollments.map(e => e.student),
    class: classSession,
  };
};

export const checkAttendanceThreshold = async (courseId, threshold = 75) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: {
          student: true,
        },
      },
      classes: true,
    },
  });

  if (!course) {
    return;
  }

  const totalClasses = course.classes.length;
  if (totalClasses === 0) {
    return;
  }

  for (const enrollment of course.enrollments) {
    const presentCount = await prisma.attendanceRecord.count({
      where: {
        studentId: enrollment.studentId,
        classId: { in: course.classes.map(c => c.id) },
        status: { in: ['PRESENT', 'LATE'] },
      },
    });

    const percentage = (presentCount / totalClasses) * 100;

    if (percentage < threshold) {
      await sendPushNotification(
        enrollment.studentId,
        'Attendance Alert',
        `Your attendance for ${course.name} is ${percentage.toFixed(1)}%, below the ${threshold}% threshold.`,
        'ATTENDANCE_ALERT'
      );
    }
  }
};

