// Simple script to set up the Telegram webhook
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get the bot token from command line arguments or use the one from .env.local
const botToken = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN || '';

if (!botToken) {
  console.error('Error: No bot token provided. Please provide it as a command line argument or set TELEGRAM_BOT_TOKEN in .env.local');
  process.exit(1);
}

// Command can be 'set', 'delete', or 'info'
const command = process.argv[3] || 'info';

// The webhook URL - only used if command is 'set'
const webhookUrl = process.argv[4] || '';

// Check the current webhook status
async function getWebhookInfo() {
  try {
    console.log(`Getting webhook info for bot token: ${botToken}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const data = await response.json();
    
    console.log('Current webhook info:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return null;
  }
}

// Set up a new webhook
async function setupWebhook() {
  if (!webhookUrl) {
    console.error('Error: No webhook URL provided. Use: node setup-webhook.mjs YOUR_BOT_TOKEN set YOUR_WEBHOOK_URL');
    return;
  }
  
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

// Delete the current webhook
async function deleteWebhook() {
  try {
    console.log(`Deleting webhook for bot token: ${botToken}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    const data = await response.json();
    
    console.log('Response:', data);
    
    if (data.ok) {
      console.log('Webhook deleted successfully!');
    } else {
      console.error('Failed to delete webhook:', data.description);
    }
  } catch (error) {
    console.error('Error deleting webhook:', error);
  }
}

// Run the appropriate function based on the command
async function main() {
  if (command === 'set') {
    await setupWebhook();
  } else if (command === 'delete') {
    await deleteWebhook();
  }
  
  // Always show the current webhook info at the end
  await getWebhookInfo();
}

main(); 