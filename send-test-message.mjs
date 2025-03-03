// Script to send a test message directly to the webhook endpoint
import fetch from 'node-fetch';

// Get the webhook URL from command line arguments or use default
const webhookUrl = process.argv[2] || 'https://mybots-cdue-seven.vercel.app/api/receive';

// Get the source from command line arguments or use default
const source = process.argv[3] || 'telegram';

// Get the message from command line arguments or use default
const message = process.argv[4] || 'Test message from send-test-message script';

async function sendMessage() {
  try {
    console.log(`Sending ${source} message to ${webhookUrl}?source=${source}`);
    
    let body;
    let headers = {
      'Content-Type': 'application/json'
    };
    
    if (source === 'telegram') {
      // Create a Telegram-like message structure
      body = JSON.stringify({
        update_id: Math.floor(Math.random() * 1000000),
        message: {
          message_id: Math.floor(Math.random() * 1000000),
          from: {
            id: 12345678,
            is_bot: false,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en'
          },
          chat: {
            id: 12345678,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: message
        }
      });
    } else if (source === 'whatsapp') {
      // Create a custom message structure for WhatsApp
      body = JSON.stringify({
        content: message,
        metadata: {
          from: 'whatsapp:+1234567890',
          to: 'whatsapp:+0987654321',
          messageSid: 'SM' + Math.random().toString(36).substring(2, 15),
          accountSid: 'AC' + Math.random().toString(36).substring(2, 15),
          profileName: 'Test User',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Create a custom message structure
      body = JSON.stringify({
        content: message,
        metadata: {
          sender: 'Test Script',
          timestamp: new Date().toISOString(),
          testId: Math.random().toString(36).substring(2, 15)
        }
      });
    }
    
    console.log('Request body:', body);
    
    const response = await fetch(`${webhookUrl}?source=${source}`, {
      method: 'POST',
      headers,
      body
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log(`${source} message sent successfully!`);
    } else {
      console.error(`Failed to send ${source} message:`, data.error || 'Unknown error');
    }
  } catch (error) {
    console.error(`Error sending ${source} message:`, error);
  }
}

// Run the function
sendMessage(); 