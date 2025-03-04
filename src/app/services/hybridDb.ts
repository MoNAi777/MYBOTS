import { Message } from './db';
import indexedDbService from './db';
import supabaseDbService from './supabaseDb';

/**
 * HybridDbService - Uses IndexedDB on the client and Supabase on the server
 * This allows for offline capabilities while also providing server-side persistence
 */
class HybridDbService {
  private isServer(): boolean {
    return typeof window === 'undefined';
  }

  async addMessage(message: Message): Promise<number> {
    try {
      // Always add to server DB if possible
      const id = await supabaseDbService.addMessage(message);
      
      // If we're on the client, also add to IndexedDB for offline access
      if (!this.isServer()) {
        try {
          await indexedDbService.addMessage(message);
        } catch (error) {
          console.warn('Failed to add message to IndexedDB:', error);
          // Continue anyway since we've already added to the server
        }
      }
      
      return id;
    } catch (error) {
      // If server DB fails but we're on client, try IndexedDB as fallback
      if (!this.isServer()) {
        try {
          return await indexedDbService.addMessage(message);
        } catch (indexedDbError) {
          console.error('Failed to add message to both databases:', error, indexedDbError);
          throw new Error('Could not add message to any database');
        }
      }
      
      throw error;
    }
  }

  async getMessages(options: {
    source?: 'whatsapp' | 'telegram';
    type?: 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other';
    category?: string;
    starred?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Message[]> {
    try {
      // Try to get from server DB first
      return await supabaseDbService.getMessages(options);
    } catch (error) {
      // If server DB fails but we're on client, try IndexedDB as fallback
      if (!this.isServer()) {
        try {
          return await indexedDbService.getMessages(options);
        } catch (indexedDbError) {
          console.error('Failed to get messages from both databases:', error, indexedDbError);
          throw new Error('Could not get messages from any database');
        }
      }
      
      throw error;
    }
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<void> {
    try {
      // Always update server DB if possible
      await supabaseDbService.updateMessage(id, updates);
      
      // If we're on the client, also update IndexedDB for offline access
      if (!this.isServer()) {
        try {
          await indexedDbService.updateMessage(id, updates);
        } catch (error) {
          console.warn('Failed to update message in IndexedDB:', error);
          // Continue anyway since we've already updated the server
        }
      }
    } catch (error) {
      // If server DB fails but we're on client, try IndexedDB as fallback
      if (!this.isServer()) {
        try {
          await indexedDbService.updateMessage(id, updates);
        } catch (indexedDbError) {
          console.error('Failed to update message in both databases:', error, indexedDbError);
          throw new Error('Could not update message in any database');
        }
      }
      
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      // Always delete from server DB if possible
      await supabaseDbService.deleteMessage(id);
      
      // If we're on the client, also delete from IndexedDB for offline access
      if (!this.isServer()) {
        try {
          await indexedDbService.deleteMessage(id);
        } catch (error) {
          console.warn('Failed to delete message from IndexedDB:', error);
          // Continue anyway since we've already deleted from the server
        }
      }
    } catch (error) {
      // If server DB fails but we're on client, try IndexedDB as fallback
      if (!this.isServer()) {
        try {
          await indexedDbService.deleteMessage(id);
        } catch (indexedDbError) {
          console.error('Failed to delete message from both databases:', error, indexedDbError);
          throw new Error('Could not delete message from any database');
        }
      }
      
      throw error;
    }
  }

  // Sync IndexedDB with Supabase DB (useful after being offline)
  async syncDatabases(): Promise<void> {
    if (this.isServer()) {
      return; // Can only sync on client
    }

    try {
      // Get all messages from IndexedDB
      const localMessages = await indexedDbService.getMessages();
      
      // Get all messages from Supabase DB
      const serverMessages = await supabaseDbService.getMessages();
      
      // Find messages in IndexedDB that aren't in Supabase DB
      const serverMessageIds = new Set(serverMessages.map(m => m.id));
      const messagesToSync = localMessages.filter(m => m.id && !serverMessageIds.has(m.id));
      
      // Add each message to Supabase DB
      for (const message of messagesToSync) {
        await supabaseDbService.addMessage(message);
      }
      
      console.log(`Synced ${messagesToSync.length} messages from IndexedDB to server`);
    } catch (error) {
      console.error('Failed to sync databases:', error);
      throw new Error('Could not sync databases');
    }
  }
}

// Create a singleton instance
const hybridDbService = new HybridDbService();
export default hybridDbService; 