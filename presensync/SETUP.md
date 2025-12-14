# PresenSync Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd presensync/backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` file with the following:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://username:password@localhost:5432/presensync?schema=public"

# JWT Secrets (REQUIRED - Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# OAuth (Optional - for Google/Microsoft login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@presensync.com
EMAIL_ENABLED=false

# SMS (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 3. Setup Database

```bash
cd presensync/backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Backend Server

```bash
cd presensync/backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Frontend Setup

```bash
cd presensync
npm install
```

Create `presensync/.env` file (optional, defaults to localhost:5000):

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start Frontend

```bash
cd presensync
npm run dev
```

Frontend will run on `http://localhost:5173`

## Database Setup

### PostgreSQL Installation

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a new database:
   ```sql
   CREATE DATABASE presensync;
   ```
3. Update `DATABASE_URL` in `backend/.env` with your credentials

### Alternative: Use Docker

```bash
docker run --name presensync-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=presensync -p 5432:5432 -d postgres
```

Then use: `DATABASE_URL="postgresql://postgres:password@localhost:5432/presensync?schema=public"`

## OAuth Setup (Optional)

### Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

### Microsoft OAuth

1. Go to https://portal.azure.com/
2. Register a new application
3. Add redirect URI: `http://localhost:5000/api/auth/microsoft/callback`
4. Copy Application (client) ID and Secret to `.env`

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

### Port Already in Use
- Change PORT in backend/.env
- Update FRONTEND_URL if backend port changes

### CORS Errors
- Ensure FRONTEND_URL in backend/.env matches your frontend URL
- Check both servers are running

## Next Steps

1. Register your first admin user
2. Create courses and enroll students
3. Generate QR codes for classes
4. Test attendance marking

For more details, see [README.md](README.md)

