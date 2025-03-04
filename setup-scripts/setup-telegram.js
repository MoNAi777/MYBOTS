// Script to set up Telegram webhook
require('dotenv').config();
const fetch = require('node-fetch');

async function setupTelegramWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = 'https://mybots-seven.vercel.app';
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
    return;
  }
  
  const webhookUrl = `${baseUrl}/api/receive?source=telegram`;
  console.log(`Setting up Telegram webhook with URL: ${webhookUrl}`);
  
  try {
    // First, check if the bot token is valid
    const meResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meResponse.json();
    
    if (!meData.ok) {
      console.error('Invalid Telegram bot token:', meData.description);
      return;
    }
    
    console.log(`Bot verified: @${meData.result.username}`);
    
    // Set the webhook
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post'],
      }),
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('Webhook set up successfully!');
      console.log('Description:', data.description);
    } else {
      console.error('Failed to set up webhook:', data.description);
    }
    
    // Get webhook info to verify
    const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoData = await infoResponse.json();
    
    if (infoData.ok) {
      console.log('\nWebhook Info:');
      console.log('URL:', infoData.result.url);
      console.log('Has custom certificate:', infoData.result.has_custom_certificate);
      console.log('Pending update count:', infoData.result.pending_update_count);
      
      if (infoData.result.last_error_date) {
        const errorDate = new Date(infoData.result.last_error_date * 1000);
        console.log('Last error:', infoData.result.last_error_message);
        console.log('Last error date:', errorDate.toISOString());
      }
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
  }
}

setupTelegramWebhook(); 