import prisma from '../config/database.js';

export const getStreak = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    let streak = await prisma.attendanceStreak.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    // If no streak exists, create one with default values
    if (!streak) {
      streak = await prisma.attendanceStreak.create({
        data: {
          studentId,
          courseId,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    res.json({ streak });
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const achievements = await prisma.achievement.findMany({
      where: { studentId },
      orderBy: { earnedAt: 'desc' },
    });

    res.json({ achievements });
  } catch (error) {
    next(error);
  }
};

export const getCourseAchievements = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Get streak for context
    const streak = await prisma.attendanceStreak.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    // Get all achievements for this student
    const achievements = await prisma.achievement.findMany({
      where: { studentId },
      orderBy: { earnedAt: 'desc' },
    });

    res.json({
      streak: streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastAttendanceDate: null,
      },
      achievements,
    });
  } catch (error) {
    next(error);
  }
};

