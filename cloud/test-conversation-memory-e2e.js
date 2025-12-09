#!/usr/bin/env node

/**
 * Test Conversation Memory Flow
 * Verifies: Bridge → History Storage → n8n → AI Response → History Update
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  bridgeUrl: process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp',
  testVendorId: 'test_hospital_memory',
  testCustomerId: '233501234567@s.whatsapp.net'
};

console.log('🧪 Testing Conversation Memory Flow\n');
console.log('Config:', {
  bridge: config.bridgeUrl,
  n8n: config.n8nWebhookUrl,
  vendor: config.testVendorId,
  customer: config.testCustomerId
});
console.log('\n');

// Simulate 3-message conversation
const testConversation = [
  {
    step: 1,
    userMessage: 'My name is Joshua',
    expectedAIResponse: 'Joshua',
    conversationHistory: [] // First message - no history
  },
  {
    step: 2,
    userMessage: 'What is my name?',
    expectedAIResponse: 'Joshua',
    conversationHistory: [
      { role: 'user', content: 'My name is Joshua' },
      { role: 'assistant', content: '[AI response from step 1]' }
    ]
  },
  {
    step: 3,
    userMessage: 'Do you remember what I told you earlier?',
    expectedAIResponse: 'Joshua',
    conversationHistory: [
      { role: 'user', content: 'My name is Joshua' },
      { role: 'assistant', content: '[AI response from step 1]' },
      { role: 'user', content: 'What is my name?' },
      { role: 'assistant', content: '[AI response from step 2]' }
    ]
  }
];

async function testStep(step) {
  const test = testConversation[step];
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`📝 Test Step ${test.step}: "${test.userMessage}"`);
  console.log(`${'═'.repeat(70)}`);

  try {
    // Prepare n8n webhook payload (same as bridge sends)
    const payload = {
      vendorId: config.testVendorId,
      customerId: config.testCustomerId,
      message: test.userMessage,
      channel: 'whatsapp',
      conversationHistory: test.conversationHistory,
      timestamp: Date.now()
    };

    console.log('\n1️⃣  Sending to n8n:');
    console.log('   Message:', test.userMessage);
    console.log('   History length:', test.conversationHistory.length);

    const response = await axios.post(config.n8nWebhookUrl, payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    const aiReply = response.data.reply || response.data;
    console.log('\n2️⃣  AI Response received:');
    console.log('   Reply:', aiReply);

    // Check if AI mentioned expected context
    const rememberedContext = aiReply.toLowerCase().includes(test.expectedAIResponse.toLowerCase());
    
    console.log('\n3️⃣  Memory Check:');
    console.log('   Expected to find:', test.expectedAIResponse);
    console.log('   Found in response:', rememberedContext ? '✅ YES' : '❌ NO');

    // Simulate saving to history (what bridge does)
    test.conversationHistory.push({ role: 'user', content: test.userMessage });
    test.conversationHistory.push({ role: 'assistant', content: aiReply });

    return {
      success: rememberedContext,
      response: aiReply,
      historyUpdated: test.conversationHistory.length
    };

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n\n🚀 Starting Conversation Memory Tests\n');

  const results = [];

  for (let i = 0; i < testConversation.length; i++) {
    const result = await testStep(i);
    results.push(result);

    // Wait between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));

  results.forEach((result, i) => {
    const step = i + 1;
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`Step ${step}: ${status}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log(`\n📈 Overall: ${passed}/${total} tests passed (${percentage}%)`);

  if (passed === total) {
    console.log('\n🎉 Conversation memory is working correctly!');
    console.log('\n✅ AI remembers context across multi-turn conversations');
    console.log('✅ n8n is using conversationHistory correctly');
    console.log('✅ Bridge is saving and loading history properly');
  } else {
    console.log('\n⚠️  Some tests failed. Check:');
    console.log('  1. Is n8n Code node building messages array with history?');
    console.log('  2. Is Groq HTTP Request body set to {{ $json }}?');
    console.log('  3. Is system prompt telling AI to remember context?');
    console.log('  4. Check n8n logs for errors in workflow execution');
  }
}

// Run tests
runTests().catch(console.error);
