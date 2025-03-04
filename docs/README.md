# Documentation

This directory contains documentation for the data-organizer application.

## Available Documents

- **SETUP-SUMMARY.md** - A summary of the setup process for all integrations (Telegram, WhatsApp, SMS).
- **WHATSAPP-SETUP-GUIDE.md** - A comprehensive guide for setting up and testing the WhatsApp Sandbox integration.

## Integration Guides

### Telegram Integration

To set up Telegram integration:

1. Create a bot using BotFather on Telegram
2. Add the bot token to your `.env` file
3. Run the setup script: `node setup-scripts/setup-telegram.js`
4. Test the integration: `node test-scripts/test-webhook-endpoint.js`

### WhatsApp Integration

To set up WhatsApp integration:

1. Create a Twilio account with WhatsApp Sandbox
2. Add your Twilio credentials to your `.env` file
3. Configure the webhook URL in the Twilio Console
4. Join the WhatsApp Sandbox by sending "join speak onto" to +1 415 523 8886
5. Test the integration: `node test-scripts/test-with-your-number.js`

### SMS Integration

To set up SMS integration:

1. Create a Twilio account
2. Add your Twilio credentials to your `.env` file
3. Configure the webhook URL in the Twilio Console
4. Test the integration: `node test-scripts/test-webhook-endpoint.js` 