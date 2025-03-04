require('dotenv').config();
const twilio = require('twilio');

// Get command line arguments
const args = process.argv.slice(2);
const to = args[0];
const message = args[1] || 'Hello from your data-organizer app!';

// Check if phone number is provided
if (!to) {
  console.error('Error: Phone number is required');
  console.log('\nUsage: node send-whatsapp-test.js +1234567890 "Your message here"');
  console.log('Make sure to include the country code with your phone number.');
  process.exit(1);
}

// Format the phone number for WhatsApp
let formattedTo = to;
if (!to.startsWith('whatsapp:')) {
  // Make sure the number starts with +
  formattedTo = to.startsWith('+') ? to : `+${to}`;
  formattedTo = `whatsapp:${formattedTo}`;
}

// Check for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

if (!accountSid || !authToken) {
  console.error('Error: Twilio credentials not found in .env file');
  console.log('Make sure your .env file contains TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  process.exit(1);
}

console.log('=== Sending WhatsApp Test Message ===');
console.log(`From: ${from}`);
console.log(`To: ${formattedTo}`);
console.log(`Message: ${message}`);
console.log('\nSending message...');

// Initialize Twilio client and send message
const client = new twilio(accountSid, authToken);

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
    console.log(`Date Sent: ${message.dateCreated}`);
    
    console.log('\nNext steps:');
    console.log('1. Check your WhatsApp to see if you received the message');
    console.log('2. If you didn\'t receive the message, check the Twilio Console for errors');
    console.log('3. Make sure you\'ve joined the WhatsApp Sandbox by sending "join speak onto" to +1 415 523 8886');
  })
  .catch(error => {
    console.error(`\n❌ Error sending message: ${error.message}`);
    
    // Provide helpful error messages for common errors
    if (error.code === 21211) {
      console.log('\nError 21211: The "To" phone number is not a valid phone number.');
      console.log('Make sure:');
      console.log('1. You\'ve included the country code (e.g., +1 for US numbers)');
      console.log('2. The phone number is correctly formatted');
      console.log('3. For WhatsApp, the number should be formatted as: whatsapp:+1234567890');
    } 
    else if (error.code === 21608) {
      console.log('\nError 21608: The message cannot be sent to this WhatsApp number.');
      console.log('This usually means the recipient has not opted in to your WhatsApp Sandbox.');
      console.log('\nMake sure the recipient has:');
      console.log('1. Sent "join speak onto" to +1 415 523 8886 from their WhatsApp');
      console.log('2. Received a confirmation message that they\'ve joined your sandbox');
      console.log('3. If it\'s been more than 72 hours, they may need to rejoin the sandbox');
    }
    else if (error.code === 20003) {
      console.log('\nError 20003: Authentication error.');
      console.log('Make sure your Twilio credentials are correct in your .env file.');
    }
    else if (error.code === 20404) {
      console.log('\nError 20404: Resource not found.');
      console.log('This could be because:');
      console.log('1. Your Twilio account doesn\'t have WhatsApp enabled');
      console.log('2. You\'re trying to use a WhatsApp number that\'s not associated with your account');
    }
    
    console.log('\nFor more information, check the Twilio Console:');
    console.log('https://console.twilio.com/');
  }); 