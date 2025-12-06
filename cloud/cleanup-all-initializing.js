/**
 * Clean up ALL initializing sessions (for testing)
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
    console.log('🧹 Cleaning up ALL initializing sessions...\n');

    // Find all sessions stuck in initializing status
    const findResult = await pool.query(`
      SELECT vendor_id, status, created_at
      FROM vendor_sessions
      WHERE status = 'initializing'
      ORDER BY created_at DESC
    `);

    if (findResult.rows.length === 0) {
      console.log('✅ No initializing sessions found.\n');
      return;
    }

    console.log(`Found ${findResult.rows.length} initializing session(s):`);
    console.table(findResult.rows);

    // Delete them
    const deleteResult = await pool.query(`
      DELETE FROM vendor_sessions
      WHERE status = 'initializing'
    `);

    console.log(`\n✅ Deleted ${deleteResult.rowCount} session(s)`);
    console.log('   Bridge server should now start cleanly.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanup();
