-- SQL script to create admin user in Supabase
-- Run this in Supabase SQL Editor after creating the user in Auth

-- First, create the user in Auth (do this manually in Supabase Dashboard):
-- 1. Go to Authentication → Users → Add user
-- 2. Email: admin@gmail.com
-- 3. Password: admin123
-- 4. Auto Confirm User: ON
-- 5. Create user

-- Then run this SQL to set the role to admin:
-- (Replace 'USER_UUID_HERE' with the actual UUID from auth.users)

-- Option 1: If user already exists in auth.users, update their profile
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@gmail.com';

-- Option 2: If profile doesn't exist yet, insert it
-- (Get the UUID from auth.users table first)
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin' as role,
  'Administrator' as full_name
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the admin user was created/updated
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

