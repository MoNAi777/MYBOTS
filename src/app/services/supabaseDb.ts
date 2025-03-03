import { Message } from './db';
import supabase from './supabase';

class SupabaseDbService {
  async addMessage(message: Message): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('Message')
        .insert({
          content: message.content,
          source: message.source,
          type: message.type,
          category: message.category || null,
          tags: message.tags || [],
          createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
          starred: message.starred || false,
          metadata: message.metadata || null,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error adding message to Supabase:', error);
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
  } = {}): Promise<Message[]> {
    try {
      let query = supabase
        .from('Message')
        .select('*');

      // Apply filters
      if (options.source) {
        query = query.eq('source', options.source);
      }
      if (options.type) {
        query = query.eq('type', options.type);
      }
      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.starred !== undefined) {
        query = query.eq('starred', options.starred);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Order by createdAt descending
      query = query.order('createdAt', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Convert to Message type
      return (data || []).map(item => ({
        id: item.id,
        content: item.content,
        source: item.source as 'whatsapp' | 'telegram',
        type: item.type as 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other',
        category: item.category || undefined,
        tags: item.tags || [],
        createdAt: new Date(item.createdAt),
        starred: item.starred || false,
        metadata: item.metadata || undefined,
      }));
    } catch (error) {
      console.error('Error getting messages from Supabase:', error);
      throw new Error('Could not get messages from database');
    }
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.source !== undefined) updateData.source = updates.source;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.starred !== undefined) updateData.starred = updates.starred;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

      const { error } = await supabase
        .from('Message')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message in Supabase:', error);
      throw new Error('Could not update message in database');
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('Message')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message from Supabase:', error);
      throw new Error('Could not delete message from database');
    }
  }
}

// Create a singleton instance
const supabaseDbService = new SupabaseDbService();
export default supabaseDbService; 