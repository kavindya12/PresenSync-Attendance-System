import { supabase } from '../config/database.js';

export const updateStreak = async (studentId, courseId) => {
  const { data: streak, error: streakError } = await supabase
    .from('attendanceStreak')
    .select('*')
    .eq('studentId', studentId)
    .eq('courseId', courseId)
    .single();

  if (streakError && streakError.code !== 'PGRST116') {
    throw new Error(streakError.message);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!streak) {
    // Create new streak
    const { error: createError } = await supabase
      .from('attendanceStreak')
      .insert({
        studentId,
        courseId,
        currentStreak: 1,
        longestStreak: 1,
        lastAttendanceDate: today.toISOString(),
      });

    if (createError) {
      throw new Error(createError.message);
    }
    return;
  }

  const lastDate = streak.lastAttendanceDate
    ? new Date(streak.lastAttendanceDate)
    : null;
  lastDate?.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = streak.currentStreak;
  if (!lastDate || lastDate.getTime() === today.getTime()) {
    // Same day, don't update
    return;
  } else if (lastDate.getTime() === yesterday.getTime()) {
    // Increment streak
    newStreak += 1;
  } else {
    // Reset streak
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, streak.longestStreak);

  const { error: updateError } = await supabase
    .from('attendanceStreak')
    .update({
      currentStreak: newStreak,
      longestStreak,
      lastAttendanceDate: today.toISOString(),
    })
    .eq('studentId', studentId)
    .eq('courseId', courseId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};

export const checkAchievements = async (studentId, courseId) => {
  const streak = await prisma.attendanceStreak.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  });

  if (!streak) return;

  const badges = [];

  // Check for streak achievements
  if (streak.currentStreak >= 30 && !(await hasBadge(studentId, 'STREAK_30'))) {
    badges.push('STREAK_30');
  } else if (streak.currentStreak >= 10 && !(await hasBadge(studentId, 'STREAK_10'))) {
    badges.push('STREAK_10');
  }

  // Check for perfect week (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const classes = await prisma.class.findMany({
    where: {
      courseId,
      startTime: { gte: weekAgo },
    },
  });

  const attendanceCount = await prisma.attendanceRecord.count({
    where: {
      studentId,
      classId: { in: classes.map(c => c.id) },
      status: { in: ['PRESENT', 'LATE'] },
    },
  });

  if (classes.length > 0 && attendanceCount === classes.length && !(await hasBadge(studentId, 'PERFECT_WEEK'))) {
    badges.push('PERFECT_WEEK');
  }

  // Award badges
  for (const badgeType of badges) {
    await prisma.achievement.create({
      data: {
        studentId,
        badgeType,
      },
    });
  }
};

const hasBadge = async (studentId, badgeType) => {
  const achievement = await prisma.achievement.findUnique({
    where: {
      studentId_badgeType: {
        studentId,
        badgeType,
      },
    },
  });
  return !!achievement;
};

