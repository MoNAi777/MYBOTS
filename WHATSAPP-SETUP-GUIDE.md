# WhatsApp Sandbox Setup Guide

This guide will help you set up and test your Twilio WhatsApp Sandbox integration with your application.

## Prerequisites

- A Twilio account with WhatsApp Sandbox enabled
- Your application deployed to Vercel (or another hosting service)
- Your Twilio Account SID and Auth Token in your `.env` file

## Step 1: Configure Your Twilio WhatsApp Sandbox

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. Navigate to Messaging > Try it out > Send a WhatsApp message
3. In the WhatsApp Sandbox Settings section, set the following:
   - **WHEN A MESSAGE COMES IN** - Set to your webhook URL: `https://mybots-seven.vercel.app/api/receive?source=whatsapp`
   - **STATUS CALLBACK URL** - Set to your status callback URL: `https://mybots-seven.vercel.app/api/status?source=whatsapp`
   - Ensure both are set to use **HTTP POST**

## Step 2: Join Your WhatsApp Sandbox

1. Open WhatsApp on your phone
2. Add the Twilio WhatsApp Sandbox number to your contacts: **+1 415 523 8886**
3. Send the message `join speak onto` to this number
4. You should receive a welcome message confirming you've joined the sandbox
5. After joining, send a test message like "Hello" to the same number

## Step 3: Test Sending Messages from Your Application

1. Make sure your `.env` file contains the correct Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```

2. Use the `send-whatsapp-test.js` script to send a test message:
   ```
   node send-whatsapp-test.js +1234567890 "Hello from my app!"
   ```
   Replace `+1234567890` with your actual phone number (including country code).

3. Check your WhatsApp to see if you received the message.

## Step 4: Verify Your Setup

Run the WhatsApp Sandbox check script to verify your setup:
```
node check-whatsapp-sandbox.js
```

This script will:
- Check for outgoing messages from your WhatsApp Sandbox
- Check for incoming messages to your WhatsApp Sandbox
- Verify if you've successfully joined the sandbox
- Provide troubleshooting guidance if needed

## Troubleshooting

### If You Don't Receive the Welcome Message

1. Make sure you've sent the exact message: `join speak onto`
2. Try sending it again after a few minutes
3. Ensure you're messaging the correct number: +1 415 523 8886

### If Your Application Doesn't Receive Messages

1. Check your webhook URL in the Twilio Console
2. Verify your application is deployed and running
3. Check the Vercel logs for any errors
4. Run the test script to check your webhook endpoint:
   ```
   node test-webhook-endpoint.js
   ```

### If You Can't Send Messages from Your Application

1. Verify your Twilio credentials in the `.env` file
2. Make sure you've joined the WhatsApp Sandbox
3. Check that you're formatting the recipient number correctly with the `whatsapp:` prefix
4. Run the test script to send a message:
   ```
   node send-whatsapp-test.js +1234567890 "Test message"
   ```

### Common Errors

- **Error 21211**: The 'To' phone number is not a valid phone number. Make sure to format it as `whatsapp:+1234567890`.
- **Error 21608**: The message cannot be sent to the WhatsApp number because the user has not opted in. Make sure to join the sandbox first.
- **Error 20003**: Authentication error. Check your Twilio credentials.

## Important Notes

1. **Trial Account Limitations**: With a Twilio trial account, you can only send messages to verified phone numbers.
2. **WhatsApp Sandbox Expiration**: Your WhatsApp Sandbox connection expires after 72 hours of inactivity. If this happens, you'll need to rejoin by sending `join speak onto` again.
3. **Message Format**: When sending messages to WhatsApp, always prefix the phone number with `whatsapp:` (e.g., `whatsapp:+1234567890`).
4. **Production Usage**: The WhatsApp Sandbox is for testing only. For production use, you'll need to request access to the WhatsApp Business API through Twilio.

## Next Steps

Once your WhatsApp Sandbox is working correctly:

1. Test sending different types of messages (text, media, templates)
2. Implement error handling for various scenarios
3. Consider adding message delivery status tracking
4. Plan your migration to the WhatsApp Business API for production use 