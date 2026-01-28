# 🚀 Complete Test Users Setup Guide

## ⚠️ Important: You MUST Do Both Steps

**Step 1** (Required): Create users in Supabase Auth Dashboard  
**Step 2** (Required): Run SQL script to create profiles

You **CANNOT** create auth users via SQL - they must be created in the dashboard first.

---

## 📋 Step-by-Step Instructions

### Step 1: Create Users in Supabase Auth (REQUIRED)

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/auth/users
   - Or: Dashboard → Authentication → Users

2. **Create Student User:**
   - Click **"Add user"** button (top right)
   - Select **"Create new user"**
   - Fill in:
     - **Email:** `student@gmail.com`
     - **Password:** `student123`
     - ✅ **Auto Confirm User:** Turn this ON (important!)
   - Click **"Create user"**

3. **Create Lecturer User:**
   - Click **"Add user"** again
   - Select **"Create new user"**
   - Fill in:
     - **Email:** `lecturer@gmail.com`
     - **Password:** `lecturer123`
     - ✅ **Auto Confirm User:** Turn this ON (important!)
   - Click **"Create user"**

4. **Verify Users Created:**
   - You should see both users in the users list
   - Status should show as "Confirmed" (green checkmark)

---

### Step 2: Run SQL Script to Create Profiles (REQUIRED)

1. **Go to Supabase SQL Editor:**
   - URL: https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/editor
   - Or: Dashboard → SQL Editor

2. **Open the SQL Script:**
   - Open `create-test-users.sql` from your project folder
   - Copy ALL the SQL code

3. **Paste and Run:**
   - Paste into the SQL Editor
   - Click **"Run"** button (or press `Ctrl+Enter`)
   - You should see a verification table at the bottom showing:
     - ✅ `student@gmail.com` with role `student`
     - ✅ `lecturer@gmail.com` with role `lecturer`

---

## ✅ Verification

After completing both steps, verify everything works:

1. **Check Users in Auth:**
   - Go to Authentication → Users
   - Both users should be listed and confirmed

2. **Check Profiles in Database:**
   - Go to Table Editor → `profiles` table
   - You should see both users with correct roles

3. **Test Login:**
   - Go to http://localhost:5173/login
   - Try logging in with:
     - `student@gmail.com` / `student123` → Should redirect to `/student`
     - `lecturer@gmail.com` / `lecturer123` → Should redirect to `/lecturer`

---

## 🔄 If You Need to Update/Re-run

The SQL script is **idempotent** (safe to run multiple times):
- If profiles exist, it will UPDATE them
- If profiles don't exist, it will CREATE them
- You can run it again anytime to fix roles or update info

**To update a user's role:**
1. Just run the SQL script again
2. Or manually update in Table Editor → `profiles` table

---

## ❌ Common Issues

### "User not found" when logging in
- **Solution:** Make sure you completed Step 1 (create users in Auth Dashboard)
- Check that "Auto Confirm User" was ON

### "Profile fetch failed" warning
- **Solution:** Run Step 2 again (the SQL script)
- The app will still work using session metadata as fallback

### Users exist but wrong role
- **Solution:** Run the SQL script again - it will update the roles

### Can't see users in profiles table
- **Solution:** Make sure you ran the SQL script (Step 2)
- Check SQL Editor for any errors

---

## 📝 Quick Reference

**Test Accounts:**
- Student: `student@gmail.com` / `student123` → `/student` dashboard
- Lecturer: `lecturer@gmail.com` / `lecturer123` → `/lecturer` dashboard

**Required Steps:**
1. ✅ Create users in Auth Dashboard (can't skip this!)
2. ✅ Run SQL script to create profiles

**Files:**
- `create-test-users.sql` - SQL script for profiles
- `SETUP_TEST_USERS.md` - This guide

---

**That's it!** Once both steps are done, you can test the frontend login. 🎉

