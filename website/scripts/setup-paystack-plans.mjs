/**
 * Paystack Plan Setup Script
 * Creates subscription plans for Personal, Business, and Enterprise tiers
 *
 * Run with: node scripts/setup-paystack-plans.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local file manually
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    const env = {};

    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return env;
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message);
    return {};
  }
}

const env = loadEnv();
const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET;

if (!PAYSTACK_SECRET_KEY) {
  console.error('❌ ERROR: PAYSTACK_SECRET not found in .env.local');
  console.error('   Make sure you have a .env.local file in the website directory');
  process.exit(1);
}

// Plans to create
const plans = [
  {
    name: 'Beeline Personal',
    code: 'personal-monthly',
    amount: 4900, // GHS 49.00 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Perfect for individual users and side hustles. One WhatsApp number, unlimited messages, AI-powered responses.',
  },
  {
    name: 'Beeline Business',
    code: 'business-monthly',
    amount: 9900, // GHS 99.00 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Ideal for single-location businesses. One WhatsApp number, unlimited messages, AI-powered responses, priority support.',
  },
  {
    name: 'Beeline Enterprise (3-5 Locations)',
    code: 'enterprise-5',
    amount: 39500, // GHS 395.00 in pesewas (5 × 79)
    interval: 'monthly',
    currency: 'GHS',
    description: 'For growing businesses. Up to 5 locations, GHS 79 per location (20% discount), team management, aggregated analytics.',
  },
  {
    name: 'Beeline Enterprise (6-12 Locations)',
    code: 'enterprise-12',
    amount: 82800, // GHS 828.00 in pesewas (12 × 69)
    interval: 'monthly',
    currency: 'GHS',
    description: 'For expanding businesses. Up to 12 locations, GHS 69 per location (30% discount), team management, aggregated analytics.',
  },
  {
    name: 'Beeline Enterprise (13-25 Locations)',
    code: 'enterprise-25',
    amount: 147500, // GHS 1,475.00 in pesewas (25 × 59)
    interval: 'monthly',
    currency: 'GHS',
    description: 'For established chains. Up to 25 locations, GHS 59 per location (40% discount), team management, aggregated analytics.',
  },
  {
    name: 'Beeline Enterprise (26-60 Locations)',
    code: 'enterprise-60',
    amount: 294000, // GHS 2,940.00 in pesewas (60 × 49)
    interval: 'monthly',
    currency: 'GHS',
    description: 'For large chains. Up to 60 locations, GHS 49 per location (50% discount), team management, aggregated analytics.',
  },
];

async function createPlan(plan) {
  try {
    const response = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: plan.name,
        interval: plan.interval,
        amount: plan.amount,
        currency: plan.currency,
        description: plan.description,
      }),
    });

    const data = await response.json();

    if (data.status) {
      console.log(`✅ Created: ${plan.name}`);
      console.log(`   Code: ${data.data.plan_code}`);
      console.log(`   Amount: GHS ${(plan.amount / 100).toFixed(2)}`);
      console.log(`   ID: ${data.data.id}`);
      console.log('');
      return { success: true, data: data.data };
    } else {
      // Check if plan already exists
      if (data.message && data.message.includes('already exists')) {
        console.log(`⚠️  Already exists: ${plan.name} (${plan.code})`);
        console.log('');
        return { success: true, exists: true };
      } else {
        console.error(`❌ Failed to create: ${plan.name}`);
        console.error(`   Error: ${data.message}`);
        console.log('');
        return { success: false, error: data.message };
      }
    }
  } catch (error) {
    console.error(`❌ Error creating ${plan.name}:`, error.message);
    console.log('');
    return { success: false, error: error.message };
  }
}

async function setupPlans() {
  console.log('🚀 Beeline Ghana - Paystack Plan Setup\n');
  console.log('Creating subscription plans...\n');

  const results = {
    created: 0,
    existing: 0,
    failed: 0,
  };

  for (const plan of plans) {
    const result = await createPlan(plan);

    if (result.success) {
      if (result.exists) {
        results.existing++;
      } else {
        results.created++;
      }
    } else {
      results.failed++;
    }

    // Wait 500ms between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary\n');
  console.log(`✅ Created: ${results.created}`);
  console.log(`⚠️  Already existed: ${results.existing}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (results.failed === 0) {
    console.log('🎉 All plans are set up successfully!\n');
    console.log('Next steps:');
    console.log('1. Update your .env.local file with these plan codes:');
    console.log('   PAYSTACK_PLAN_PERSONAL=personal-monthly');
    console.log('   PAYSTACK_PLAN_BUSINESS=business-monthly');
    console.log('   PAYSTACK_PLAN_ENTERPRISE_5=enterprise-5');
    console.log('   PAYSTACK_PLAN_ENTERPRISE_12=enterprise-12');
    console.log('   PAYSTACK_PLAN_ENTERPRISE_25=enterprise-25');
    console.log('   PAYSTACK_PLAN_ENTERPRISE_60=enterprise-60');
    console.log('');
    console.log('2. Verify plans in your Paystack dashboard:');
    console.log('   https://dashboard.paystack.com/#/plans');
    console.log('');
  } else {
    console.log('⚠️  Some plans failed to create. Please check the errors above.');
    console.log('');
  }
}

// Run the setup
setupPlans().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
