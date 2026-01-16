-- Check and fix admin user profile
-- Run this in Supabase SQL Editor

-- 1. Check if profile exists for admin@gmail.com
SELECT 
    p.id,
    p.email,
    p.role,
    p.full_name,
    au.email as auth_email,
    au.user_metadata->>'role' as metadata_role
FROM public.profiles p
RIGHT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'admin@gmail.com';

-- 2. If profile doesn't exist, create it with admin role
-- Replace 'USER_UUID_HERE' with the actual UUID from step 1
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'admin' as role,
    COALESCE(user_metadata->>'full_name', 'Administrator') as full_name
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'admin',
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

-- 3. Verify the admin user was created/updated
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'admin@gmail.com';

-- 4. Also update user metadata to ensure role is set
-- (This helps if profile fetch fails)
UPDATE auth.users
SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'admin@gmail.com';

