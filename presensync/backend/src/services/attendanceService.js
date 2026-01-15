import { prisma } from '../config/database.js';
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

  // Insert attendance record
  const record = await prisma.attendanceRecord.create({
    data: {
      classId,
      studentId,
      status,
      method: 'QR',
      timestamp: now,
    },
  });

  // Update streak and check achievements
  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId);

  return record;
};

export const markAttendanceByNFC = async (nfcTagId, studentId) => {
  // Find class by NFC tag
  const now = new Date();
  const classSession = await prisma.class.findFirst({
    where: {
      nfcTagId,
      startTime: { lte: now },
      endTime: { gte: now },
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

  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const record = await prisma.attendanceRecord.create({
    data: {
      classId: classSession.id,
      studentId,
      status,
      method: 'NFC',
      timestamp: now,
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
    include: { class: true },
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
      status,
      method: 'BEACON',
      latitude: location?.latitude,
      longitude: location?.longitude,
      timestamp: now,
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceByFacial = async (imageData, studentId) => {
  // This is a simplified version - in production, you'd use AWS Rekognition or DeepFace
  const { classId, image } = imageData;

  if (!classId) {
    throw new Error('Class ID required for facial recognition');
  }

  const classSession = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classSession) {
    throw new Error('Class not found');
  }

  // TODO: Implement actual facial recognition compare logic here

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
      status,
      method: 'FACIAL',
      timestamp: now,
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceManually = async (classId, studentId, reason) => {
  const classSession = await prisma.class.findUnique({
    where: { id: classId },
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
    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        method: 'MANUAL',
        status: 'PRESENT',
        reason,
      },
    });

    return updated;
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      classId,
      studentId,
      method: 'MANUAL',
      status: 'PRESENT',
      reason,
      timestamp: new Date(),
    },
  });

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const calculateAttendancePercentage = async (studentId, courseId) => {
  const { data: classes, error } = await supabase
    .from('class')
    .select('*')
    .eq('courseId', courseId);

  if (error) {
    throw new Error(error.message);
  }

  const totalClasses = classes.length;
  if (totalClasses === 0) return 0;

  const { count: presentRecords } = await supabase
    .from('attendanceRecord')
    .select('studentId', { count: 'exact' })
    .eq('studentId', studentId)
    .in('classId', classes.map(c => c.id))
    .in('status', ['PRESENT', 'LATE']);

  return ((presentRecords / totalClasses) * 100).toFixed(2);
};

