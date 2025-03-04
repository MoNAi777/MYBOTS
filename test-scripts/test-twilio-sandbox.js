require('dotenv').config();
const fetch = require('node-fetch');

async function testTwilioSandbox() {
  console.log('=== Testing Twilio WhatsApp Sandbox Configuration ===');
  
  // Check if Twilio credentials are set
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.error('❌ Error: Twilio credentials not found in .env file');
    console.log('Please make sure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in your .env file');
    return;
  }
  
  console.log('✅ Twilio credentials found in .env file');
  
  // Test the webhook endpoint
  const webhookUrl = 'https://mybots-seven.vercel.app/api/receive?source=whatsapp';
  
  console.log(`\nTesting webhook endpoint: ${webhookUrl}`);
  
  try {
    // Test GET request
    console.log('Sending GET request to webhook endpoint...');
    const getResponse = await fetch(webhookUrl);
    console.log(`GET Status: ${getResponse.status}`);
    const getText = await getResponse.text();
    console.log(`GET Response: ${getText}`);
    
    // Test POST request with a mock WhatsApp message
    console.log('\nSending POST request to webhook endpoint with mock WhatsApp message...');
    const mockMessage = {
      Body: 'This is a test message from the WhatsApp sandbox test script',
      From: 'whatsapp:+1234567890',
      To: 'whatsapp:+14155238886',
      SmsMessageSid: 'SM' + Math.random().toString(36).substring(2, 15),
      NumMedia: '0',
      ProfileName: 'Test User',
      WaId: '1234567890',
      SmsStatus: 'received',
      SmsSid: 'SM' + Math.random().toString(36).substring(2, 15),
      AccountSid: accountSid
    };
    
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(mockMessage)
    });
    
    console.log(`POST Status: ${postResponse.status}`);
    const postText = await postResponse.text();
    console.log(`POST Response: ${postText}`);
    
    if (postResponse.status === 200) {
      console.log('\n✅ Webhook endpoint is working correctly');
    } else {
      console.log('\n❌ Webhook endpoint returned an error');
    }
  } catch (error) {
    console.error(`\n❌ Error testing webhook: ${error.message}`);
  }
  
  // Check stored messages
  console.log('\nChecking stored messages...');
  try {
    const response = await fetch('https://mybots-seven.vercel.app/api/receive?showMessages=true');
    const data = await response.json();
    
    if (data.webhookMessages && data.webhookMessages.length > 0) {
      console.log(`✅ Found ${data.webhookMessages.length} stored messages`);
      
      // Look for WhatsApp messages
      const whatsappMessages = data.webhookMessages.filter(msg => msg.source === 'whatsapp');
      console.log(`Found ${whatsappMessages.length} WhatsApp messages`);
      
      if (whatsappMessages.length > 0) {
        console.log('\nLatest WhatsApp message:');
        const latestMessage = whatsappMessages[whatsappMessages.length - 1];
        console.log(`Content: ${latestMessage.content}`);
        console.log(`Timestamp: ${latestMessage.timestamp}`);
        console.log(`From: ${latestMessage.metadata.from}`);
      }
    } else {
      console.log('❌ No stored messages found');
    }
  } catch (error) {
    console.error(`Error checking stored messages: ${error.message}`);
  }
  
  console.log('\n=== Twilio WhatsApp Sandbox Configuration Test Complete ===');
  console.log('\nIf the tests were successful, your webhook endpoint is working correctly.');
  console.log('To test with a real WhatsApp message:');
  console.log('1. Send "join speak onto" to +1 415 523 8886 from your WhatsApp');
  console.log('2. After joining, send a test message to the same number');
  console.log('3. Check your application dashboard to see if the message appears');
  console.log('\nIf messages are not appearing, check the Vercel logs for any errors.');
}

testTwilioSandbox().catch(console.error); 