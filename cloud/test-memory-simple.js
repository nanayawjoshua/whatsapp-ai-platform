#!/usr/bin/env node

/**
 * Direct n8n Workflow Fix
 * This tests what's actually being sent to Groq by looking at the messages array
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const n8nUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-latest-4dbq.onrender.com/webhook/whatsapp';

// Test payload with conversation history
const testWithHistory = {
  vendorId: 'test_hospital',
  customerId: '233501234567@s.whatsapp.net',
  message: 'What is my name?',
  channel: 'whatsapp',
  conversationHistory: [
    { role: 'user', content: 'My name is Joshua' },
    { role: 'assistant', content: 'Hello Joshua, nice to meet you!' }
  ],
  vendor: {
    name: 'Test Hospital',
    businessType: 'hospitality',
    personalityTone: 'friendly'
  },
  timestamp: Date.now()
};

async function test() {
  console.log('🧪 Testing n8n with Conversation History\n');
  console.log('📤 Sending payload with 2 previous messages (Joshua intro):\n');
  console.log(JSON.stringify(testWithHistory, null, 2));
  console.log('\n⏳ Waiting for response...\n');

  try {
    const response = await axios.post(n8nUrl, testWithHistory, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('📥 Response Status:', response.status);
    console.log('\n📨 AI Reply:');
    console.log(`"${response.data.reply}"\n`);

    // Check if the AI remembers the name
    if (response.data.reply.toLowerCase().includes('joshua')) {
      console.log('✅ SUCCESS! AI remembered the name "Joshua"');
      console.log('   The workflow IS using conversation history correctly.');
      console.log('\n🎉 Conversation memory is working!\n');
    } else {
      console.log('❌ FAIL: AI did not mention "Joshua"');
      console.log('   The workflow is NOT using conversation history.');
      console.log('   It\'s returning a generic welcome message.\n');
      console.log('💡 This means:');
      console.log('   - The Code node is not building messages array with history');
      console.log('   - The conversationHistory is being ignored\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

test();
