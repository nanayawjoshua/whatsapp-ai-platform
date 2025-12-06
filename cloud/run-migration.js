/**
 * Simple migration runner
 * Reads SQL file and executes it against PostgreSQL
 */

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

async function runMigration() {
  console.log('🔄 Starting database migration...\n');

  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in environment variables');
    console.error('   Make sure you have a .env file with DATABASE_URL set');
    process.exit(1);
  }

  // Create connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '003_add_enterprise_support.sql');
    console.log(`📄 Reading migration file: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('🔨 Executing migration...\n');
    await pool.query(sql);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Enterprise support added:');
    console.log('   - enterprise_accounts table');
    console.log('   - enterprise_users table');
    console.log('   - enterprise_analytics table');
    console.log('   - vendors table updated with account_type and enterprise fields');
    console.log('   - Pricing calculation functions');
    console.log('   - Auto-update triggers');
    console.log('\n🎉 Enterprise support is ready!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
