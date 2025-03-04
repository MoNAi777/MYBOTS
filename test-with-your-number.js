require('dotenv').config();
const readline = require('readline');
const twilio = require('twilio');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== WhatsApp Testing Tool ===');
console.log('This script will help you test your WhatsApp integration.');
console.log('');

// Check if Twilio credentials are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

if (!accountSid || !authToken) {
  console.error('Error: Twilio credentials not found in .env file');
  console.log('Make sure your .env file contains TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  process.exit(1);
}

// Initialize Twilio client
const client = new twilio(accountSid, authToken);

// Main menu
function showMainMenu() {
  console.log('\nWhat would you like to do?');
  console.log('1. Send a WhatsApp test message');
  console.log('2. Check WhatsApp Sandbox status');
  console.log('3. Test webhook endpoint');
  console.log('4. Exit');
  
  rl.question('Enter your choice (1-4): ', (choice) => {
    switch (choice) {
      case '1':
        sendWhatsAppMessage();
        break;
      case '2':
        checkWhatsAppStatus();
        break;
      case '3':
        testWebhook();
        break;
      case '4':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showMainMenu();
    }
  });
}

// Send WhatsApp message
function sendWhatsAppMessage() {
  rl.question('\nEnter your phone number with country code (e.g., +1234567890): ', (phoneNumber) => {
    // Format the phone number for WhatsApp
    let formattedTo = phoneNumber;
    if (!phoneNumber.startsWith('whatsapp:')) {
      // Make sure the number starts with +
      formattedTo = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      formattedTo = `whatsapp:${formattedTo}`;
    }
    
    rl.question('Enter your message: ', (message) => {
      console.log(`\nSending WhatsApp message to ${phoneNumber}...`);
      console.log(`Formatted number: ${formattedTo}`);
      console.log(`From: ${from}`);
      console.log(`Message: ${message}`);
      
      client.messages
        .create({
          body: message,
          from: from,
          to: formattedTo
        })
        .then(message => {
          console.log('\n✅ Message sent successfully!');
          console.log(`Message SID: ${message.sid}`);
          console.log(`Status: ${message.status}`);
          
          console.log('\nNext steps:');
          console.log('1. Check your WhatsApp to see if you received the message');
          console.log('2. If you didn\'t receive the message, make sure you\'ve joined the WhatsApp Sandbox');
          console.log('3. Send "join speak onto" to +1 415 523 8886 from your WhatsApp app');
          
          returnToMainMenu();
        })
        .catch(error => {
          console.error(`\n❌ Error sending message: ${error.message}`);
          
          if (error.code === 21211) {
            console.log('\nError 21211: The "To" phone number is not a valid phone number.');
            console.log('Make sure:');
            console.log('1. You\'ve included the country code (e.g., +1 for US numbers)');
            console.log('2. The phone number is correctly formatted');
          } 
          else if (error.code === 21608) {
            console.log('\nError 21608: The message cannot be sent to this WhatsApp number.');
            console.log('This usually means the recipient has not opted in to your WhatsApp Sandbox.');
            console.log('\nMake sure to:');
            console.log('1. Send "join speak onto" to +1 415 523 8886 from your WhatsApp');
            console.log('2. Wait for a confirmation message that you\'ve joined the sandbox');
            console.log('3. If it\'s been more than 72 hours, you may need to rejoin the sandbox');
          }
          
          returnToMainMenu();
        });
    });
  });
}

// Check WhatsApp status
function checkWhatsAppStatus() {
  console.log('\nChecking WhatsApp Sandbox status...');
  
  // Check for outgoing messages
  client.messages
    .list({
      limit: 20,
      from: from
    })
    .then(messages => {
      console.log(`Found ${messages.length} recent messages from your WhatsApp number`);
      
      if (messages.length > 0) {
        console.log('\nRecent outgoing messages:');
        messages.forEach(m => {
          console.log(`- To: ${m.to}, Status: ${m.status}, Date Sent: ${m.dateSent}`);
          console.log(`  Body: ${m.body?.substring(0, 50)}${m.body?.length > 50 ? '...' : ''}`);
        });
        
        // Check if any messages were successfully delivered
        const deliveredMessages = messages.filter(m => m.status === 'delivered');
        if (deliveredMessages.length > 0) {
          console.log('\n✅ You have successfully sent messages from your WhatsApp Sandbox!');
        } else {
          console.log('\n⚠️ No delivered messages found.');
          console.log('This might indicate that your WhatsApp Sandbox is not properly set up for outgoing messages.');
        }
      } else {
        console.log('\n⚠️ No outgoing messages found from your WhatsApp number.');
        console.log('You may not have sent any messages yet or your WhatsApp Sandbox is not properly set up.');
      }
      
      // Now check for incoming messages
      console.log('\nChecking for incoming WhatsApp messages...');
      return client.messages
        .list({
          limit: 20,
          to: from
        });
    })
    .then(messages => {
      console.log(`Found ${messages.length} recent messages to your WhatsApp number`);
      
      if (messages.length > 0) {
        console.log('\nRecent incoming messages:');
        messages.forEach(m => {
          console.log(`- From: ${m.from}, Status: ${m.status}, Date Sent: ${m.dateSent}`);
          console.log(`  Body: ${m.body?.substring(0, 50)}${m.body?.length > 50 ? '...' : ''}`);
        });
        
        // Check if there are any join messages
        const joinMessages = messages.filter(m => 
          m.body?.toLowerCase().includes('join') && 
          m.body?.toLowerCase().includes('speak') && 
          m.body?.toLowerCase().includes('onto'));
          
        if (joinMessages.length > 0) {
          console.log('\n✅ Found join messages! Users have attempted to join your WhatsApp Sandbox.');
          
          // Check if there are any messages after the join messages
          const latestJoinMessage = joinMessages.reduce((latest, current) => 
            new Date(current.dateSent) > new Date(latest.dateSent) ? current : latest, joinMessages[0]);
          
          const messagesAfterJoin = messages.filter(m => 
            new Date(m.dateSent) > new Date(latestJoinMessage.dateSent) && 
            m.from === latestJoinMessage.from &&
            !m.body?.toLowerCase().includes('join'));
          
          if (messagesAfterJoin.length > 0) {
            console.log('✅ Users have successfully joined and sent messages after joining!');
            console.log('Your WhatsApp Sandbox is working correctly for incoming messages.');
          } else {
            console.log('⚠️ No messages found after joining. Users may not have successfully joined the sandbox.');
            console.log('Make sure to send a regular message after the join message.');
          }
        } else {
          console.log('\n⚠️ No join messages found.');
          console.log('Make sure to send "join speak onto" to +1 415 523 8886 from your WhatsApp app.');
        }
      } else {
        console.log('\n⚠️ No incoming messages found to your WhatsApp number.');
        console.log('Make sure to send "join speak onto" to +1 415 523 8886 from your WhatsApp app.');
      }
      
      returnToMainMenu();
    })
    .catch(error => {
      console.error(`\n❌ Error checking WhatsApp status: ${error.message}`);
      returnToMainMenu();
    });
}

// Test webhook endpoint
function testWebhook() {
  console.log('\nTesting webhook endpoint...');
  
  const fetch = require('node-fetch');
  const webhookUrl = 'https://mybots-seven.vercel.app/api/receive?source=whatsapp';
  
  // Test GET request
  fetch(webhookUrl)
    .then(response => response.json())
    .then(data => {
      console.log('GET request successful:');
      console.log(`Status: ${data.message}`);
      console.log(`Timestamp: ${data.timestamp}`);
      
      // Test POST request with mock WhatsApp message
      const mockMessage = {
        Body: 'This is a test message from the WhatsApp testing tool',
        From: 'whatsapp:+1234567890',
        To: from,
        MessageSid: 'TEST' + Date.now()
      };
      
      return fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockMessage)
      });
    })
    .then(response => response.json())
    .then(data => {
      console.log('\nPOST request successful:');
      console.log(`Success: ${data.success}`);
      console.log(`Message ID: ${data.id}`);
      console.log(`Message: ${data.message}`);
      
      console.log('\n✅ Webhook endpoint is working correctly');
      returnToMainMenu();
    })
    .catch(error => {
      console.error(`\n❌ Error testing webhook endpoint: ${error.message}`);
      returnToMainMenu();
    });
}

function returnToMainMenu() {
  console.log('\nPress Enter to return to the main menu...');
  rl.question('', () => {
    showMainMenu();
  });
}

// Start the application
showMainMenu(); 