import { supabase } from '../config/database.js';
import { validateQRCode } from './qrService.js';
import { updateStreak, checkAchievements } from './gamificationService.js';

export const markAttendanceByQR = async (qrCode, studentId) => {
  const { classId, class: classSession } = await validateQRCode(qrCode);

  // Check if already marked
  const { data: existing, error: existingError } = await supabase
    .from('attendanceRecord')
    .select('*')
    .eq('classId', classId)
    .eq('studentId', studentId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message);
  }

  if (existing) {
    throw new Error('Attendance already marked for this class');
  }

  // Check if student is enrolled
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('courseEnrollment')
    .select('*')
    .eq('courseId', classSession.courseId)
    .eq('studentId', studentId)
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  // Determine status (late if after start time + 10 minutes)
  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  // Insert attendance record
  const { error: insertError } = await supabase
    .from('attendanceRecord')
    .insert({
      classId,
      studentId,
      status,
      timestamp: now.toISOString(),
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  // Update streak and check achievements
  await updateStreak(studentId, status);
  await checkAchievements(studentId);
};

export const markAttendanceByNFC = async (nfcTagId, studentId) => {
  // Find class by NFC tag
  const { data: classSession, error } = await supabase
    .from('class')
    .select('*')
    .eq('nfcTagId', nfcTagId)
    .lte('startTime', new Date())
    .gte('endTime', new Date())
    .single();

  if (error) {
    throw new Error('No active class found for this NFC tag');
  }

  // Check if already marked
  const { data: existing, error: existingError } = await supabase
    .from('attendanceRecord')
    .select('*')
    .eq('classId', classSession.id)
    .eq('studentId', studentId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message);
  }

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('courseEnrollment')
    .select('*')
    .eq('courseId', classSession.courseId)
    .eq('studentId', studentId)
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const { error: insertError } = await supabase
    .from('attendanceRecord')
    .insert({
      classId: classSession.id,
      studentId,
      status,
      timestamp: now.toISOString(),
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceByBeacon = async (beaconId, studentId, location) => {
  // Find beacon
  const { data: beacon, error } = await supabase
    .from('beacon')
    .select('*')
    .eq('id', beaconId)
    .single();

  if (error || !beacon.isActive) {
    throw new Error('Beacon not found or inactive');
  }

  const classSession = beacon.class;

  // Check if class is active
  const now = new Date();
  if (now < classSession.startTime || now > classSession.endTime) {
    throw new Error('Class is not in session');
  }

  // Check if already marked
  const { data: existing, error: existingError } = await supabase
    .from('attendanceRecord')
    .select('*')
    .eq('classId', classSession.id)
    .eq('studentId', studentId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message);
  }

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('courseEnrollment')
    .select('*')
    .eq('courseId', classSession.courseId)
    .eq('studentId', studentId)
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const { error: insertError } = await supabase
    .from('attendanceRecord')
    .insert({
      classId: classSession.id,
      studentId,
      status,
      latitude: location?.latitude,
      longitude: location?.longitude,
      timestamp: now.toISOString(),
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

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

  const { data: classSession, error } = await supabase
    .from('class')
    .select('*')
    .eq('id', classId)
    .single();

  if (error) {
    throw new Error('Class not found');
  }

  // TODO: Implement actual facial recognition
  // For now, we'll just verify the student and mark attendance
  // In production: Compare image with stored student photos using AWS Rekognition

  // Check if already marked
  const { data: existing, error: existingError } = await supabase
    .from('attendanceRecord')
    .select('*')
    .eq('classId', classId)
    .eq('studentId', studentId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message);
  }

  if (existing) {
    throw new Error('Attendance already marked');
  }

  // Check enrollment
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('courseEnrollment')
    .select('*')
    .eq('courseId', classSession.courseId)
    .eq('studentId', studentId)
    .single();

  if (enrollmentError && enrollmentError.code !== 'PGRST116') {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    throw new Error('Not enrolled in this course');
  }

  const now = new Date();
  const startTime = new Date(classSession.startTime);
  const lateThreshold = new Date(startTime.getTime() + 10 * 60 * 1000);
  const status = now > lateThreshold ? 'LATE' : 'PRESENT';

  const { error: insertError } = await supabase
    .from('attendanceRecord')
    .insert({
      classId,
      studentId,
      status,
      timestamp: now.toISOString(),
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  await updateStreak(studentId, classSession.courseId);
  await checkAchievements(studentId, classSession.courseId);

  return record;
};

export const markAttendanceManually = async (classId, studentId, reason) => {
  const { data: classSession, error } = await supabase
    .from('class')
    .select('*')
    .eq('id', classId)
    .single();

  if (error) {
    throw new Error('Class not found');
  }

  // Check if already marked
  const { data: existing, error: existingError } = await supabase
    .from('attendanceRecord')
    .select('*')
    .eq('classId', classId)
    .eq('studentId', studentId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    throw new Error(existingError.message);
  }

  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('attendanceRecord')
      .update({
        method: 'MANUAL',
        status: 'PRESENT',
        reason,
      })
      .eq('id', existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return existing;
  }

  const { error: insertError } = await supabase
    .from('attendanceRecord')
    .insert({
      classId,
      studentId,
      method: 'MANUAL',
      status: 'PRESENT',
      reason,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

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

