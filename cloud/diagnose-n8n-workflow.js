#!/usr/bin/env node

/**
 * Diagnostic Tool: Test n8n Workflow Nodes Individually
 * Helps isolate which node is failing (Code, HTTP, etc.)
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'https://n8n-latest-4dbq.onrender.com/webhook/whatsapp'
};

// Test payloads with increasing complexity
const testPayloads = [
  {
    name: '1. Minimal Payload (No vendor/history)',
    payload: {
      message: 'Hello',
      channel: 'whatsapp',
      timestamp: Date.now()
    }
  },
  {
    name: '2. With vendorId only',
    payload: {
      vendorId: 'test_hospital',
      customerId: '233501234567@s.whatsapp.net',
      message: 'Hello',
      channel: 'whatsapp',
      timestamp: Date.now()
    }
  },
  {
    name: '3. With empty vendor object',
    payload: {
      vendorId: 'test_hospital',
      customerId: '233501234567@s.whatsapp.net',
      message: 'Hello',
      channel: 'whatsapp',
      conversationHistory: [],
      vendor: {},
      timestamp: Date.now()
    }
  },
  {
    name: '4. Full payload (as bridge sends)',
    payload: {
      vendorId: 'test_hospital',
      customerId: '233501234567@s.whatsapp.net',
      message: 'My name is Joshua',
      channel: 'whatsapp',
      conversationHistory: [],
      vendor: {
        name: 'Test Hospital',
        businessType: 'hospitality',
        accountType: 'business',
        personalityTone: 'friendly',
        systemPromptOverride: null
      },
      timestamp: Date.now()
    }
  }
];

async function testPayload(testCase) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🧪 ${testCase.name}`);
  console.log(`${'═'.repeat(70)}`);
  
  console.log('\n📤 Sending payload:');
  console.log(JSON.stringify(testCase.payload, null, 2).split('\n').slice(0, 10).join('\n'));
  console.log('   ...(truncated)');

  try {
    const response = await axios.post(config.n8nWebhookUrl, testCase.payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true // Don't throw on any status code
    });

    console.log(`\n📥 Response Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Success! Response:');
      console.log(JSON.stringify(response.data, null, 2));
      return { success: true, status: response.status };
    } else if (response.status === 500) {
      console.log('❌ Server Error (500)');
      console.log('Response body:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('\n⚠️  Likely issues:');
      console.log('  - Code node has a syntax/runtime error');
      console.log('  - Groq API call is failing (check credentials)');
      console.log('  - Extract Reply node has wrong path');
      return { success: false, status: response.status, error: response.data };
    } else {
      console.log(`❌ Unexpected Status: ${response.status}`);
      console.log(JSON.stringify(response.data, null, 2));
      return { success: false, status: response.status, error: response.data };
    }
  } catch (error) {
    console.log(`\n❌ Request Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Body:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('\n🔍 n8n Workflow Diagnostic Tool');
  console.log(`Webhook URL: ${config.n8nWebhookUrl}`);
  console.log('Testing payloads in order of complexity...\n');

  const results = [];

  for (const testCase of testPayloads) {
    const result = await testPayload(testCase);
    results.push({ name: testCase.name, result });

    // Stop on first failure for easier debugging
    if (!result.success) {
      console.log('\n⛔ Stopping here - first failure detected');
      break;
    }

    // Wait between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═'.repeat(70));

  results.forEach((r, i) => {
    const status = r.result.success ? '✅' : '❌';
    console.log(`${i + 1}. ${r.name}: ${status}`);
  });

  // Recommendations
  console.log('\n💡 NEXT STEPS:');

  const firstFailure = results.find(r => !r.result.success);
  
  if (!firstFailure) {
    console.log('✅ All tests passed! The workflow is working correctly.');
    console.log('The E2E test should pass now. Try running:');
    console.log('  node test-conversation-memory-e2e.js');
  } else {
    console.log(`⚠️  First failure at: ${firstFailure.name}`);
    console.log('\nTo debug further:');
    console.log('1. Go to n8n UI → Workflows → find your WhatsApp workflow');
    console.log('2. Look for red X or error indicators on nodes');
    console.log('3. Click the failing node and check the error message');
    console.log('4. Common issues:');
    console.log('   - Groq API key not set in credentials');
    console.log('   - Code node syntax error (check for undefined variables)');
    console.log('   - HTTP Request body not set to {{ $json }}');
  }
}

runDiagnostics().catch(console.error);
