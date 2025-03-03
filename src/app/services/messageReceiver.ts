import { Message } from './db';
import dbService from './db';
import aiService from './ai';
import twilioConfig from './twilioConfig';
import telegramConfig from './telegramConfig';
import hybridDbService from './hybridDb';

export class MessageReceiverService {
  // Generate a unique ID for the app to use in deep links
  private appId: string = '';
  
  constructor() {
    // Generate a random app ID if not already set
    if (!this.appId) {
      this.appId = Math.random().toString(36).substring(2, 15);
    }
  }
  
  // Get the deep link URL for WhatsApp
  getWhatsAppDeepLink(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/api/receive?source=whatsapp&appId=${this.appId}`;
  }
  
  // Get the deep link URL for Telegram
  getTelegramDeepLink(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/api/receive?source=telegram&appId=${this.appId}`;
  }
  
  // Get the Twilio WhatsApp number with proper formatting
  getWhatsAppNumber(): string {
    return twilioConfig.whatsappNumber;
  }
  
  // Get the WhatsApp sandbox join code
  getWhatsAppSandboxCode(): string {
    return twilioConfig.whatsappSandboxCode;
  }
  
  // Get the Telegram bot username
  getTelegramBotUsername(): string {
    return telegramConfig.botUsername;
  }
  
  // Get the Telegram bot link
  getTelegramBotLink(): string {
    return `https://t.me/${telegramConfig.botUsername}`;
  }
  
  // Set up the Telegram webhook
  async setupTelegramWebhook(baseUrl: string): Promise<boolean> {
    try {
      const webhookUrl = `${baseUrl}/api/receive?source=telegram`;
      console.log('Setting up Telegram webhook with URL:', webhookUrl);
      
      const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message'],
        }),
      });
      
      const data = await response.json();
      console.log('Telegram webhook setup response:', data);
      return data.ok === true;
    } catch (error) {
      console.error('Error setting up Telegram webhook:', error);
      return false;
    }
  }
  
  // Process an incoming message
  async processIncomingMessage(
    content: string, 
    source: 'whatsapp' | 'telegram',
    metadata: Record<string, any> = {}
  ): Promise<number> {
    try {
      console.log(`Processing incoming ${source} message:`, content);
      
      // Create a new message object
      const message: Message = {
        content,
        source,
        type: aiService.detectMessageType(content),
        createdAt: new Date(),
        metadata
      };
      
      console.log('Message object created:', message);
      
      // Process the message with AI to add categories and tags
      const processedMessage = aiService.processMessage(message);
      console.log('Message processed with AI:', processedMessage);
      
      // Save the message to the database using the hybrid service
      // This will try Supabase first, then fall back to IndexedDB if needed
      const id = await hybridDbService.addMessage(processedMessage);
      console.log('Message saved to database with ID:', id);
      
      return id;
    } catch (error) {
      console.error('Error processing incoming message:', error);
      throw error;
    }
  }
  
  // Simulate receiving a message (for testing)
  async simulateReceiveMessage(
    content: string, 
    source: 'whatsapp' | 'telegram'
  ): Promise<number> {
    console.log(`Simulating ${source} message:`, content);
    return this.processIncomingMessage(content, source);
  }
}

// Create a singleton instance
const messageReceiverService = new MessageReceiverService();

export default messageReceiverService; 