#!/usr/bin/env node

/**
 * Simple n8n Workflow Test (works without axios)
 * Tests the workflow with a basic HTTP request
 */

const https = require('https');
const http = require('http');

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n-latest-4dbq.onrender.com/webhook/whatsapp';

const testPayload = {
  message: 'Hello, my name is Joshua',
  channel: 'whatsapp',
  conversationHistory: [],
  vendor: {
    name: 'Test Business',
    businessType: 'general'
  },
  timestamp: Date.now()
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

async function testWorkflow() {
  console.log('🧪 Testing n8n Workflow...');
  console.log(`URL: ${WEBHOOK_URL}`);
  console.log('Payload:', JSON.stringify(testPayload, null, 2));

  try {
    const response = await makeRequest(WEBHOOK_URL, testPayload);

    console.log(`\n📥 Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ SUCCESS! Workflow is working.');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ FAILED!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      console.log('\n🔧 Common fixes:');
      console.log('1. Check Groq API credentials in n8n');
      console.log('2. Verify workflow is activated');
      console.log('3. Check n8n execution logs for red errors');
    }
  } catch (error) {
    console.log('❌ REQUEST FAILED:', error.message);
  }
}

testWorkflow();