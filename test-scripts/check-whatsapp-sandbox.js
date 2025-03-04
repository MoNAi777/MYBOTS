require('dotenv').config();
const twilio = require('twilio');

// Check if Twilio credentials are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

console.log('=== Checking WhatsApp Sandbox Status ===');
console.log(`Using WhatsApp number: ${whatsappNumber}`);

// Initialize Twilio client
try {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not found in .env file');
  }

  const client = new twilio(accountSid, authToken);
  
  console.log('\nChecking for outgoing WhatsApp messages...');
  
  // Get recent outgoing messages
  client.messages
    .list({
      limit: 20,
      from: whatsappNumber
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
          console.log('This indicates that your WhatsApp Sandbox is working correctly for outgoing messages.');
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
          to: whatsappNumber
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
      
      console.log('\n=== WhatsApp Sandbox Check Complete ===');
      console.log('\nTo join the WhatsApp Sandbox:');
      console.log('1. Open WhatsApp on your phone');
      console.log('2. Send "join speak onto" to +1 415 523 8886');
      console.log('3. You should receive a welcome message');
      console.log('4. After joining, send a test message to the same number');
      
      console.log('\nIf you\'ve already joined but are not receiving messages:');
      console.log('1. Make sure your webhook URL is set correctly in the Twilio Console');
      console.log('2. Check the Vercel logs for any errors');
      console.log('3. Try rejoining the sandbox by sending "join speak onto" again');
    })
    .catch(error => {
      console.error(`Error checking WhatsApp status: ${error.message}`);
      
      if (error.code === 20003) {
        console.log('\nAuthentication error. Make sure your Twilio credentials are correct in your .env file.');
      }
    });
} catch (error) {
  console.error(`Error initializing Twilio client: ${error.message}`);
  console.log('Make sure your Twilio credentials are correct in your .env file.');
} 