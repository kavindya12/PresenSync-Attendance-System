import prisma from '../config/database.js';
import * as notificationService from '../services/notificationService.js';

export const createLeave = async (req, res, next) => {
  try {
    const { classId, reason, startDate, endDate } = req.body;

    if (!reason || !startDate || !endDate) {
      return res.status(400).json({ error: 'Reason, startDate, and endDate are required' });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId: req.user.id,
        classId,
        reason,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
                lecturer: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Notify lecturer
    if (leave.class?.course?.lecturer) {
      await notificationService.sendPushNotification(
        leave.class.course.lecturer.id,
        'New Leave Request',
        `${req.user.fullName} has requested leave for ${leave.class.course.name}`
      );
    }

    res.status(201).json({ leave });
  } catch (error) {
    next(error);
  }
};

export const getLeaves = async (req, res, next) => {
  try {
    const { status, studentId, classId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;

    // Filter by role
    if (req.user.role === 'STUDENT') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'LECTURER') {
      // Lecturers see leaves for their courses
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

    const leaves = await prisma.leaveRequest.findMany({
      where,
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
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ leaves });
  } catch (error) {
    next(error);
  }
};

export const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
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
                lecturer: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check access
    if (req.user.role === 'STUDENT' && leave.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ leave });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && leave.class?.course?.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to approve this leave' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
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

    // Notify student
    await notificationService.sendPushNotification(
      leave.studentId,
      'Leave Approved',
      `Your leave request for ${leave.class?.course?.name || 'class'} has been approved`
    );

    res.json({ leave: updated });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({ error: 'Leave request already processed' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && leave.class?.course?.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to reject this leave' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: req.user.id,
        approvedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
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

    // Notify student
    await notificationService.sendPushNotification(
      leave.studentId,
      'Leave Rejected',
      `Your leave request for ${leave.class?.course?.name || 'class'} has been rejected`
    );

    res.json({ leave: updated });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({ error: 'Cannot cancel processed leave request' });
    }

    await prisma.leaveRequest.delete({
      where: { id },
    });

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

