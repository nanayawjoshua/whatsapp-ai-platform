/**
 * Test n8n Webhook with Conversation History
 * Sends a test payload to n8n to verify conversation history is working
 */

import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n-latest-4dbq.onrender.com/webhook/whatsapp';

async function testN8nWebhook() {
  console.log('🧪 Testing n8n Webhook with Conversation History\n');

  // Test payload with conversation history
  const testPayload = {
    vendorId: 'test_hospital',
    customerId: '233501234567@s.whatsapp.net',
    message: 'What is my name?',
    channel: 'whatsapp',
    conversationHistory: [
      {
        role: 'user',
        content: 'My name is Joshua and I need an appointment'
      },
      {
        role: 'assistant',
        content: 'Hello Joshua! I would be happy to help you book an appointment. What day works best for you?'
      }
    ],
    timestamp: Date.now(),
    aiReason: 'Test conversation memory'
  };

  console.log('📤 Sending test payload to n8n:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n');

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, testPayload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Response received from n8n:\n');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n');

    // Check if AI remembered the name
    const reply = response.data.reply || response.data;
    if (reply.toLowerCase().includes('joshua')) {
      console.log('🎉 SUCCESS! AI remembered the name "Joshua"');
      console.log('   Conversation history is WORKING!\n');
    } else {
      console.log('⚠️  WARNING: AI did not mention "Joshua"');
      console.log('   Response:', reply);
      console.log('   Conversation history might NOT be working\n');
    }

  } catch (error) {
    console.error('❌ Error testing n8n webhook:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testN8nWebhook();
