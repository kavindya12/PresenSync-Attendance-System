import 'dotenv/config';
import { prisma } from './src/config/database.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('Can\'t reach database server')) {
      console.error('\nPossible issues:');
      console.error('1. Database password might be incorrect');
      console.error('2. Database might not be set up yet');
      console.error('3. Network/firewall issues');
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

