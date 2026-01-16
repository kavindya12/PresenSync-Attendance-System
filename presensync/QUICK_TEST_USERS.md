# 🚀 Quick Test Users Setup

## Test Accounts

**Student Account:**
- Email: `student@gmail.com`
- Password: `student123`
- Role: Student
- Dashboard: `/student`

**Lecturer Account:**
- Email: `lecturer@gmail.com`
- Password: `lecturer123`
- Role: Lecturer
- Dashboard: `/lecturer`

## ⚡ Quick Setup (2 Steps)

### Step 1: Create Users in Supabase Auth

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/auth/users)
2. Click **"Add user"** → **"Create new user"**
3. Create **Student User**:
   - Email: `student@gmail.com`
   - Password: `student123`
   - ✅ **Auto Confirm User**: ON
   - Click **"Create user"**
4. Create **Lecturer User**:
   - Email: `lecturer@gmail.com`
   - Password: `lecturer123`
   - ✅ **Auto Confirm User**: ON
   - Click **"Create user"**

### Step 2: Run SQL Script

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/editor)
2. Open `create-test-users.sql` from your project
3. Copy and paste the SQL code
4. Click **"Run"** (or press Ctrl+Enter)
5. You should see a verification table showing both users ✅

## ✅ Test It!

1. Open http://localhost:5173
2. Click **"Login"**
3. Try logging in with:
   - `student@gmail.com` / `student123` → Should go to Student Dashboard
   - `lecturer@gmail.com` / `lecturer123` → Should go to Lecturer Dashboard

## 🐛 Troubleshooting

### "User not found" error
- Make sure you created the users in Step 1 first
- Check that "Auto Confirm User" was ON

### "Profile fetch failed" warning
- Run the SQL script again (Step 2)
- The app will still work using session metadata as fallback

### Can't login / redirects to landing page
- Check browser console (F12) for errors
- Verify the SQL script ran successfully
- Make sure the frontend is running on http://localhost:5173

## 📝 Notes

- These are test accounts for frontend development
- The SQL script is idempotent (safe to run multiple times)
- If users already exist, it will update their profiles

---

**Ready to test!** 🎉

