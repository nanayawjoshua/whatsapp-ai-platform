/**
 * Test QR code generation with account_type
 */

async function testQRGeneration() {
  console.log('🧪 Testing QR Code Generation with Enterprise Support\n');

  const testCases = [
    {
      name: 'Personal Tier',
      vendorId: 'test_personal_001',
      vendorData: {
        name: 'Kwame Personal Shop',
        phone: '233501111111',
        email: 'kwame@personal.com',
        businessType: 'retail',
        accountType: 'personal'
      }
    },
    {
      name: 'Business Tier',
      vendorId: 'test_business_001',
      vendorData: {
        name: 'Ama Fashion Boutique',
        phone: '233502222222',
        email: 'ama@fashion.com',
        businessType: 'fashion',
        accountType: 'business'
      }
    },
    {
      name: 'Enterprise Tier',
      vendorId: 'test_enterprise_001',
      vendorData: {
        name: 'KFC Accra Mall',
        phone: '233503333333',
        email: 'accra@kfc.com.gh',
        businessType: 'restaurant',
        accountType: 'enterprise'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Vendor ID: ${testCase.vendorId}`);
    console.log(`   Account Type: ${testCase.vendorData.accountType}`);

    try {
      const response = await fetch('http://localhost:3000/vendor/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success! QR code generated (${data.qrCode?.substring(0, 50)}...)`);
        console.log(`   ⏱️  Expires in: ${data.expiresIn}s\n`);
      } else {
        const error = await response.text();
        console.log(`   ❌ Failed: ${response.status} - ${error}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Wait 2s between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('✅ All tests completed!\n');
  console.log('Next: Check database to verify account_type was saved correctly');
}

testQRGeneration();
