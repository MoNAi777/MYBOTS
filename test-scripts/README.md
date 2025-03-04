# Test Scripts

This directory contains scripts for testing the various integrations in the data-organizer application.

## WhatsApp Testing

- **check-whatsapp-sandbox.js** - Checks the status of your WhatsApp Sandbox, including outgoing and incoming messages.
- **send-whatsapp-test.js** - Sends a test message to a WhatsApp number using the Twilio WhatsApp Sandbox.
- **test-twilio-sandbox.js** - Tests the Twilio WhatsApp Sandbox configuration, including webhook endpoints.
- **test-with-your-number.js** - Interactive tool for testing WhatsApp integration with your phone number.

## Webhook Testing

- **test-webhook-endpoint.js** - Tests all webhook endpoints (Telegram, WhatsApp, SMS) to ensure they're working correctly.

## Usage

To run any of these scripts, use Node.js from the project root directory:

```bash
node test-scripts/script-name.js
```

For example:

```bash
node test-scripts/test-with-your-number.js
```

## Notes

- These scripts require the appropriate environment variables to be set in your `.env` file.
- For WhatsApp testing, you need to have joined the WhatsApp Sandbox by sending "join speak onto" to +1 415 523 8886.
- For Telegram testing, you need to have set up a Telegram bot using BotFather. 