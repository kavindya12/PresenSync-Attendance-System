import { PrismaClient } from '@prisma/client';
import { supabaseClient } from './supabaseClient.js';

// Initialize Prisma
export const prisma = new PrismaClient();

// Re-export Supabase
export { supabaseClient, supabaseClient as supabase };

export default prisma;
