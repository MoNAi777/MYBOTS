require('dotenv').config();
const twilio = require('twilio');

// Check if Twilio credentials are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Get command line arguments
const args = process.argv.slice(2);
const usage = `
Usage: node send-test-message.js <type> <to_number> <message>

Arguments:
  type        - The type of message to send: "sms" or "whatsapp"
  to_number   - The recipient's phone number (e.g., +1234567890)
  message     - The message to send (in quotes)

Examples:
  node send-test-message.js sms +1234567890 "Hello from my app!"
  node send-test-message.js whatsapp +1234567890 "Hello from WhatsApp!"
`;

if (args.length < 3) {
  console.log(usage);
  process.exit(1);
}

const type = args[0].toLowerCase();
const toNumber = args[1];
const messageBody = args[2];

if (type !== 'sms' && type !== 'whatsapp') {
  console.error('❌ Error: Invalid message type. Use "sms" or "whatsapp".');
  console.log(usage);
  process.exit(1);
}

// Initialize Twilio client
try {
  const client = new twilio(accountSid, authToken);

  // Format the recipient number for WhatsApp if needed
  const formattedToNumber = type === 'whatsapp' 
    ? (toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`)
    : toNumber;

  // Set the from number based on the message type
  const fromNumber = type === 'whatsapp' ? whatsappNumber : phoneNumber;

  console.log(`Sending ${type.toUpperCase()} message to ${formattedToNumber}...`);
  console.log(`From: ${fromNumber}`);
  console.log(`Message: ${messageBody}`);
  
  // Send the message
  client.messages.create({
    body: messageBody,
    from: fromNumber,
    to: formattedToNumber
  })
  .then(message => {
    console.log('✅ Message sent successfully!');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);
  })
  .catch(error => {
    console.error(`❌ Error sending message: ${error.message}`);
    
    if (error.code === 21608) {
      console.log('\nNote: If you\'re using the Twilio WhatsApp Sandbox, the recipient must first join your sandbox');
      console.log('by sending the join code to your Twilio WhatsApp number.');
    }
    
    if (error.code === 21211) {
      console.log('\nNote: If you\'re using a trial account, you can only send messages to verified phone numbers.');
      console.log('Make sure to verify your phone number in the Twilio Console.');
    }
  });
} catch (error) {
  console.error(`❌ Error initializing Twilio client: ${error.message}`);
  console.log('Make sure your Twilio credentials are correct in your .env file.');
} 