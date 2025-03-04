// Script to help set up WhatsApp webhook
require('dotenv').config();
const fetch = require('node-fetch');

async function setupWhatsAppWebhook() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const baseUrl = 'https://mybots-seven.vercel.app';
  
  if (!accountSid || !authToken) {
    console.error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not found in environment variables');
    return;
  }
  
  const webhookUrl = `${baseUrl}/api/receive?source=whatsapp`;
  
  console.log('WhatsApp Webhook Setup Instructions:');
  console.log('-----------------------------------');
  console.log(`1. Go to the Twilio Console: https://console.twilio.com/`);
  console.log(`2. Navigate to Messaging → Try it Out → Send a WhatsApp Message`);
  console.log(`3. In the Sandbox Configuration, set the following:`);
  console.log(`   - When a message comes in: ${webhookUrl}`);
  console.log(`   - Method: POST`);
  console.log(`4. Click Save`);
  console.log(`5. Test by sending a message to your WhatsApp number: ${whatsappNumber || 'your WhatsApp number'}`);
  console.log('');
  console.log('For your phone number configuration:');
  console.log(`1. Go to Phone Numbers → Manage → Active Numbers`);
  console.log(`2. Click on your phone number`);
  console.log(`3. Scroll down to Messaging Configuration`);
  console.log(`4. Set the webhook URL to: ${webhookUrl}`);
  console.log(`5. Make sure HTTP POST is selected`);
  console.log(`6. Click Save`);
  
  // We can't directly set up the webhook via API because it requires Twilio Console access
  // But we can check if the credentials are valid
  
  try {
    // Check if the Twilio credentials are valid by making a simple API call
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    const data = await response.json();
    
    if (data.sid === accountSid) {
      console.log('\nTwilio credentials are valid!');
      console.log(`Account Name: ${data.friendly_name}`);
      console.log(`Account Status: ${data.status}`);
    } else {
      console.error('\nInvalid Twilio credentials');
      if (data.message) {
        console.error('Error:', data.message);
      }
    }
  } catch (error) {
    console.error('\nError checking Twilio credentials:', error.message);
  }
}

setupWhatsAppWebhook(); 