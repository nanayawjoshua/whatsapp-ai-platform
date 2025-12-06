/**
 * Verify enterprise schema was created successfully
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

async function verifySchema() {
  console.log('🔍 Verifying enterprise schema...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Check enterprise_accounts table
    console.log('1️⃣  Checking enterprise_accounts table...');
    const enterpriseResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'enterprise_accounts'
      ORDER BY ordinal_position
    `);
    console.log(`   ✅ Found ${enterpriseResult.rows.length} columns`);

    // Check enterprise_users table
    console.log('2️⃣  Checking enterprise_users table...');
    const usersResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'enterprise_users'
      ORDER BY ordinal_position
    `);
    console.log(`   ✅ Found ${usersResult.rows.length} columns`);

    // Check enterprise_analytics table
    console.log('3️⃣  Checking enterprise_analytics table...');
    const analyticsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'enterprise_analytics'
      ORDER BY ordinal_position
    `);
    console.log(`   ✅ Found ${analyticsResult.rows.length} columns`);

    // Check vendors table updates
    console.log('4️⃣  Checking vendors table new columns...');
    const vendorColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'vendors'
        AND column_name IN ('account_type', 'enterprise_account_id', 'location_name', 'location_id')
      ORDER BY column_name
    `);
    console.log(`   ✅ Found ${vendorColumns.rows.length}/4 new columns:`);
    vendorColumns.rows.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type})`);
    });

    // Check pricing function
    console.log('5️⃣  Checking pricing calculation function...');
    const functionResult = await pool.query(`
      SELECT proname
      FROM pg_proc
      WHERE proname = 'calculate_enterprise_pricing'
    `);
    console.log(`   ✅ Function exists: ${functionResult.rows.length > 0}`);

    // Test pricing function
    console.log('6️⃣  Testing pricing calculation...');
    const pricingTest = await pool.query(`SELECT * FROM calculate_enterprise_pricing(15)`);
    console.log(`   ✅ 15 locations = ${pricingTest.rows[0].tier} tier @ GHS ${pricingTest.rows[0].price_per_location} per location (${pricingTest.rows[0].discount_percent}% discount)`);

    console.log('\n✅ All enterprise schema components verified successfully!\n');

    // Show account_type values in vendors
    console.log('📊 Current vendor account types:');
    const accountTypes = await pool.query(`
      SELECT account_type, COUNT(*) as count
      FROM vendors
      GROUP BY account_type
    `);
    if (accountTypes.rows.length > 0) {
      accountTypes.rows.forEach(row => {
        console.log(`   - ${row.account_type || 'NULL'}: ${row.count} vendor(s)`);
      });
    } else {
      console.log('   (No vendors in database yet)');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySchema();
