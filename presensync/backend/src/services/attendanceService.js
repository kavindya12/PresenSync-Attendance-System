import prisma from '../config/database.js';
import { validateQRCode } from './qrService.js';
import { updateStreak, checkAchievements } from './gamificationService.js';

export const markAttendanceByQR = async (qrCode, studentId) => {
  const { classId, class: classSession } = await validateQRCode(qrCode);

  // Check if already marked
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (existing) {
    throw new Error('Attendance already marked for this class');
  }

  // Check if student is enrolled
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: classSession.courseId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  // Determine status (late if after start time + 10 minutes)
  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  // Create attendance record
  const record = await prisma.attendanceRecord.create({
    data: {
      classId,
      studentId,
      method: 'QR',
      status,
    },
    include: {
      class: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
        },
      },
    },
  });

  // Update streak and check achievements
  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceByNFC = async (nfcTagId, studentId) => {
  // Find class by NFC tag
  const classSession = await prisma.class.findFirst({
    where: {
      nfcTagId,
      startTime: { lte: new Date() },
      endTime: { gte: new Date() },
    },
    include: {
      course: true,
    },
  });

  if (!classSession) {
    throw new Error('No active class found for this NFC tag');
  }

  // Check if already marked
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      classId_studentId: {
        classId: classSession.id,
        studentId,
      },
    },
  });

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: classSession.courseId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const record = await prisma.attendanceRecord.create({
    data: {
      classId: classSession.id,
      studentId,
      method: 'NFC',
      status,
    },
    include: {
      class: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
        },
      },
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceByBeacon = async (beaconId, studentId, location) => {
  // Find beacon
  const beacon = await prisma.beacon.findUnique({
    where: { id: beaconId },
    include: {
      class: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!beacon || !beacon.isActive) {
    throw new Error('Beacon not found or inactive');
  }

  const classSession = beacon.class;

  // Check if class is active
  const now = new Date();
  if (now < classSession.startTime || now > classSession.endTime) {
    throw new Error('Class is not in session');
  }

  // Check if already marked
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      classId_studentId: {
        classId: classSession.id,
        studentId,
      },
    },
  });

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: classSession.courseId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const record = await prisma.attendanceRecord.create({
    data: {
      classId: classSession.id,
      studentId,
      method: 'BEACON',
      status,
      latitude: location?.latitude,
      longitude: location?.longitude,
    },
    include: {
      class: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
        },
      },
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceByFacial = async (imageData, studentId) => {
  // This is a simplified version - in production, you'd use AWS Rekognition or DeepFace
  // For now, we'll require classId to be passed in the imageData
  const { classId, image } = imageData;

  if (!classId) {
    throw new Error('Class ID required for facial recognition');
  }

  const classSession = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      course: true,
    },
  });

  if (!classSession) {
    throw new Error('Class not found');
  }

  // TODO: Implement actual facial recognition
  // For now, we'll just verify the student and mark attendance
  // In production: Compare image with stored student photos using AWS Rekognition

  // Check if already marked
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: classSession.courseId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const record = await prisma.attendanceRecord.create({
    data: {
      classId,
      studentId,
      method: 'FACIAL',
      status,
    },
    include: {
      class: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
        },
      },
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceManually = async (classId, studentId, reason) => {
  const classSession = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      course: true,
    },
  });

  if (!classSession) {
    throw new Error('Class not found');
  }

  // Check if already marked
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (existing) {
    // Update existing record
    return await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        method: 'MANUAL',
        status: 'PRESENT',
        reason,
      },
      include: {
        class: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
          },
        },
      },
    });
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      classId,
      studentId,
      method: 'MANUAL',
      status: 'PRESENT',
      reason,
    },
    include: {
      class: {
        include: {
          course: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          studentId: true,
        },
      },
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const calculateAttendancePercentage = async (studentId, courseId) => {
  const classes = await prisma.class.findMany({
    where: { courseId },
  });

  const totalClasses = classes.length;
  if (totalClasses === 0) return 0;

  const presentRecords = await prisma.attendanceRecord.count({
    where: {
      studentId,
      classId: { in: classes.map(c => c.id) },
      status: { in: ['PRESENT', 'LATE'] },
    },
  });

  return ((presentRecords / totalClasses) * 100).toFixed(2);
};

