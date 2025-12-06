/**
 * Clean up incomplete test sessions
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

async function cleanup() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🧹 Cleaning up incomplete test sessions...\n');

    // Find sessions stuck in initializing status
    const findResult = await pool.query(`
      SELECT vendor_id, status, created_at
      FROM vendor_sessions
      WHERE status = 'initializing'
        AND created_at < NOW() - INTERVAL '1 hour'
    `);

    if (findResult.rows.length === 0) {
      console.log('✅ No stale sessions found.\n');
      return;
    }

    console.log(`Found ${findResult.rows.length} stale session(s):`);
    console.table(findResult.rows);

    // Delete them
    const deleteResult = await pool.query(`
      DELETE FROM vendor_sessions
      WHERE status = 'initializing'
        AND created_at < NOW() - INTERVAL '1 hour'
    `);

    console.log(`\n✅ Deleted ${deleteResult.rowCount} stale session(s)`);
    console.log('   (Vendors can generate new QR codes to reconnect)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanup();
