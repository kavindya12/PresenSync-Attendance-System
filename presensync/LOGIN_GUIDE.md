# Login Guide - PresenSync

## What Happens When You Login

When you log in to PresenSync, here's what happens automatically:

1. **Authentication**: Your credentials are verified with Supabase Auth
2. **Profile Loading**: Your user profile is loaded from the database
3. **Role Detection**: Your role (student/lecturer/admin) is determined
4. **Automatic Redirect**: You're redirected to your dashboard based on your role:
   - **Student** → `/student` dashboard
   - **Lecturer** → `/lecturer` dashboard
   - **Admin** → `/admin` dashboard

## First-Time Setup Steps

### For NEW Users (Signing Up)

✅ **No extra steps needed!** 
- Just sign up through the website
- Your profile is automatically created by the database trigger
- You'll be redirected to your dashboard immediately

### For EXISTING Users (Already have an account)

If you already have an account but can't log in or get redirected incorrectly, you may need to:

#### Step 1: Check if your profile exists

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/editor)
2. Open the SQL Editor
3. Run this query:

```sql
SELECT 
    p.id,
    p.email,
    p.role,
    p.full_name,
    au.email as auth_email
FROM public.profiles p
RIGHT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'YOUR_EMAIL_HERE';
```

#### Step 2: If profile doesn't exist, create it

Run the SQL from `check-and-fix-admin-user.sql` (replace `admin@gmail.com` with your email):

```sql
-- Create/update your profile
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'student' as role,  -- Change to 'lecturer' or 'admin' as needed
    COALESCE(user_metadata->>'full_name', email) as full_name
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE 
SET 
    role = COALESCE(EXCLUDED.role, profiles.role),
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
```

## Common Login Issues & Solutions

### Issue 1: "Redirects to landing page instead of dashboard"

**Solution**: Your profile might be missing or role is not set.

1. Run the SQL script above to create/update your profile
2. Make sure your role is set correctly ('student', 'lecturer', or 'admin')
3. Try logging in again

### Issue 2: "Can't see my dashboard"

**Solution**: Check your role in the database:

```sql
SELECT email, role FROM public.profiles WHERE email = 'YOUR_EMAIL_HERE';
```

If role is NULL or wrong, update it:

```sql
UPDATE public.profiles 
SET role = 'admin'  -- or 'student' or 'lecturer'
WHERE email = 'YOUR_EMAIL_HERE';
```

### Issue 3: "Profile fetch failed" error

**Solution**: The app will use session metadata as fallback, but it's better to fix the profile:

1. Make sure the `profiles` table exists (run `supabase_setup.sql` if needed)
2. Create your profile using the SQL above
3. Refresh and try again

## Quick Test

After logging in, check the browser console (F12) for:
- ✅ "Redirecting user with role: [your-role]" - means redirect is working
- ❌ Any error messages - share them for troubleshooting

## Need Help?

If you're still having issues:
1. Check the browser console (F12) for errors
2. Check the PowerShell windows for server errors
3. Verify your Supabase credentials in `.env` file
4. Make sure the database tables are set up (run `supabase_setup.sql`)


