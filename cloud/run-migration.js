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

    // Check if we should delete vendor instead
    if (process.argv[2] === 'delete-vendor') {
      const vendorId = process.argv[3];
      if (!vendorId) {
        console.error('❌ Please provide vendorId: node run-migration.js delete-vendor <vendorId>');
        process.exit(1);
      }

      console.log(`🗑️  Deleting vendor ${vendorId}...\n`);

      // Delete in correct order (foreign keys)
      await pool.query('DELETE FROM messages WHERE conversation_id LIKE $1', [`${vendorId}:%`]);
      await pool.query('DELETE FROM conversations WHERE vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM products WHERE vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM vendor_personas WHERE vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM analytics_events WHERE vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM referral_rewards WHERE referrer_vendor_id = $1 OR referred_vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM vendor_sessions WHERE vendor_id = $1', [vendorId]);
      await pool.query('DELETE FROM vendors WHERE vendor_id = $1', [vendorId]);

      console.log('✅ Vendor deleted successfully!\n');
      return;
    }

    // Run all migrations in order
    const migrations = [
      '001_initial_schema.sql',
      '002_add_vendor_settings.sql',
      '003_add_enterprise_support.sql',
      '004_add_vendor_auth.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      console.log(`📄 Reading migration file: ${migrationPath}`);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute the whole migration file
      console.log(`🔨 Executing ${migrationFile}...\n`);
      try {
        await pool.query(sql);
        console.log(`✅ ${migrationFile} completed!\n`);
      } catch (error) {
        if (error.code === '42P07' || error.message.includes('already exists')) {
          console.log(`⚠️  Skipping ${migrationFile} - already applied\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
