-- ============================================
-- QR Code Attendance System - Database Schema
-- ============================================
-- Note: This schema assumes you already have:
-- - public.courses (with lecturer_id)
-- - public.course_enrollments
-- - public.classes (with course_id)
-- - public.attendance_records (with class_id, student_id)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure classes table has course_id (if not already present)
-- Note: If classes table already exists with course_id, this will be a no-op
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'classes' 
    AND column_name = 'course_id'
  ) THEN
    -- Add course_id if it doesn't exist
    ALTER TABLE public.classes 
    ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Class Sessions Table (for QR tokens)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  qr_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Additional metadata
  location TEXT,
  module_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER
);

-- 3. Attendance Table (for QR session-based attendance)
-- This works alongside attendance_records for QR-based attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE, -- For compatibility
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, session_id)
);

-- Add session_id to attendance_records if it doesn't exist (for backward compatibility)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'attendance_records'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'attendance_records' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.attendance_records 
    ADD COLUMN session_id UUID REFERENCES public.class_sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON public.class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_qr_token ON public.class_sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_class_sessions_expires_at ON public.class_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON public.attendance(session_id);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Enable RLS on attendance_records if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'attendance_records'
  ) THEN
    ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Note: RLS is already enabled on these tables per inspection. 
-- Review and run the block below as a single migration.
-- It only drops/recreates policies (non-destructive).

-- Classes policies (lecturer = courses.lecturer_id)
DROP POLICY IF EXISTS "Lecturers can view their classes" ON public.classes;
CREATE POLICY "Lecturers can view their classes" ON public.classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = public.classes.course_id
      AND public.courses.lecturer_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Lecturers can create classes" ON public.classes;
CREATE POLICY "Lecturers can create classes" ON public.classes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = NEW.course_id
      AND public.courses.lecturer_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Lecturers can update their classes" ON public.classes;
CREATE POLICY "Lecturers can update their classes" ON public.classes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = public.classes.course_id
      AND public.courses.lecturer_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = NEW.course_id
      AND public.courses.lecturer_id = (SELECT auth.uid())
    )
  );

-- Students viewing classes: restrict to enrolled students (via course_enrollments)
DROP POLICY IF EXISTS "Students can view available classes" ON public.classes;
CREATE POLICY "Students can view available classes" ON public.classes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = public.classes.course_id
      AND ce.student_id = (SELECT auth.uid())
    )
  );

-- If you prefer classes public, replace the USING clause above with: USING (true);

-- Class sessions policies (example only: run if you have public.class_sessions)
-- If your sessions table is named differently, adapt accordingly.
DROP POLICY IF EXISTS "Valid sessions only" ON public.class_sessions;
CREATE POLICY "Valid sessions only" ON public.class_sessions
  FOR SELECT
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "Lecturers can create sessions" ON public.class_sessions;
CREATE POLICY "Lecturers can create sessions" ON public.class_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classes
      JOIN public.courses ON public.courses.id = public.classes.course_id
      WHERE public.classes.id = NEW.class_id
      AND public.courses.lecturer_id = (SELECT auth.uid())
    )
  );

-- Attendance records policies (table: public.attendance_records)
-- Note: These policies apply to the existing attendance_records table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'attendance_records'
  ) THEN
    DROP POLICY IF EXISTS "Students mark own attendance" ON public.attendance_records;
    CREATE POLICY "Students mark own attendance" ON public.attendance_records
      FOR INSERT
      WITH CHECK ((SELECT auth.uid()) = student_id);

    DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance_records;
    CREATE POLICY "Students can view own attendance" ON public.attendance_records
      FOR SELECT
      USING ((SELECT auth.uid()) = student_id);

    DROP POLICY IF EXISTS "Lecturers can view attendance for their classes" ON public.attendance_records;
    CREATE POLICY "Lecturers can view attendance for their classes" ON public.attendance_records
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.classes c
          JOIN public.courses co ON co.id = c.course_id
          WHERE c.id = public.attendance_records.class_id
          AND co.lecturer_id = (SELECT auth.uid())
        )
      );
  END IF;
END $$;

-- Attendance policies (for QR session-based attendance table)
DROP POLICY IF EXISTS "Students mark own attendance" ON public.attendance;
CREATE POLICY "Students mark own attendance" ON public.attendance
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = student_id);

DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance;
CREATE POLICY "Students can view own attendance" ON public.attendance
  FOR SELECT
  USING ((SELECT auth.uid()) = student_id);

DROP POLICY IF EXISTS "Lecturers can view attendance for their classes" ON public.attendance;
CREATE POLICY "Lecturers can view attendance for their classes" ON public.attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_sessions cs
      JOIN public.classes c ON c.id = cs.class_id
      JOIN public.courses co ON co.id = c.course_id
      WHERE cs.id = public.attendance.session_id
      AND co.lecturer_id = (SELECT auth.uid())
    )
  );

-- Optional: allow admins (based on a role claim in the JWT) to bypass some policies.
-- Uncomment and adapt if you use a 'role' custom claim in JWT (e.g., auth.jwt() ->> 'role' = 'admin').
-- Example: permit admins to select classes
-- DROP POLICY IF EXISTS "Admins can view classes" ON public.classes;
-- CREATE POLICY "Admins can view classes" ON public.classes
--   FOR SELECT
--   TO authenticated
--   USING ((auth.jwt() ->> 'role') = 'admin');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for classes table
DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF POLICIES
-- ============================================

-- Validation notes (run manually if needed):
-- 1) Ensure auth.uid() returns a uuid matching the id columns (profiles.id).
-- 2) If any table names differ (e.g., class_sessions), replace accordingly.
-- 3) To allow public visibility for classes, change the "Students can view available classes" policy to USING (true).
