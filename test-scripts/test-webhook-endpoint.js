// Script to test the webhook endpoint
const fetch = require('node-fetch');

async function testWebhookEndpoint() {
  const baseUrl = 'https://mybots-seven.vercel.app';
  
  console.log('Testing webhook endpoints...');
  
  // Test Telegram webhook endpoint
  try {
    console.log('\nTesting Telegram webhook endpoint (GET):');
    const telegramGetResponse = await fetch(`${baseUrl}/api/receive?source=telegram`);
    const telegramGetData = await telegramGetResponse.text();
    console.log(`Status: ${telegramGetResponse.status}`);
    console.log(`Response: ${telegramGetData.substring(0, 100)}${telegramGetData.length > 100 ? '...' : ''}`);
    
    console.log('\nTesting Telegram webhook endpoint (POST):');
    const telegramPostResponse = await fetch(`${baseUrl}/api/receive?source=telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        update_id: 123456789,
        message: {
          message_id: 123,
          from: {
            id: 12345,
            first_name: 'Test',
            username: 'test_user'
          },
          chat: {
            id: 12345,
            first_name: 'Test',
            username: 'test_user',
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: 'This is a test message from the webhook test script'
        }
      })
    });
    
    const telegramPostData = await telegramPostResponse.text();
    console.log(`Status: ${telegramPostResponse.status}`);
    console.log(`Response: ${telegramPostData.substring(0, 100)}${telegramPostData.length > 100 ? '...' : ''}`);
  } catch (error) {
    console.error('Error testing Telegram webhook endpoint:', error.message);
  }
  
  // Test WhatsApp webhook endpoint
  try {
    console.log('\nTesting WhatsApp webhook endpoint (GET):');
    const whatsappGetResponse = await fetch(`${baseUrl}/api/receive?source=whatsapp`);
    const whatsappGetData = await whatsappGetResponse.text();
    console.log(`Status: ${whatsappGetResponse.status}`);
    console.log(`Response: ${whatsappGetData.substring(0, 100)}${whatsappGetData.length > 100 ? '...' : ''}`);
    
    console.log('\nTesting WhatsApp webhook endpoint (POST):');
    // Create form data similar to what Twilio would send
    const formData = new URLSearchParams();
    formData.append('Body', 'This is a test message from the webhook test script');
    formData.append('From', 'whatsapp:+1234567890');
    formData.append('To', 'whatsapp:+0987654321');
    formData.append('MessageSid', 'SM12345');
    
    const whatsappPostResponse = await fetch(`${baseUrl}/api/receive?source=whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const whatsappPostData = await whatsappPostResponse.text();
    console.log(`Status: ${whatsappPostResponse.status}`);
    console.log(`Response: ${whatsappPostData.substring(0, 100)}${whatsappPostData.length > 100 ? '...' : ''}`);
  } catch (error) {
    console.error('Error testing WhatsApp webhook endpoint:', error.message);
  }
}

testWebhookEndpoint(); 