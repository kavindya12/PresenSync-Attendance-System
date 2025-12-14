import prisma from '../config/database.js';
import * as attendanceService from '../services/attendanceService.js';
import { getIO } from '../socket/socketHandler.js';

export const markAttendance = async (req, res, next) => {
  try {
    const { method, data, classId, reason, latitude, longitude } = req.body;

    if (!method || !data) {
      return res.status(400).json({ error: 'Method and data are required' });
    }

    let attendanceRecord;

    switch (method) {
      case 'QR':
        attendanceRecord = await attendanceService.markAttendanceByQR(data, req.user.id);
        break;
      case 'NFC':
        attendanceRecord = await attendanceService.markAttendanceByNFC(data, req.user.id);
        break;
      case 'BEACON':
        attendanceRecord = await attendanceService.markAttendanceByBeacon(
          data,
          req.user.id,
          { latitude, longitude }
        );
        break;
      case 'FACIAL':
        attendanceRecord = await attendanceService.markAttendanceByFacial(data, req.user.id);
        break;
      case 'MANUAL':
        if (!classId || !reason) {
          return res.status(400).json({ error: 'classId and reason required for manual attendance' });
        }
        attendanceRecord = await attendanceService.markAttendanceManually(
          classId,
          req.user.id,
          reason
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid attendance method' });
    }

    // Emit real-time update
    const io = getIO();
    if (io) {
      io.to(`class:${attendanceRecord.classId}`).emit('attendance:marked', {
        attendanceRecord,
        student: req.user,
      });
    }

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendanceRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { classId, studentId, courseId, startDate, endDate, method, status } = req.query;

    const where = {};
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (method) where.method = method;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Filter by role
    if (req.user.role === 'STUDENT') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'LECTURER') {
      // Lecturers see attendance for their courses
      const courses = await prisma.course.findMany({
        where: { lecturerId: req.user.id },
        select: { id: true },
      });
      const classes = await prisma.class.findMany({
        where: { courseId: { in: courses.map(c => c.id) } },
        select: { id: true },
      });
      where.classId = { in: classes.map(c => c.id) };
    }

    // If courseId provided, filter by classes in that course
    if (courseId) {
      const classes = await prisma.class.findMany({
        where: { courseId },
        select: { id: true },
      });
      where.classId = { in: classes.map(c => c.id) };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        class: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
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
      orderBy: { timestamp: 'desc' },
    });

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classSession = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: true,
      },
    });

    if (!classSession) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check access
    if (req.user.role === 'STUDENT') {
      const isEnrolled = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: classSession.courseId,
            studentId: req.user.id,
          },
        },
      });
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Not enrolled' });
      }
    } else if (req.user.role === 'LECTURER' && classSession.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Get all enrolled students
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: classSession.courseId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Mark who's present/absent
    const attendanceMap = new Map(records.map(r => [r.studentId, r]));
    const attendanceList = enrollments.map(enrollment => ({
      student: enrollment.student,
      attendance: attendanceMap.get(enrollment.student.id) || null,
      status: attendanceMap.has(enrollment.student.id) ? 'PRESENT' : 'ABSENT',
    }));

    res.json({
      class: classSession,
      attendance: attendanceList,
      stats: {
        total: enrollments.length,
        present: records.length,
        absent: enrollments.length - records.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check access
    if (req.user.role === 'STUDENT' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ records });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const record = await prisma.attendanceRecord.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && record.class.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(reason && { reason }),
        method: 'MANUAL',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
          },
        },
        class: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Emit update
    const io = getIO();
    if (io) {
      io.to(`class:${record.classId}`).emit('attendance:updated', { attendanceRecord: updated });
    }

    res.json({ attendanceRecord: updated });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (req, res, next) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query;

    let where = {};
    if (studentId) {
      where.studentId = studentId;
    } else if (req.user.role === 'STUDENT') {
      where.studentId = req.user.id;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    if (courseId) {
      const classes = await prisma.class.findMany({
        where: { courseId },
        select: { id: true },
      });
      where.classId = { in: classes.map(c => c.id) };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
    });

    // Calculate statistics
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;

    const byMethod = records.reduce((acc, r) => {
      acc[r.method] = (acc[r.method] || 0) + 1;
      return acc;
    }, {});

    const byCourse = records.reduce((acc, r) => {
      const courseId = r.class.course.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseName: r.class.course.name,
          total: 0,
          present: 0,
          absent: 0,
        };
      }
      acc[courseId].total++;
      if (r.status === 'PRESENT') acc[courseId].present++;
      else acc[courseId].absent++;
      return acc;
    }, {});

    res.json({
      stats: {
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
      },
      byMethod,
      byCourse: Object.values(byCourse),
    });
  } catch (error) {
    next(error);
  }
};

