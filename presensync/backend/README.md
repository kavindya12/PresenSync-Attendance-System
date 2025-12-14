# PresenSync Backend

Node.js + Express.js backend for PresenSync attendance management system.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `JWT_REFRESH_SECRET` - Secret key for refresh tokens
   - `FRONTEND_URL` - Frontend application URL (default: http://localhost:5173)

   Optional (for OAuth):
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`

   Optional (for notifications):
   - Email: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
   - SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

3. **Setup Database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Open Prisma Studio to view data
   npm run prisma:studio
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000` (or PORT from .env)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/microsoft` - Microsoft OAuth
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get own profile
- `PUT /api/users/me` - Update own profile
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - Get user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course
- `POST /api/courses` - Create course (Lecturer/Admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll students
- `GET /api/courses/:id/students` - Get enrolled students

### Classes
- `GET /api/classes` - List classes
- `GET /api/classes/:id` - Get class
- `POST /api/classes` - Create class (Lecturer/Admin)
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/generate-qr` - Generate QR code
- `GET /api/classes/:id/qr` - Get QR code

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `PUT /api/attendance/:id` - Update attendance (Lecturer/Admin)
- `GET /api/attendance/stats` - Get statistics

### Leaves
- `POST /api/leaves` - Create leave request (Student)
- `GET /api/leaves` - List leave requests
- `GET /api/leaves/:id` - Get leave request
- `PUT /api/leaves/:id/approve` - Approve leave (Lecturer/Admin)
- `PUT /api/leaves/:id/reject` - Reject leave
- `DELETE /api/leaves/:id` - Cancel leave (Student)

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Reports
- `GET /api/reports/attendance/pdf` - Generate PDF report
- `GET /api/reports/attendance/excel` - Generate Excel report
- `GET /api/reports/analytics` - Get analytics data

## Real-time Features

Socket.io is used for real-time updates:
- `attendance:marked` - Emitted when attendance is marked
- `attendance:updated` - Emitted when attendance is updated
- `notification:new` - Emitted when new notification is created

## Scheduled Tasks

- Class reminders: Sent 30 minutes before class starts
- Attendance threshold alerts: Checked daily at 9 AM

