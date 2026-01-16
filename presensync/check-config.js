// Configuration Checker Script
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n========================================');
console.log('🔍 PresenSync Configuration Checker');
console.log('========================================\n');

// Check backend .env
const backendEnvPath = join(__dirname, 'backend', '.env');
const frontendEnvPath = join(__dirname, '.env');

console.log('📁 Checking Environment Files:');
console.log(`   Backend .env: ${existsSync(backendEnvPath) ? '✅ Found' : '❌ Missing'}`);
console.log(`   Frontend .env: ${existsSync(frontendEnvPath) ? '✅ Found' : '❌ Missing'}\n`);

// Helper function to mask sensitive values
function maskValue(value, showLength = false) {
  if (!value) return '❌ Not set';
  if (value.length > 20) {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    return showLength ? `${masked} (${value.length} chars)` : masked;
  }
  return value;
}

// Load backend env if exists
if (existsSync(backendEnvPath)) {
  const envContent = readFileSync(backendEnvPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
        envVars[key] = value;
      }
    }
  });

  console.log('🔧 Backend Configuration:');
  console.log(`   PORT: ${envVars.PORT || '❌ Not set (default: 5000)'}`);
  console.log(`   DATABASE_URL: ${envVars.DATABASE_URL ? '✅ ' + maskValue(envVars.DATABASE_URL) : '❌ Not set'}`);
  console.log(`   SUPABASE_URL: ${envVars.SUPABASE_URL ? '✅ ' + envVars.SUPABASE_URL : '❌ Not set'}`);
  console.log(`   SUPABASE_KEY: ${envVars.SUPABASE_KEY ? '✅ ' + maskValue(envVars.SUPABASE_KEY) : '❌ Not set'}`);
  console.log(`   JWT_SECRET: ${envVars.JWT_SECRET ? '✅ ' + maskValue(envVars.JWT_SECRET) : '❌ Not set'}`);
  console.log(`   JWT_REFRESH_SECRET: ${envVars.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Not set'}`);
  console.log(`   FRONTEND_URL: ${envVars.FRONTEND_URL || 'http://localhost:5173'}\n`);
}

// Check frontend env
if (existsSync(frontendEnvPath)) {
  const envContent = readFileSync(frontendEnvPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
        envVars[key] = value;
      }
    }
  });

  console.log('🎨 Frontend Configuration:');
  console.log(`   VITE_API_URL: ${envVars.VITE_API_URL || '❌ Not set (default: http://localhost:5000/api)'}`);
  console.log(`   VITE_SUPABASE_URL: ${envVars.VITE_SUPABASE_URL ? '✅ ' + envVars.VITE_SUPABASE_URL : '❌ Not set'}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${envVars.VITE_SUPABASE_ANON_KEY ? '✅ ' + maskValue(envVars.VITE_SUPABASE_ANON_KEY) : '❌ Not set'}\n`);
}

console.log('========================================\n');
console.log('📋 Next Steps:');
console.log('1. If any values are missing, check the .env files');
console.log('2. For Supabase setup, see instructions below');
console.log('3. Run this script again after updating .env files\n');

