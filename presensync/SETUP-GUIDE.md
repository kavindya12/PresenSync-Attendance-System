# PresenSync Setup Guide

## 🔍 Step-by-Step Configuration Check

### 1. Check Supabase Configuration

#### Option A: If you already have a Supabase project

1. **Go to your Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (or create a new one)
3. **Get your Project Settings**:
   - Click on the ⚙️ **Settings** icon (bottom left)
   - Go to **API** section
   - You'll find:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

4. **Get Database Connection String**:
   - Go to **Settings** → **Database**
   - Find **Connection string** → **URI**
   - Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

#### Option B: Create a new Supabase project (FREE)

1. **Sign up/Login**: https://supabase.com
2. **Create New Project**:
   - Click "New Project"
   - Choose organization
   - Enter project name (e.g., "presensync")
   - Enter database password (SAVE THIS!)
   - Choose region closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get your credentials** (same as Option A, step 3-4)

### 2. Update Backend .env File

Open `presensync/backend/.env` and update these values:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database (from Supabase Database → Connection string → URI)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Supabase (from Supabase Settings → API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon/public key)

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-to-random-string

# Optional: Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@presensync.com
EMAIL_ENABLED=false

# Optional: Twilio (for SMS notifications)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 3. Update Frontend .env File

Open `presensync/.env` and update:

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Supabase (same as backend)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon/public key)
```

### 4. Setup Supabase Database Schema

After configuring Supabase, you need to run the SQL schema:

1. **Go to Supabase Dashboard** → Your Project
2. **Click on SQL Editor** (left sidebar)
3. **Click "New Query"**
4. **Copy and paste** the contents of `presensync/supabase_setup.sql`
5. **Click "Run"** (or press Ctrl+Enter)
6. **Verify tables were created**:
   - Go to **Table Editor** (left sidebar)
   - You should see: `profiles`, `courses`, `course_enrollments`, `classes`, `attendance_records`, `leaves`

### 5. Generate Prisma Client

After setting up the database:

```bash
cd presensync/backend
npx prisma generate
```

### 6. Verify Configuration

Run the configuration checker:

```bash
cd presensync
node check-config.js
```

### 7. Start the Servers

```bash
# Option 1: Use the startup script
.\start-servers.ps1

# Option 2: Manual start
# Terminal 1 - Backend:
cd presensync/backend
npm run dev

# Terminal 2 - Frontend:
cd presensync
npm run dev
```

## 🔑 Quick Reference: Where to Find Supabase Credentials

### Project URL & API Key:
1. Supabase Dashboard → Your Project
2. Settings ⚙️ (bottom left)
3. **API** tab
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY` / `VITE_SUPABASE_ANON_KEY`

### Database Connection String:
1. Supabase Dashboard → Your Project
2. Settings ⚙️
3. **Database** tab
4. Scroll to **Connection string**
5. Select **URI** tab
6. Copy the connection string → `DATABASE_URL`
   - Replace `[YOUR-PASSWORD]` with your actual database password

## ✅ Checklist

- [ ] Supabase project created
- [ ] Backend `.env` file configured with:
  - [ ] DATABASE_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_KEY
  - [ ] JWT_SECRET
  - [ ] JWT_REFRESH_SECRET
- [ ] Frontend `.env` file configured with:
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
- [ ] Database schema executed in Supabase SQL Editor
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Configuration verified (`node check-config.js`)
- [ ] Servers started successfully

## 🆘 Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if password in connection string matches your Supabase database password
- Ensure Supabase project is active (not paused)

### Supabase Auth Errors
- Verify `SUPABASE_URL` and `SUPABASE_KEY` match your project
- Check that you're using the **anon/public** key, not the service_role key
- Ensure RLS (Row Level Security) policies are set up (run `supabase_setup.sql`)

### Port Already in Use
- Change `PORT` in backend `.env` to a different port (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` to match

