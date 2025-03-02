import { PrismaClient } from '@prisma/client';
import { Message as IndexedDBMessage } from './db';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Message type from Prisma schema
export type PrismaMessage = {
  id?: number;
  content: string;
  source: string; // 'whatsapp' | 'telegram'
  type: string; // 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other'
  category?: string | null;
  tags: string[];
  createdAt: Date;
  starred: boolean;
  metadata?: any | null;
};

class PrismaDbService {
  // Convert IndexedDB message to Prisma message
  private convertToPrismaMessage(message: IndexedDBMessage): Omit<PrismaMessage, 'id'> {
    return {
      content: message.content,
      source: message.source,
      type: message.type,
      category: message.category || null,
      tags: message.tags || [],
      createdAt: message.createdAt,
      starred: message.starred || false,
      metadata: message.metadata || null,
    };
  }

  // Convert Prisma message to IndexedDB message
  private convertToIndexedDBMessage(message: PrismaMessage): IndexedDBMessage {
    return {
      id: message.id,
      content: message.content,
      source: message.source as 'whatsapp' | 'telegram',
      type: message.type as 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other',
      category: message.category || undefined,
      tags: message.tags,
      createdAt: message.createdAt,
      starred: message.starred,
      metadata: message.metadata || undefined,
    };
  }

  async addMessage(message: IndexedDBMessage): Promise<number> {
    try {
      const prismaMessage = this.convertToPrismaMessage(message);
      const result = await prisma.message.create({
        data: prismaMessage,
      });
      return result.id;
    } catch (error) {
      console.error('Error adding message to Prisma DB:', error);
      throw new Error('Could not add message to database');
    }
  }

  async getMessages(options: {
    source?: 'whatsapp' | 'telegram';
    type?: 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other';
    category?: string;
    starred?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<IndexedDBMessage[]> {
    try {
      // Build where clause based on options
      const where: any = {};
      if (options.source) where.source = options.source;
      if (options.type) where.type = options.type;
      if (options.category) where.category = options.category;
      if (options.starred !== undefined) where.starred = options.starred;

      const messages = await prisma.message.findMany({
        where,
        skip: options.offset || 0,
        take: options.limit || undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return messages.map(this.convertToIndexedDBMessage);
    } catch (error) {
      console.error('Error getting messages from Prisma DB:', error);
      throw new Error('Could not get messages from database');
    }
  }

  async updateMessage(id: number, updates: Partial<IndexedDBMessage>): Promise<void> {
    try {
      // Convert updates to Prisma format
      const prismaUpdates: any = {};
      if (updates.content !== undefined) prismaUpdates.content = updates.content;
      if (updates.source !== undefined) prismaUpdates.source = updates.source;
      if (updates.type !== undefined) prismaUpdates.type = updates.type;
      if (updates.category !== undefined) prismaUpdates.category = updates.category;
      if (updates.tags !== undefined) prismaUpdates.tags = updates.tags;
      if (updates.starred !== undefined) prismaUpdates.starred = updates.starred;
      if (updates.metadata !== undefined) prismaUpdates.metadata = updates.metadata;

      await prisma.message.update({
        where: { id },
        data: prismaUpdates,
      });
    } catch (error) {
      console.error('Error updating message in Prisma DB:', error);
      throw new Error('Could not update message in database');
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      await prisma.message.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting message from Prisma DB:', error);
      throw new Error('Could not delete message from database');
    }
  }
}

// Create a singleton instance
const prismaDbService = new PrismaDbService();
export default prismaDbService; 