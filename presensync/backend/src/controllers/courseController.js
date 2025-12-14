import prisma from '../config/database.js';

export const getAllCourses = async (req, res, next) => {
  try {
    const { semester, department, search } = req.query;

    const where = {};
    if (semester) where.semester = semester;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (req.user.role === 'STUDENT') {
      // Students see only enrolled courses
      const enrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: req.user.id },
        select: { courseId: true },
      });
      where.id = { in: enrollments.map(e => e.courseId) };
    } else if (req.user.role === 'LECTURER') {
      // Lecturers see only their courses
      where.lecturerId = req.user.id;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            classes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
        enrollments: {
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
        classes: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            enrollments: true,
            classes: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'STUDENT') {
      const isEnrolled = course.enrollments.some(e => e.studentId === req.user.id);
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    } else if (req.user.role === 'LECTURER' && course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this course' });
    }

    res.json({ course });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { code, name, semester, department, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Course code and name are required' });
    }

    // Check if course code already exists
    const existing = await prisma.course.findUnique({
      where: { code },
    });

    if (existing) {
      return res.status(409).json({ error: 'Course with this code already exists' });
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        semester,
        department: department || req.user.department,
        description,
        lecturerId: req.user.id,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, semester, department, description } = req.body;

    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'ADMIN' && course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(semester !== undefined && { semester }),
        ...(department && { department }),
        ...(description !== undefined && { description }),
      },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json({ course: updatedCourse });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await prisma.course.delete({
      where: { id },
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const enrollStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentIds, studentEmails } = req.body;

    // Check if course exists and user has permission
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role !== 'ADMIN' && course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to enroll students' });
    }

    let userIds = [];

    if (studentIds && studentIds.length > 0) {
      userIds = studentIds;
    } else if (studentEmails && studentEmails.length > 0) {
      const users = await prisma.user.findMany({
        where: {
          email: { in: studentEmails },
          role: 'STUDENT',
        },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    } else {
      return res.status(400).json({ error: 'studentIds or studentEmails required' });
    }

    // Bulk enroll (skip duplicates)
    const enrollments = await Promise.all(
      userIds.map(studentId =>
        prisma.courseEnrollment.upsert({
          where: {
            courseId_studentId: {
              courseId: id,
              studentId,
            },
          },
          update: {},
          create: {
            courseId: id,
            studentId,
          },
        })
      )
    );

    res.status(201).json({
      message: `${enrollments.length} students enrolled successfully`,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledStudents = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'STUDENT') {
      const isEnrolled = await prisma.courseEnrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId: id,
            studentId: req.user.id,
          },
        },
      });
      if (!isEnrolled) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
      }
    } else if (req.user.role === 'LECTURER' && course.lecturerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: id },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            department: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ students: enrollments.map(e => e.student) });
  } catch (error) {
    next(error);
  }
};

