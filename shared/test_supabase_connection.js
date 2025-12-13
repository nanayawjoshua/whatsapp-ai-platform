#!/usr/bin/env node

/**
 * SUPABASE CONNECTION TEST SCRIPT
 * Tests database connectivity and basic operations
 * Run with: node shared/test_supabase_connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.buzz') });

console.log('🧪 Beeline Supabase Connection Test');
console.log('=====================================');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log('');

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Environment Check:');
console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
console.log('');

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    console.error('Please set SUPABASE_URL, SUPABASE_KEY, and SUPABASE_SERVICE_KEY in .env.buzz');
    process.exit(1);
}

// Initialize Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔌 Testing Supabase Connection...');

// Test results object
const results = {
    connection: false,
    tables: {},
    rls: {},
    functions: {},
    views: {},
    errors: []
};

async function runTests() {
    try {
        // Test 1: Basic connection
        console.log('1️⃣ Testing basic connection...');
        const { data, error } = await supabase.from('vendors').select('count').limit(1);
        if (error) throw error;
        results.connection = true;
        console.log('✅ Connection successful');

        // Test 2: Table existence
        console.log('2️⃣ Testing table existence...');
        const tables = ['vendors', 'products', 'transactions', 'messages', 'jiji_leads', 'outreach_campaigns', 'daily_analytics'];

        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('*').limit(1);
                if (error && !error.message.includes('Row Level Security')) {
                    results.tables[table] = false;
                    results.errors.push(`Table ${table}: ${error.message}`);
                } else {
                    results.tables[table] = true;
                }
            } catch (err) {
                results.tables[table] = false;
                results.errors.push(`Table ${table}: ${err.message}`);
            }
        }

        const tableCount = Object.values(results.tables).filter(Boolean).length;
        console.log(`✅ Tables: ${tableCount}/7 exist`);

        // Test 3: RLS Policies (using admin client)
        console.log('3️⃣ Testing RLS policies...');
        try {
            // This will test if RLS is working (should fail for non-authenticated user)
            const { data, error } = await supabase.from('vendors').select('*').limit(1);
            if (error && error.message.includes('Row Level Security')) {
                results.rls.enabled = true;
                console.log('✅ RLS policies active');
            } else {
                results.rls.enabled = false;
                console.log('⚠️ RLS policies may not be properly configured');
            }
        } catch (err) {
            results.rls.enabled = false;
            results.errors.push(`RLS test failed: ${err.message}`);
        }

        // Test 4: Functions
        console.log('4️⃣ Testing database functions...');
        try {
            // Test calculate_vendor_score function
            const { data, error } = await supabaseAdmin.rpc('calculate_vendor_score', {
                vendor_id: '00000000-0000-0000-0000-000000000000'
            });
            if (error) {
                results.functions.calculate_vendor_score = false;
                results.errors.push(`Function test failed: ${error.message}`);
            } else {
                results.functions.calculate_vendor_score = true;
                console.log('✅ calculate_vendor_score function works');
            }
        } catch (err) {
            results.functions.calculate_vendor_score = false;
            results.errors.push(`Function test failed: ${err.message}`);
        }

        // Test 5: Views
        console.log('5️⃣ Testing database views...');
        const views = ['vendor_dashboard', 'admin_dashboard'];

        for (const view of views) {
            try {
                const { data, error } = await supabaseAdmin.from(view).select('*').limit(1);
                if (error) {
                    results.views[view] = false;
                    results.errors.push(`View ${view}: ${error.message}`);
                } else {
                    results.views[view] = true;
                }
            } catch (err) {
                results.views[view] = false;
                results.errors.push(`View ${view}: ${err.message}`);
            }
        }

        const viewCount = Object.values(results.views).filter(Boolean).length;
        console.log(`✅ Views: ${viewCount}/2 accessible`);

        // Test 6: Sample data operations
        console.log('6️⃣ Testing data operations...');

        // Test insert (will fail due to RLS, but that's expected)
        try {
            const { data, error } = await supabase.from('vendors').insert({
                phone: '+1234567890',
                name: 'Test Vendor'
            });
            if (error && error.message.includes('Row Level Security')) {
                console.log('✅ RLS properly blocking unauthorized inserts');
            } else {
                console.log('⚠️ RLS may not be blocking inserts properly');
            }
        } catch (err) {
            console.log('ℹ️ Insert test completed (expected to be blocked by RLS)');
        }

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        results.errors.push(`Connection failed: ${error.message}`);
    }

    // Generate report
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');

    console.log(`🔌 Connection: ${results.connection ? '✅ PASS' : '❌ FAIL'}`);

    console.log(`🗄️ Tables: ${Object.values(results.tables).filter(Boolean).length}/7 ✅`);
    Object.entries(results.tables).forEach(([table, exists]) => {
        console.log(`  ${table}: ${exists ? '✅' : '❌'}`);
    });

    console.log(`🔒 RLS: ${results.rls.enabled ? '✅ ENABLED' : '❌ DISABLED'}`);

    console.log(`⚙️ Functions: ${Object.values(results.functions).filter(Boolean).length}/1 ✅`);
    Object.entries(results.functions).forEach(([func, works]) => {
        console.log(`  ${func}: ${works ? '✅' : '❌'}`);
    });

    console.log(`👁️ Views: ${Object.values(results.views).filter(Boolean).length}/2 ✅`);
    Object.entries(results.views).forEach(([view, works]) => {
        console.log(`  ${view}: ${works ? '✅' : '❌'}`);
    });

    if (results.errors.length > 0) {
        console.log('\n🚨 ERRORS ENCOUNTERED:');
        results.errors.forEach(error => console.log(`  • ${error}`));
    }

    // Overall assessment
    const totalTests = 7; // connection + tables + rls + functions + views
    const passedTests = (
        (results.connection ? 1 : 0) +
        (Object.values(results.tables).filter(Boolean).length === 7 ? 1 : 0) +
        (results.rls.enabled ? 1 : 0) +
        (Object.values(results.functions).filter(Boolean).length >= 1 ? 1 : 0) +
        (Object.values(results.views).filter(Boolean).length >= 1 ? 1 : 0)
    );

    console.log(`\n🎯 OVERALL SCORE: ${passedTests}/${totalTests}`);

    if (passedTests >= 5) {
        console.log('🎉 STATUS: READY FOR PHASE 3');
        console.log('   Database is properly configured and ready for website migration');
    } else {
        console.log('⚠️ STATUS: ISSUES DETECTED');
        console.log('   Review errors above before proceeding to Phase 3');
    }

    // Save results to file
    const resultFile = path.join(__dirname, '../PHASE_2_TEST_RESULTS.json');
    fs.writeFileSync(resultFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        results,
        score: `${passedTests}/${totalTests}`,
        status: passedTests >= 5 ? 'READY' : 'ISSUES'
    }, null, 2));

    console.log(`\n💾 Results saved to: ${resultFile}`);

    process.exit(passedTests >= 5 ? 0 : 1);
}

// Handle promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run tests
runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
});