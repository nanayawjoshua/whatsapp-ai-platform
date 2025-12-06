/**
 * Check vendor sessions in database
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

async function checkSessions() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('📊 Recent Vendor Sessions:\n');

    const result = await pool.query(`
      SELECT
        vs.vendor_id,
        vs.status,
        vs.created_at,
        vs.last_active,
        v.name,
        v.account_type,
        v.subscription_status
      FROM vendor_sessions vs
      LEFT JOIN vendors v ON vs.vendor_id = v.vendor_id
      ORDER BY vs.created_at DESC
      LIMIT 15
    `);

    if (result.rows.length === 0) {
      console.log('No sessions found.\n');
    } else {
      console.table(result.rows);

      // Summary
      const statusCounts = {};
      result.rows.forEach(row => {
        statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
      });

      console.log('\n📈 Status Summary:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSessions();
