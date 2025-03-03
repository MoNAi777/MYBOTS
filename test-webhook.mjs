// Test script to send a message to the webhook
import fetch from 'node-fetch';

// Get the webhook URL from command line arguments or use default
const webhookUrl = process.argv[2] || 'https://mybots-cdue-seven.vercel.app/api/receive';

// Get the source from command line arguments or use default
const source = process.argv[3] || 'telegram';

// Get the message from command line arguments or use default
const message = process.argv[4] || 'Test message from webhook test script';

async function sendTelegramMessage() {
  try {
    console.log(`Sending Telegram message to ${webhookUrl}?source=telegram`);
    
    // Create a Telegram-like message structure
    const telegramUpdate = {
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
    };
    
    const response = await fetch(`${webhookUrl}?source=telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telegramUpdate)
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('Telegram message sent successfully!');
    } else {
      console.error('Failed to send Telegram message:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

async function sendWhatsAppMessage() {
  try {
    console.log(`Sending WhatsApp message to ${webhookUrl}?source=whatsapp`);
    
    // Create form data for Twilio-like WhatsApp message
    const formData = new URLSearchParams();
    formData.append('Body', message);
    formData.append('From', 'whatsapp:+1234567890');
    formData.append('To', 'whatsapp:+0987654321');
    formData.append('MessageSid', 'SM' + Math.random().toString(36).substring(2, 15));
    formData.append('AccountSid', 'AC' + Math.random().toString(36).substring(2, 15));
    formData.append('ProfileName', 'Test User');
    formData.append('NumMedia', '0');
    
    const response = await fetch(`${webhookUrl}?source=whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('WhatsApp message sent successfully!');
    } else {
      console.error('Failed to send WhatsApp message:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

async function sendCustomMessage() {
  try {
    console.log(`Sending custom message to ${webhookUrl}?source=${source}`);
    
    // Create a custom message structure
    const customMessage = {
      content: message,
      metadata: {
        sender: 'Test Script',
        timestamp: new Date().toISOString(),
        testId: Math.random().toString(36).substring(2, 15)
      }
    };
    
    const response = await fetch(`${webhookUrl}?source=${source}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customMessage)
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('Custom message sent successfully!');
    } else {
      console.error('Failed to send custom message:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error sending custom message:', error);
  }
}

// Run the appropriate function based on the source
async function main() {
  if (source === 'telegram') {
    await sendTelegramMessage();
  } else if (source === 'whatsapp') {
    await sendWhatsAppMessage();
  } else {
    await sendCustomMessage();
  }
}

main(); 