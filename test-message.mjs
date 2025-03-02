// Script to send a test message to our local server
import fetch from 'node-fetch';

// The local server URL
const localServerUrl = 'http://localhost:3000/api/receive?source=telegram';

// Create a test message
const testMessage = {
  update_id: 123456789,
  message: {
    message_id: 1,
    from: {
      id: 123456789,
      is_bot: false,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    },
    chat: {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      type: 'private',
    },
    date: Math.floor(Date.now() / 1000),
    text: 'This is a test message',
  },
};

// Send the test message to our local server
async function sendTestMessage() {
  try {
    console.log(`Sending test message to ${localServerUrl}`);
    console.log('Test message:', JSON.stringify(testMessage, null, 2));
    
    const response = await fetch(localServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });
    
    const data = await response.text();
    
    console.log(`Local server response: ${data}`);
  } catch (error) {
    console.error('Error sending test message:', error);
  }
}

// Send the test message
sendTestMessage(); 