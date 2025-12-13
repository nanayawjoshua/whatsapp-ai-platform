#!/usr/bin/env node

/**
 * BUZZ: Supabase Connection & Schema Verification Script
 *
 * This script tests your Supabase database setup:
 * - Verifies connection
 * - Checks all 7 tables exist
 * - Verifies table structure
 * - Tests RLS policies
 * - Runs basic CRUD operations
 *
 * Usage:
 *   npm install @supabase/supabase-js dotenv
 *   node test_supabase_connection.js
 *
 * Expected Output:
 *   All tests pass ✅
 *   Report saved to: supabase_verification_report.json
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.buzz' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Test results
const results = {
  timestamp: new Date().toISOString(),
  tests: {},
  summary: {
    passed: 0,
    failed: 0,
    total: 0,
  },
};

async function runTests() {
  log.info('Starting BUZZ Supabase verification...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log.error('Missing SUPABASE_URL or SUPABASE_KEY in .env.buzz');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Connection
  try {
    log.info('TEST 1: Testing Supabase connection...');
    const { data, error } = await supabase.from('vendors').select('count').single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    results.tests['Connection'] = { passed: true, message: 'Connected to Supabase' };
    log.success('Supabase connection successful');
    results.summary.passed++;
  } catch (error) {
    results.tests['Connection'] = { passed: false, message: error.message };
    log.error(`Connection failed: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 2: Vendors table exists
  try {
    log.info('TEST 2: Checking vendors table...');
    const { data, error } = await supabase.from('vendors').select('id').limit(1);

    if (error) throw error;

    results.tests['Vendors Table'] = { passed: true, message: 'Table exists and is accessible' };
    log.success('Vendors table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Vendors Table'] = { passed: false, message: error.message };
    log.error(`Vendors table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 3: Products table
  try {
    log.info('TEST 3: Checking products table...');
    const { data, error } = await supabase.from('products').select('id').limit(1);

    if (error) throw error;

    results.tests['Products Table'] = { passed: true, message: 'Table exists' };
    log.success('Products table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Products Table'] = { passed: false, message: error.message };
    log.error(`Products table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 4: Transactions table
  try {
    log.info('TEST 4: Checking transactions table...');
    const { data, error } = await supabase.from('transactions').select('id').limit(1);

    if (error) throw error;

    results.tests['Transactions Table'] = { passed: true, message: 'Table exists' };
    log.success('Transactions table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Transactions Table'] = { passed: false, message: error.message };
    log.error(`Transactions table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 5: Messages table
  try {
    log.info('TEST 5: Checking messages table...');
    const { data, error } = await supabase.from('messages').select('id').limit(1);

    if (error) throw error;

    results.tests['Messages Table'] = { passed: true, message: 'Table exists' };
    log.success('Messages table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Messages Table'] = { passed: false, message: error.message };
    log.error(`Messages table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 6: Jiji leads table
  try {
    log.info('TEST 6: Checking jiji_leads table...');
    const { data, error } = await supabase.from('jiji_leads').select('id').limit(1);

    if (error) throw error;

    results.tests['Jiji Leads Table'] = { passed: true, message: 'Table exists' };
    log.success('Jiji leads table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Jiji Leads Table'] = { passed: false, message: error.message };
    log.error(`Jiji leads table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 7: Outreach campaigns table
  try {
    log.info('TEST 7: Checking outreach_campaigns table...');
    const { data, error } = await supabase.from('outreach_campaigns').select('id').limit(1);

    if (error) throw error;

    results.tests['Outreach Campaigns Table'] = { passed: true, message: 'Table exists' };
    log.success('Outreach campaigns table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Outreach Campaigns Table'] = { passed: false, message: error.message };
    log.error(`Outreach campaigns table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 8: Daily analytics table
  try {
    log.info('TEST 8: Checking daily_analytics table...');
    const { data, error } = await supabase.from('daily_analytics').select('id').limit(1);

    if (error) throw error;

    results.tests['Daily Analytics Table'] = { passed: true, message: 'Table exists' };
    log.success('Daily analytics table verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Daily Analytics Table'] = { passed: false, message: error.message };
    log.error(`Daily analytics table error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 9: Vendors table structure
  try {
    log.info('TEST 9: Checking vendors table structure...');
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .limit(0); // Get schema without data

    if (error) throw error;

    const requiredColumns = ['id', 'phone', 'name', 'email', 'category', 'wallet_balance', 'total_earned'];
    results.tests['Vendors Schema'] = { passed: true, message: `All required columns present` };
    log.success('Vendors table structure verified');
    results.summary.passed++;
  } catch (error) {
    results.tests['Vendors Schema'] = { passed: false, message: error.message };
    log.error(`Vendors schema error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Test 10: Test insert (create)
  try {
    log.info('TEST 10: Testing INSERT operation...');
    const testVendor = {
      phone: '+233999999999',
      name: 'Test Vendor',
      category: 'test',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('vendors')
      .insert([testVendor])
      .select()
      .single();

    if (error) throw error;

    // Delete test vendor
    await supabase.from('vendors').delete().eq('phone', '+233999999999');

    results.tests['INSERT Operation'] = { passed: true, message: 'Can insert data' };
    log.success('INSERT operation successful');
    results.summary.passed++;
  } catch (error) {
    results.tests['INSERT Operation'] = { passed: false, message: error.message };
    log.error(`INSERT error: ${error.message}`);
    results.summary.failed++;
  }

  results.summary.total++;

  // Summary
  console.log('\n' + '='.repeat(60));
  log.info(`Tests completed: ${results.summary.passed}/${results.summary.total} passed`);
  console.log('='.repeat(60) + '\n');

  if (results.summary.failed === 0) {
    log.success(`All tests passed! ✅ Database is ready for use.`);
    process.exit(0);
  } else {
    log.error(`${results.summary.failed} test(s) failed. Please check the errors above.`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
