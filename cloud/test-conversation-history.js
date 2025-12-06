/**
 * Test Conversation History
 * Verifies that history is being saved and loaded correctly
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  family: 4,
  lazyConnect: true
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

async function testHistory() {
  console.log('🧪 Testing Conversation History\n');

  const testVendorId = 'test_hospital';
  const testCustomerId = '233501234567@s.whatsapp.net';
  const key = `history:${testVendorId}:${testCustomerId}`;

  try {
    // Connect to Redis
    console.log('📡 Connecting to Redis...');
    await redis.connect();
    console.log('✅ Redis connected\n');

    // Step 1: Clear any existing history
    console.log('1️⃣  Clearing existing history...');
    await redis.del(key);
    console.log('   ✅ Cleared\n');

    // Step 2: Save test conversation
    console.log('2️⃣  Saving test conversation...');
    const testHistory = [
      { role: 'user', content: 'My name is Joshua' },
      { role: 'assistant', content: 'Hello Joshua! How can I help you today?' },
      { role: 'user', content: 'I need an appointment for Monday' },
      { role: 'assistant', content: 'I can help you book an appointment for Monday. What time works best for you?' }
    ];

    await redis.setex(key, 86400, JSON.stringify(testHistory));
    console.log('   ✅ Saved 4 messages\n');

    // Step 3: Load history
    console.log('3️⃣  Loading history from Redis...');
    const loaded = await redis.get(key);
    const parsedHistory = loaded ? JSON.parse(loaded) : [];
    console.log('   ✅ Loaded', parsedHistory.length, 'messages\n');

    // Step 4: Display history
    console.log('4️⃣  Conversation History:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    parsedHistory.forEach((msg, i) => {
      const label = msg.role === 'user' ? '👤 USER' : '🤖 AI';
      console.log(`${label}: ${msg.content}`);
      if (i < parsedHistory.length - 1) console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 5: Simulate adding new message
    console.log('5️⃣  Simulating new message...');
    const newHistory = [
      ...parsedHistory,
      { role: 'user', content: 'What was my name again?' }
    ];

    // Keep last 10 only
    const trimmed = newHistory.slice(-10);
    await redis.setex(key, 86400, JSON.stringify(trimmed));
    console.log('   ✅ Added new message\n');

    // Step 6: Verify it was saved
    console.log('6️⃣  Verifying update...');
    const updated = await redis.get(key);
    const updatedHistory = updated ? JSON.parse(updated) : [];
    console.log('   ✅ Now have', updatedHistory.length, 'messages\n');

    // Step 7: Show what n8n should receive
    console.log('7️⃣  Payload that will be sent to n8n:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const n8nPayload = {
      vendorId: testVendorId,
      customerId: testCustomerId,
      message: 'What was my name again?',
      channel: 'whatsapp',
      conversationHistory: updatedHistory,
      timestamp: Date.now()
    };
    console.log(JSON.stringify(n8nPayload, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Step 8: Check all history keys
    console.log('8️⃣  All conversation histories in Redis:');
    const allKeys = await redis.keys('history:*');
    console.log(`   Found ${allKeys.length} conversation(s)\n`);

    if (allKeys.length > 0) {
      for (const historyKey of allKeys) {
        const data = await redis.get(historyKey);
        const history = data ? JSON.parse(data) : [];
        console.log(`   - ${historyKey}`);
        console.log(`     Messages: ${history.length}`);
        console.log(`     Last message: "${history[history.length - 1]?.content.substring(0, 50)}..."`);
        console.log('');
      }
    }

    console.log('✅ All tests passed!\n');

    // Cleanup
    console.log('Cleaning up test data...');
    await redis.del(key);
    console.log('✅ Cleanup complete\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await redis.quit();
    console.log('Redis connection closed');
  }
}

// Run the test
testHistory();
