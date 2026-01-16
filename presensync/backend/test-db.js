import { PrismaClient } from '@prisma/client';
import { supabaseClient } from './src/config/supabaseClient.js';
import 'dotenv/config';

const prisma = new PrismaClient();

async function testDatabase() {
    console.log('🔍 Testing Database Connection...\n');
    
    // Test 1: Check environment variables
    console.log('1️⃣ Environment Variables:');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✅ Set' : '❌ Not set');
    console.log('');

    // Test 2: Test Prisma connection
    console.log('2️⃣ Testing Prisma Connection:');
    try {
        await prisma.$connect();
        console.log('   ✅ Prisma connected successfully');
        
        // Try a simple query
        const userCount = await prisma.user.count();
        console.log(`   📊 Total users in database: ${userCount}`);
        
        // Check if profiles table exists and has data
        try {
            const profileCount = await prisma.$queryRaw`SELECT COUNT(*) FROM profiles`;
            console.log(`   📊 Total profiles: ${profileCount[0].count}`);
        } catch (e) {
            console.log('   ⚠️  Could not query profiles table directly');
        }
    } catch (error) {
        console.log('   ❌ Prisma connection failed:', error.message);
    }
    console.log('');

    // Test 3: Test Supabase Auth
    console.log('3️⃣ Testing Supabase Auth:');
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        console.log('   ✅ Supabase Auth API is accessible');
    } catch (error) {
        console.log('   ❌ Supabase Auth error:', error.message);
    }
    console.log('');

    // Test 4: Test Supabase Database (using Supabase client)
    console.log('4️⃣ Testing Supabase Database Access:');
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log('   ✅ Supabase database is accessible');
        console.log(`   📊 Can query profiles table`);
    } catch (error) {
        console.log('   ❌ Supabase database error:', error.message);
    }
    console.log('');

    // Test 5: List all tables
    console.log('5️⃣ Available Tables:');
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        console.log('   ✅ Tables in database:');
        tables.forEach(table => {
            console.log(`      - ${table.table_name}`);
        });
    } catch (error) {
        console.log('   ❌ Could not list tables:', error.message);
    }
    console.log('');

    // Test 6: Check recent activity
    console.log('6️⃣ Recent Database Activity:');
    try {
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        
        if (recentUsers.length > 0) {
            console.log(`   ✅ Found ${recentUsers.length} recent users:`);
            recentUsers.forEach(user => {
                console.log(`      - ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
            });
        } else {
            console.log('   ℹ️  No users found in database');
        }
    } catch (error) {
        console.log('   ❌ Could not query users:', error.message);
    }
    console.log('');

    // Cleanup
    await prisma.$disconnect();
    console.log('✅ Database test completed!\n');
}

testDatabase().catch(console.error);
