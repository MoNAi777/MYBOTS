# Setup Scripts

This directory contains scripts for setting up the various integrations in the data-organizer application.

## Available Scripts

- **setup-telegram.js** - Sets up the Telegram webhook for your bot.
- **setup-whatsapp.js** - Provides instructions for setting up the WhatsApp Sandbox webhook.

## Usage

To run any of these scripts, use Node.js from the project root directory:

```bash
node setup-scripts/script-name.js
```

For example:

```bash
node setup-scripts/setup-telegram.js
```

## Notes

- These scripts require the appropriate environment variables to be set in your `.env` file.
- For Telegram setup, you need to have created a bot using BotFather and obtained a bot token.
- For WhatsApp setup, you need to have a Twilio account with WhatsApp Sandbox enabled. 