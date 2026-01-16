// Test script to check server startup
import 'dotenv/config';
import express from 'express';

console.log('=== Testing Server Startup ===');
console.log('PORT:', process.env.PORT || 5000);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);

try {
  console.log('\n1. Testing Express...');
  const app = express();
  console.log('✓ Express loaded');
  
  console.log('\n2. Testing Prisma import...');
  const prisma = await import('./src/config/database.js');
  console.log('✓ Prisma imported');
  
  console.log('\n3. Testing server file import...');
  await import('./src/server.js');
  console.log('✓ Server file imported');
  
} catch (error) {
  console.error('\n✗ ERROR:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

