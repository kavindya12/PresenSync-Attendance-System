import prisma from '../config/database.js';
import * as reportService from '../services/reportService.js';

export const generatePDFReport = async (req, res, next) => {
  try {
    const { courseId, classId, studentId, startDate, endDate } = req.query;

    // Build query
    const where = {};
    if (classId) {
      where.classId = classId;
    } else if (courseId) {
      const classes = await prisma.class.findMany({
        where: { courseId },
        select: { id: true },
      });
      where.classId = { in: classes.map(c => c.id) };
    }
    if (studentId) where.studentId = studentId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
            studentId: true,
          },
        },
        class: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const pdfBuffer = await reportService.generatePDFReport(records, req.query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const generateExcelReport = async (req, res, next) => {
  try {
    const { courseId, classId, studentId, startDate, endDate } = req.query;

    // Build query
    const where = {};
    if (classId) {
      where.classId = classId;
    } else if (courseId) {
      const classes = await prisma.class.findMany({
        where: { courseId },
        select: { id: true },
      });
      where.classId = { in: classes.map(c => c.id) };
    }
    if (studentId) where.studentId = studentId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          select: {
            fullName: true,
            email: true,
            studentId: true,
          },
        },
        class: {
          include: {
            course: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const excelBuffer = await reportService.generateExcelReport(records, req.query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query;

    const analytics = await reportService.getAnalyticsData({
      courseId,
      studentId: studentId || (req.user.role === 'STUDENT' ? req.user.id : undefined),
      startDate,
      endDate,
    });

    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};

