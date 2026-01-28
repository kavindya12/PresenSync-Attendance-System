-- Quick Test Users Setup for Frontend Testing
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/editor

-- IMPORTANT: First create these users in Supabase Auth Dashboard:
-- 1. Go to Authentication → Users → Add user
-- 2. Create each user manually:
--    - student@gmail.com / password: student123
--    - lecturer@gmail.com / password: lecturer123
-- 3. Make sure "Auto Confirm User" is ON for both
-- 4. Then run this SQL to create/update their profiles

-- ============================================
-- STUDENT USER
-- ============================================
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'student' as role,
    'Test Student' as full_name
FROM auth.users
WHERE email = 'student@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'student',
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

-- Update user metadata for student (use raw_user_meta_data - this is what frontend reads as user_metadata)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb('student'::text)
)
WHERE email = 'student@gmail.com';

-- ============================================
-- LECTURER USER
-- ============================================
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'lecturer' as role,
    'Test Lecturer' as full_name
FROM auth.users
WHERE email = 'lecturer@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'lecturer',
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

-- Update user metadata for lecturer (use raw_user_meta_data - this is what frontend reads as user_metadata)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb('lecturer'::text)
)
WHERE email = 'lecturer@gmail.com';

-- ============================================
-- VERIFY USERS WERE CREATED
-- ============================================
SELECT 
    p.id,
    p.email,
    p.role,
    p.full_name,
    au.raw_user_meta_data->>'role' as metadata_role,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ User exists in auth'
        ELSE '❌ User NOT in auth'
    END as auth_status
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email IN ('student@gmail.com', 'lecturer@gmail.com')
ORDER BY p.email;

