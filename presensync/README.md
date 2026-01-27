# PresenSync

A comprehensive attendance management system for educational institutions, featuring QR code-based attendance with multiple generation modes, caching, and batch processing capabilities.

## Features

- **QR Code Attendance**: Multiple methods for marking attendance via QR codes
  - Camera scanning for quick attendance marking
  - Manual QR code entry for students who can't scan
  - Time-limited QR codes with automatic expiry
- **Advanced QR Generation**: 
  - **Server Mode**: Secure, validated QR code generation via Supabase Edge Functions
  - **Quick Generate**: Instant client-side generation for testing and demos
  - **Batch Generation**: Generate multiple QR codes simultaneously for recurring classes
  - **Smart Caching**: Automatic caching of generated QR codes for faster retrieval
- **Role-Based Access**: Separate dashboards for students, lecturers, and administrators
- **Real-Time Tracking**: Live attendance monitoring and statistics
- **Course Management**: Complete course creation, editing, and enrollment system
- **Analytics & Reports**: Comprehensive reporting with interactive charts and visualizations
- **Secure Authentication**: Supabase-based authentication with Row Level Security (RLS)
- **Facial Recognition**: Alternative attendance method with class ID verification

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Authentication)
- **QR Code Libraries**: 
  - `qrcode` (Deno) - Server-side generation in Edge Functions
  - `react-qr-code` - Client-side QR code rendering
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Supabase CLI (for Edge Functions deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd presensync
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Set up the database:
   - Open Supabase Dashboard → SQL Editor
   - Run `supabase_qr_attendance_schema.sql` to create tables and RLS policies

5. Deploy Edge Functions:
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy generate-qr
supabase functions deploy validate-qr
supabase functions deploy mark-attendance
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
presensync/
├── src/
│   ├── components/      # Reusable React components
│   │   └── features/    # Feature-specific components
│   │       ├── QRGenerationModal.jsx  # QR generation with multiple modes
│   │       ├── QRGenerator.jsx        # QR code display component
│   │       └── QRScanner.jsx         # QR code scanner
│   ├── pages/           # Page components (dashboards, auth)
│   ├── context/         # React context providers
│   ├── api/             # API clients and endpoints
│   │   └── supabaseFunctions.js  # Supabase Edge Functions client
│   └── utils/           # Utility functions
│       ├── qrUtils.js   # QR caching, quick generate, batch processing
│       └── socket.js    # WebSocket utilities
├── supabase/
│   └── functions/       # Supabase Edge Functions
│       ├── generate-qr/     # Optimized QR code generation
│       ├── validate-qr/    # QR token validation
│       └── mark-attendance/ # Attendance marking
├── supabase_qr_attendance_schema.sql  # Database schema
└── README.md
```

## User Roles

### Student
- View enrolled courses
- Mark attendance via QR code (scan or manual entry)
- Use facial recognition as alternative method
- View attendance statistics and streaks
- Submit leave requests

### Lecturer
- Create and manage classes
- Generate QR codes with multiple modes:
  - **Server Mode**: Production-ready with validation
  - **Quick Generate**: Instant testing mode
  - **Batch Generation**: Generate for multiple classes
- View class attendance statistics
- Manage student enrollments
- Configure QR code expiry settings

### Administrator
- Manage users, courses, and classes
- View system-wide analytics and reports
- Configure system settings
- Access comprehensive reporting dashboards with interactive charts

## Attendance Methods

### QR Code (Primary Method)

**Scanning Mode:**
- Students use their device camera to scan QR codes
- Automatic validation and attendance marking
- Real-time feedback on success/failure

**Manual Entry Mode:**
- Students can manually enter QR code digits or paste QR code URLs
- Useful when camera is unavailable or QR code is displayed on screen
- Same validation flow as scanning

### Facial Recognition
- Alternative attendance method
- Requires class ID verification
- Uses device camera for face recognition

## QR Code Generation

### Server Mode (Production)
- Secure server-side generation via Supabase Edge Functions
- Validates lecturer permissions
- Creates database session records
- Optimized for performance (200px images, low error correction)
- Automatic caching for repeated requests
- **Use for**: Production classes, real attendance tracking

### Quick Generate Mode (Testing)
- Instant client-side QR code generation
- No server validation required
- Perfect for demos and testing
- Warning indicator on generated QR codes
- **Use for**: Testing, demonstrations, offline scenarios

### Batch Generation
- Generate QR codes for multiple classes simultaneously
- Progress tracking with visual progress bar
- Automatic cache utilization
- Results summary (successful, cached, failed)
- **Use for**: Recurring classes, weekly schedules

### QR Code Caching
- Automatic caching of generated QR codes
- 24-hour cache expiry
- Cache key based on class_id, start_time, and location
- Instant retrieval for repeated QR codes
- Automatic cleanup of expired entries

## Performance Optimizations

### Edge Function Optimizations
- Reduced QR image size: 300px → 200px (33% smaller)
- Lower error correction level: M → L (faster generation)
- Reduced margins for smaller file sizes
- **Result**: ~40% faster QR code generation

### Caching System
- localStorage-based caching
- Automatic cache lookup before server calls
- Reduces server load and improves response times
- Cache indicators in UI

### Batch Processing
- Parallel processing with rate limiting
- Progress tracking for user feedback
- Error handling per item
- Efficient resource utilization

## Database Schema

The system uses the following main tables:
- `profiles` - User profile information
- `courses` - Course details
- `classes` - Individual class sessions
- `class_sessions` - QR code session tokens with expiry
- `attendance` - QR-based attendance records
- `attendance_records` - General attendance records
- `course_enrollments` - Student course enrollments

See `supabase_qr_attendance_schema.sql` for complete schema and RLS policies.

## Security

- **Row Level Security (RLS)**: Policies enforce data access control at the database level
- **Edge Functions**: Validate user permissions before QR generation
- **Authentication**: Handled by Supabase Auth with JWT tokens
- **QR Token Validation**: Time-limited tokens with automatic expiry
- **Lecturer Verification**: Only authorized lecturers can generate QR codes for their classes

## Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Clearing QR Cache

If you need to clear cached QR codes during development:

```javascript
import { clearAllQRCache } from './src/utils/qrUtils';
clearAllQRCache();
```

Or manually clear localStorage entries starting with `qr_cache_`

## Troubleshooting

### QR Code Not Generating

**Server Mode:**
- Verify lecturer has proper permissions
- Check Edge Function logs in Supabase Dashboard
- Ensure class_id exists in database and has valid course_id
- Verify Supabase environment variables are set correctly

**Quick Generate Mode:**
- Works without server connection
- Use for testing when server validation fails
- Note: Quick-generated QR codes won't work for actual attendance

### Attendance Not Marking

- Verify QR token is valid and not expired
- Check student authentication status
- Review RLS policies for attendance table
- Ensure QR code was generated in Server Mode (not Quick Generate)
- For manual entry, verify the QR code digits/URL are correct

### Caching Issues

- Clear browser localStorage if cached QR codes are outdated
- Check cache expiry (24 hours default)
- Verify cache keys match current class parameters

### Authentication Issues

- Verify Supabase credentials in `.env`
- Check Supabase project settings
- Review authentication policies
- Ensure user roles are correctly set in profiles table

### Batch Generation Errors

- Verify all classes have valid class_ids
- Check network connectivity
- Review individual error messages in batch results
- Some classes may succeed while others fail

## API Reference

### QR Generation Functions

**Server Generation:**
```javascript
import { generateQRCode } from './api/supabaseFunctions';

const result = await generateQRCode({
  class_id: 'uuid',
  expiry_minutes: 30,
  location: 'Room 201',
  module_name: 'CS101',
  start_time: '2024-01-01T10:00:00Z',
  end_time: '2024-01-01T11:30:00Z',
  duration_minutes: 90
});
```

**Quick Generate:**
```javascript
import { quickGenerateQR } from './utils/qrUtils';

const qrData = quickGenerateQR(params);
```

**Batch Generation:**
```javascript
import { batchGenerateQR } from './utils/qrUtils';

const results = await batchGenerateQR(classes, generateFunction, onProgress);
```

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.

## Changelog

### Recent Updates
- ✅ Optimized Edge Function for faster QR generation (~40% improvement)
- ✅ Added Quick Generate mode for instant client-side generation
- ✅ Implemented QR code caching system (24-hour expiry)
- ✅ Created batch generation feature for multiple classes
- ✅ Added manual QR code entry option for students
- ✅ Removed NFC and Beacon methods (simplified to QR and Facial Recognition)
- ✅ Enhanced QR generation modal with mode selection
- ✅ Added cache indicators and progress tracking
