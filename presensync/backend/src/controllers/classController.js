import prisma from '../config/database.js';
import { generateQRCode } from '../services/qrService.js';

export const getAllClasses = async (req, res, next) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const where = {};
    if (courseId) where.courseId = courseId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    // Filter by role
    if (req.user.role === 'STUDENT') {
      // Students see classes for enrolled courses
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: req.user.id },
        select: { courseId: true },
      });
      where.courseId = { in: enrollments.map(e => e.courseId) };
    } else if (req.user.role === 'LECTURER') {
      // Lecturers see classes for their courses
      const courses = await prisma.course.findMany({
        where: { lecturerId: req.user.id },
        select: { id: true },
      });
      where.courseId = { in: courses.map(c => c.id) };
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            attendanceRecords: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ classes });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classSession = await prisma.class.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            lecturer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        attendanceRecords: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                studentId: true,
              },
            },
          },
        },
        beacon: true,
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
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    } else if (req.user.role === 'LECTURER' && classSession.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ class: classSession });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { courseId, title, room, startTime, endTime } = req.body;

    if (!courseId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'ADMIN' && course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to create class for this course' });
    }

    const classSession = await prisma.class.create({
      data: {
        courseId,
        title,
        room,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({ class: classSession });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, room, startTime, endTime } = req.body;

    const classSession = await prisma.class.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!classSession) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (req.user.role !== 'ADMIN' && classSession.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(room !== undefined && { room }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.json({ class: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classSession = await prisma.class.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!classSession) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (req.user.role !== 'ADMIN' && classSession.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.class.delete({
      where: { id },
    });

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const generateQR = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classSession = await prisma.class.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!classSession) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (req.user.role !== 'ADMIN' && classSession.course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { qrCode, qrCodeExpiry } = await generateQRCode(id);

    const updated = await prisma.class.update({
      where: { id },
      data: {
        qrCode,
        qrCodeExpiry,
      },
    });

    res.json({
      qrCode,
      qrCodeExpiry,
      class: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getQR = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classSession = await prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        qrCode: true,
        qrCodeExpiry: true,
        course: {
          select: {
            lecturerId: true,
          },
        },
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

    if (!classSession.qrCode) {
      return res.status(404).json({ error: 'QR code not generated yet' });
    }

    // Check if expired
    if (classSession.qrCodeExpiry && new Date() > new Date(classSession.qrCodeExpiry)) {
      return res.status(410).json({ error: 'QR code expired' });
    }

    res.json({
      qrCode: classSession.qrCode,
      qrCodeExpiry: classSession.qrCodeExpiry,
    });
  } catch (error) {
    next(error);
  }
};

