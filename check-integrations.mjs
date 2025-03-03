// Script to check the Twilio and Telegram integrations
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Check Telegram integration
async function checkTelegram() {
  console.log('\n--- Checking Telegram Integration ---');
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  
  if (!botToken || !botUsername) {
    console.error('Error: Telegram bot token or username not found in environment variables');
    return false;
  }
  
  console.log('Bot Username:', botUsername);
  console.log('Bot Token:', botToken.substring(0, 10) + '...');
  
  try {
    // Check if the bot is valid
    console.log('Checking bot validity...');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error getting bot info:', data.description);
      return false;
    }
    
    console.log('Bot is valid!');
    console.log('Bot Info:', data.result);
    
    // Check webhook status
    console.log('\nChecking webhook status...');
    const webhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();
    
    if (!webhookData.ok) {
      console.error('Error getting webhook info:', webhookData.description);
      return false;
    }
    
    console.log('Webhook Info:', webhookData.result);
    
    if (webhookData.result.url) {
      console.log('Webhook is set up!');
    } else {
      console.log('Webhook is not set up. Run setup:telegram script to set it up.');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Telegram integration:', error);
    return false;
  }
}

// Check Twilio integration
async function checkTwilio() {
  console.log('\n--- Checking Twilio Integration ---');
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  if (!accountSid || !authToken || !phoneNumber || !whatsappNumber) {
    console.error('Error: Twilio credentials not found in environment variables');
    return false;
  }
  
  console.log('Account SID:', accountSid);
  console.log('Auth Token:', authToken.substring(0, 5) + '...');
  console.log('Phone Number:', phoneNumber);
  console.log('WhatsApp Number:', whatsappNumber);
  
  try {
    // Check if the account is valid
    console.log('Checking account validity...');
    
    // We can't directly check the Twilio API without a proper client library
    // So we'll just check if the credentials are in the correct format
    
    if (!accountSid.startsWith('AC')) {
      console.error('Error: Invalid Twilio Account SID format. Should start with "AC"');
      return false;
    }
    
    if (authToken.length < 32) {
      console.error('Error: Invalid Twilio Auth Token format. Should be at least 32 characters');
      return false;
    }
    
    console.log('Twilio credentials format looks valid!');
    console.log('Note: To fully verify, you need to send a test message or check the Twilio console.');
    
    return true;
  } catch (error) {
    console.error('Error checking Twilio integration:', error);
    return false;
  }
}

// Run the checks
async function checkIntegrations() {
  console.log('Checking integrations...');
  
  const telegramOk = await checkTelegram();
  const twilioOk = await checkTwilio();
  
  console.log('\n--- Integration Check Summary ---');
  console.log('Telegram:', telegramOk ? '✅ OK' : '❌ Issues detected');
  console.log('Twilio:', twilioOk ? '✅ OK' : '❌ Issues detected');
  
  if (telegramOk && twilioOk) {
    console.log('\nAll integrations look good!');
  } else {
    console.log('\nSome integrations have issues. Please check the logs above.');
  }
}

checkIntegrations(); 