# Supabase Setup Guide

Follow these steps to configure Supabase for PresenSync:

## Step 1: Access Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one if you don't have one)

## Step 2: Get Your Supabase Credentials

### A. Project URL and API Keys

1. In your Supabase dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** - Copy this (starts with `eyJ...`)
   - **service_role key** - Copy this (starts with `eyJ...`) - Keep this secret!

### B. Database Connection String

1. Still in Settings, click on **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't know your password, click **Reset database password** to set a new one

## Step 3: Update Your Environment Files

### Backend `.env` file (`presensync/backend/.env`)

Add or update these variables:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key-here

# Database Connection (for Prisma)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Other required variables
PORT=5000
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-secret-key-here
FRONTEND_URL=http://localhost:5173

# Optional: Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@presensync.com
EMAIL_ENABLED=false

# Optional: Twilio SMS (if you want SMS notifications)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Frontend `.env` file (`presensync/.env`)

Add or update these variables:

```env
# Supabase Configuration (use ANON key, not service role!)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Run Database Migrations

After setting up your `.env` files:

1. **Generate Prisma Client**:
   ```bash
   cd presensync/backend
   npm run prisma:generate
   ```

2. **Run migrations** (if you have any):
   ```bash
   npm run prisma:migrate
   ```

3. **Or set up the database schema manually**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the contents of `supabase_setup.sql`
   - Click "Run" to execute

## Step 5: Verify Connection

Test if everything is working:

1. Start the backend server:
   ```bash
   cd presensync/backend
   npm run dev
   ```

2. You should see:
   - ✅ `🚀 Server running on port 5000`
   - ✅ `📡 Socket.io server initialized`
   - ✅ `Scheduled tasks initialized`
   - ❌ NO database connection errors!

## Quick Checklist

- [ ] Supabase project created/accessed
- [ ] Project URL copied
- [ ] Anon key copied (for frontend)
- [ ] Service role key copied (for backend)
- [ ] Database password known/reset
- [ ] Database connection string copied and password added
- [ ] Backend `.env` file updated
- [ ] Frontend `.env` file updated
- [ ] Prisma client generated
- [ ] Database schema set up (via SQL Editor or migrations)
- [ ] Server starts without database errors

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files to Git (they should be in `.gitignore`)
- Use **anon key** in frontend (public, safe for client-side)
- Use **service_role key** in backend (secret, server-side only)
- Keep your database password secure

## Need Help?

If you encounter issues:
1. Check that your Supabase project is active (not paused)
2. Verify your database password is correct in the connection string
3. Make sure your IP is allowed (Supabase allows all IPs by default)
4. Check Supabase logs in the dashboard for any errors

