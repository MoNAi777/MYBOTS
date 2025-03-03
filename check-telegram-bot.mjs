// Script to check Telegram bot configuration
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
try {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Get Telegram bot token from environment variables
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME;

if (!botToken) {
  console.error('Telegram bot token is missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('Telegram Bot Token:', botToken.substring(0, 10) + '...');
console.log('Telegram Bot Username:', botUsername);

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

// Get bot information
async function getBotInfo() {
  try {
    console.log(`Getting bot info for bot token: ${botToken}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    console.log('Bot info:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}

// Set up a new webhook
async function setupWebhook(webhookUrl) {
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

// Run the checks
async function main() {
  // Get bot information
  await getBotInfo();
  
  // Get current webhook info
  const webhookInfo = await getWebhookInfo();
  
  // Check if webhook is set up correctly
  if (webhookInfo && webhookInfo.ok) {
    const webhookUrl = webhookInfo.result.url;
    
    if (webhookUrl) {
      console.log(`Webhook is currently set to: ${webhookUrl}`);
      
      // Check if webhook URL is correct
      if (webhookUrl.includes('mybots-cdue-seven.vercel.app/api/receive?source=telegram')) {
        console.log('Webhook URL is correctly set up!');
      } else {
        console.log('Webhook URL does not point to the correct endpoint.');
        
        // Ask if user wants to update the webhook
        if (process.argv.includes('--update')) {
          await setupWebhook('https://mybots-cdue-seven.vercel.app/api/receive?source=telegram');
        } else {
          console.log('To update the webhook, run: node check-telegram-bot.mjs --update');
        }
      }
    } else {
      console.log('No webhook URL is set.');
      
      // Ask if user wants to set up the webhook
      if (process.argv.includes('--update')) {
        await setupWebhook('https://mybots-cdue-seven.vercel.app/api/receive?source=telegram');
      } else {
        console.log('To set up the webhook, run: node check-telegram-bot.mjs --update');
      }
    }
  }
}

main(); 