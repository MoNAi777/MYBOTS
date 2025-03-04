export interface Message {
  id?: number;
  content: string;
  source: 'whatsapp' | 'telegram' | 'sms';
  type: 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other';
  category?: string;
  tags?: string[];
  createdAt: Date;
  starred?: boolean;
  metadata?: Record<string, any>;
}

class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'data-organizer-db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is not available in this environment'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error('Error opening database:', event);
        reject(new Error('Could not open database'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
          messagesStore.createIndex('source', 'source', { unique: false });
          messagesStore.createIndex('type', 'type', { unique: false });
          messagesStore.createIndex('category', 'category', { unique: false });
          messagesStore.createIndex('createdAt', 'createdAt', { unique: false });
          messagesStore.createIndex('starred', 'starred', { unique: false });
        }
      };
    });
  }

  async addMessage(message: Message): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      
      // Ensure createdAt is a Date object
      const messageToAdd = {
        ...message,
        createdAt: message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt),
      };
      
      const request = store.add(messageToAdd);

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest<number>).result);
      };

      request.onerror = (event) => {
        console.error('Error adding message:', event);
        reject(new Error('Could not add message'));
      };
    });
  }

  async getMessages(options: {
    source?: 'whatsapp' | 'telegram' | 'sms';
    type?: 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other';
    category?: string;
    starred?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Message[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const messages: Message[] = [];

      let request: IDBRequest;
      
      // If we have a specific filter, use an index
      if (options.source) {
        const index = store.index('source');
        request = index.openCursor(IDBKeyRange.only(options.source));
      } else if (options.type) {
        const index = store.index('type');
        request = index.openCursor(IDBKeyRange.only(options.type));
      } else if (options.category) {
        const index = store.index('category');
        request = index.openCursor(IDBKeyRange.only(options.category));
      } else if (options.starred !== undefined) {
        const index = store.index('starred');
        request = index.openCursor(IDBKeyRange.only(options.starred));
      } else {
        // Otherwise, get all messages
        request = store.openCursor();
      }

      let skipped = 0;
      const offset = options.offset || 0;
      const limit = options.limit || Number.MAX_SAFE_INTEGER;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          // Skip records if offset is specified
          if (skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          // Apply additional filters if needed
          const message = cursor.value as Message;
          let include = true;
          
          if (options.source && message.source !== options.source) include = false;
          if (options.type && message.type !== options.type) include = false;
          if (options.category && message.category !== options.category) include = false;
          if (options.starred !== undefined && message.starred !== options.starred) include = false;
          
          if (include) {
            messages.push(message);
          }
          
          // Stop if we've reached the limit
          if (messages.length < limit) {
            cursor.continue();
          } else {
            resolve(messages);
          }
        } else {
          resolve(messages);
        }
      };

      request.onerror = (event) => {
        console.error('Error getting messages:', event);
        reject(new Error('Could not get messages'));
      };
    });
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.get(id);

      request.onsuccess = (event) => {
        const message = (event.target as IDBRequest<Message>).result;
        if (!message) {
          reject(new Error(`Message with id ${id} not found`));
          return;
        }

        const updatedMessage = { ...message, ...updates };
        const updateRequest = store.put(updatedMessage);

        updateRequest.onsuccess = () => {
          resolve();
        };

        updateRequest.onerror = (event) => {
          console.error('Error updating message:', event);
          reject(new Error('Could not update message'));
        };
      };

      request.onerror = (event) => {
        console.error('Error getting message for update:', event);
        reject(new Error('Could not get message for update'));
      };
    });
  }

  async deleteMessage(id: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error deleting message:', event);
        reject(new Error('Could not delete message'));
      };
    });
  }

  async searchMessages(query: string): Promise<Message[]> {
    const allMessages = await this.getMessages();
    const lowerQuery = query.toLowerCase();
    
    return allMessages.filter(message => {
      // Search in content
      if (message.content.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in category
      if (message.category && message.category.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in tags
      if (message.tags && message.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      return false;
    });
  }
}

// Create a singleton instance
const dbService = new DatabaseService();

export default dbService; 