// Secure access to Telegram configuration
// This file provides a centralized way to access Telegram credentials
// without hardcoding them in the application code

// Environment variables are loaded automatically by Next.js from .env.local

export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || '',
  botUsername: process.env.TELEGRAM_BOT_USERNAME || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '',
};

// Helper function to validate that all required credentials are available
export function validateTelegramConfig(): boolean {
  const { botToken, botUsername } = telegramConfig;
  
  if (!botToken || !botUsername) {
    console.error('Missing Telegram credentials. Please check your .env.local file.');
    return false;
  }
  
  return true;
}

// Helper function to get the bot URL for webhook setup
export function getTelegramWebhookUrl(baseUrl: string): string {
  return `${baseUrl}/api/receive?source=telegram`;
}

// Helper function to get the Telegram bot link
export function getTelegramBotLink(): string {
  const { botUsername } = telegramConfig;
  return `https://t.me/${botUsername}`;
}

export default telegramConfig; 