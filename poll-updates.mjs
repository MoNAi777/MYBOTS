// Script to poll for updates from the Telegram Bot API
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Get the bot token from command line arguments or use the one from .env.local
const botToken = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  console.error('Error: Telegram bot token is required. Provide it as an argument or set TELEGRAM_BOT_TOKEN environment variable.');
  process.exit(1);
}

// The local server URL
const localServerUrl = 'http://localhost:3000/api/receive?source=telegram';

// Keep track of the last update ID we've processed
let lastUpdateId = 0;

// Poll for updates
async function pollForUpdates() {
  try {
    console.log(`Polling for updates since update_id: ${lastUpdateId}`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ['message'],
      }),
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error polling for updates:', data.description);
      return;
    }
    
    const updates = data.result;
    
    if (updates.length === 0) {
      console.log('No new updates');
      return;
    }
    
    console.log(`Received ${updates.length} new updates`);
    
    // Process each update
    for (const update of updates) {
      console.log(`Processing update ${update.update_id}`);
      
      // Forward the update to our local server
      await forwardUpdateToLocalServer(update);
      
      // Update the last update ID
      lastUpdateId = update.update_id;
    }
  } catch (error) {
    console.error('Error polling for updates:', error);
  }
}

// Forward an update to our local server
async function forwardUpdateToLocalServer(update) {
  try {
    console.log(`Forwarding update to ${localServerUrl}`);
    
    const response = await fetch(localServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });
    
    const data = await response.text();
    
    console.log(`Local server response: ${data}`);
  } catch (error) {
    console.error('Error forwarding update to local server:', error);
  }
}

// Poll for updates every 2 seconds
console.log(`Starting polling for bot ${botToken}`);
console.log(`Updates will be forwarded to ${localServerUrl}`);

// Poll once immediately
pollForUpdates();

// Then poll every 2 seconds
setInterval(pollForUpdates, 2000); 