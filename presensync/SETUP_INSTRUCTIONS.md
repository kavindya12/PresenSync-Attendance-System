# Quick Setup - Fill in Your Keys

## ✅ What You've Provided:
- **SUPABASE_URL**: `https://ymjgivaiodmgvfsgtgti.supabase.co` ✓
- **DATABASE_URL**: `postgresql://postgres:171002%40Ansaf@db.ymjgivaiodmgvfsgtgti.supabase.co:5432/postgres` ✓ (fixed format)

## ❌ What We Still Need:

### Step 1: Get Your API Keys from Supabase

1. Go to: https://supabase.com/dashboard/project/ymjgivaiodmgvfsgtgti/settings/api
2. In the **API keys** section, you'll see:

   **anon public** (for frontend):
   - Copy this key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - This is your **SUPABASE_CLIENT_API_KEY**

   **service_role** (for backend):
   - Copy this key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - This is your **SUPABASE_SERVICE_KEY**
   - ⚠️ Keep this secret!

### Step 2: Update Your .env Files

**Option A: Manual Update**

Edit `backend/.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-to-random-string
JWT_REFRESH_SECRET=change-this-to-random-string

SUPABASE_URL=https://ymjgivaiodmgvfsgtgti.supabase.co
SUPABASE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE

DATABASE_URL=postgresql://postgres:171002%40Ansaf@db.ymjgivaiodmgvfsgtgti.supabase.co:5432/postgres
```

Edit `.env` (frontend):
```env
VITE_SUPABASE_URL=https://ymjgivaiodmgvfsgtgti.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_PUBLIC_KEY_HERE

VITE_API_URL=http://localhost:5000/api
```

**Option B: Use the Script**

Run this command (replace with your actual keys):
```powershell
.\update-env.ps1 -ClientApiKey "your-anon-key-here" -ServiceKey "your-service-key-here"
```

### Step 3: Set Up Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open `supabase_setup.sql` from your project
4. Copy all the SQL code
5. Paste into SQL Editor
6. Click **Run** (or press F5)

### Step 4: Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### Step 5: Start the Servers

```bash
# Run the startup script
.\start-servers.ps1
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

## 🎯 Quick Checklist

- [ ] Got anon public key from Supabase
- [ ] Got service_role key from Supabase
- [ ] Updated `backend/.env` with service_role key
- [ ] Updated `.env` (frontend) with anon public key
- [ ] Ran database schema setup in Supabase SQL Editor
- [ ] Generated Prisma client (`npm run prisma:generate`)
- [ ] Started servers and verified no errors

## 📝 Once You Have the Keys

Just share them with me and I'll update the files automatically! Or run:
```powershell
.\update-env.ps1 -ClientApiKey "your-anon-key" -ServiceKey "your-service-key"
```

