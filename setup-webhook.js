// Simple script to set up the Telegram webhook
import fetch from 'node-fetch';

// Get the bot token from command line arguments or use the one from .env.local
const botToken = process.argv[2] || '8037981029:AAHlFv-PXX2vlg36hV2_MNv5eld-3OLOH_s';

// The webhook URL - replace with your actual URL
const webhookUrl = 'http://localhost:3000/api/receive?source=telegram';

async function setupWebhook() {
  try {
    console.log(`Setting up webhook for bot token: ${botToken}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.ok) {
      console.log('Webhook set up successfully!');
    } else {
      console.error('Failed to set up webhook:', data.description);
    }
  } catch (error) {
    console.error('Error setting up webhook:', error);
  }
}

setupWebhook(); 