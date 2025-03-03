import { Message } from './db';

// This is a simple AI service that uses basic pattern matching
// In a real application, you would integrate with an AI API like OpenAI
export class AIService {
  // Detect the type of message based on content
  detectMessageType(content: string): 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other' {
    try {
      if (!content) return 'text';
      
      const lowerContent = content.toLowerCase();
      
      // Check for links
      if (
        lowerContent.includes('http://') || 
        lowerContent.includes('https://') || 
        lowerContent.includes('www.')
      ) {
        // Check for video links
        if (
          lowerContent.includes('youtube.com') || 
          lowerContent.includes('youtu.be') || 
          lowerContent.includes('vimeo.com') || 
          lowerContent.includes('tiktok.com') ||
          lowerContent.includes('mp4') ||
          lowerContent.includes('video')
        ) {
          return 'video';
        }
        
        // Check for image links
        if (
          lowerContent.includes('jpg') || 
          lowerContent.includes('jpeg') || 
          lowerContent.includes('png') || 
          lowerContent.includes('gif') ||
          lowerContent.includes('image')
        ) {
          return 'image';
        }
        
        // Check for app links
        if (
          lowerContent.includes('app') || 
          lowerContent.includes('play.google.com') || 
          lowerContent.includes('apps.apple.com')
        ) {
          return 'app';
        }
        
        // Check for file links
        if (
          lowerContent.includes('pdf') || 
          lowerContent.includes('doc') || 
          lowerContent.includes('xls') || 
          lowerContent.includes('ppt') || 
          lowerContent.includes('zip') || 
          lowerContent.includes('file')
        ) {
          return 'file';
        }
        
        // If it has a link but doesn't match any specific type, it's a generic link
        return 'link';
      }
      
      // Default to text
      return 'text';
    } catch (error) {
      console.error('Error detecting message type:', error);
      return 'text'; // Default to text on error
    }
  }
  
  // Suggest categories based on content
  suggestCategories(content: string): string[] {
    try {
      if (!content) return [];
      
      const lowerContent = content.toLowerCase();
      const categories: string[] = [];
      
      // Work-related
      if (
        lowerContent.includes('meeting') || 
        lowerContent.includes('project') || 
        lowerContent.includes('deadline') || 
        lowerContent.includes('client') || 
        lowerContent.includes('work')
      ) {
        categories.push('Work');
      }
      
      // Personal
      if (
        lowerContent.includes('family') || 
        lowerContent.includes('friend') || 
        lowerContent.includes('personal') || 
        lowerContent.includes('home')
      ) {
        categories.push('Personal');
      }
      
      // Ideas
      if (
        lowerContent.includes('idea') || 
        lowerContent.includes('thought') || 
        lowerContent.includes('concept')
      ) {
        categories.push('Ideas');
      }
      
      // Return the first category or undefined if none
      return categories;
    } catch (error) {
      console.error('Error suggesting categories:', error);
      return []; // Return empty array on error
    }
  }
  
  // Extract tags from content
  extractTags(content: string): string[] {
    try {
      if (!content) return [];
      
      const tags: string[] = [];
      
      // Extract hashtags
      const hashtagRegex = /#(\w+)/g;
      let match;
      while ((match = hashtagRegex.exec(content)) !== null) {
        tags.push(match[1].toLowerCase());
      }
      
      // Extract keywords
      const lowerContent = content.toLowerCase();
      const keywords = [
        'urgent', 'important', 'reminder', 'todo', 'task',
        'meeting', 'call', 'email', 'message', 'note',
        'idea', 'project', 'client', 'deadline', 'follow-up'
      ];
      
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword) && !tags.includes(keyword)) {
          tags.push(keyword);
        }
      }
      
      return tags;
    } catch (error) {
      console.error('Error extracting tags:', error);
      return []; // Return empty array on error
    }
  }
  
  // Process a message to add AI-generated metadata
  processMessage(message: Message): Message {
    try {
      // Make a copy of the message to avoid modifying the original
      const processedMessage: Message = { ...message };
      
      // Detect message type if not already set
      if (!processedMessage.type) {
        processedMessage.type = this.detectMessageType(processedMessage.content);
      }
      
      // Suggest categories
      const categories = this.suggestCategories(processedMessage.content);
      if (categories.length > 0) {
        processedMessage.category = categories[0];
      }
      
      // Extract tags
      processedMessage.tags = this.extractTags(processedMessage.content);
      
      return processedMessage;
    } catch (error) {
      console.error('Error processing message with AI:', error);
      return message; // Return the original message on error
    }
  }
  
  // Enhance search results using AI
  enhanceSearch(query: string, messages: Message[]): Message[] {
    try {
      if (!query || !messages || messages.length === 0) {
        return messages;
      }
      
      const lowerQuery = query.toLowerCase();
      
      // Score each message based on relevance to the query
      const scoredMessages = messages.map(message => {
        let score = 0;
        
        // Check content for query terms
        if (message.content.toLowerCase().includes(lowerQuery)) {
          score += 10;
        }
        
        // Check category
        if (message.category && message.category.toLowerCase().includes(lowerQuery)) {
          score += 5;
        }
        
        // Check tags
        if (message.tags) {
          for (const tag of message.tags) {
            if (tag.toLowerCase().includes(lowerQuery)) {
              score += 3;
            }
          }
        }
        
        return { message, score };
      });
      
      // Sort by score (descending)
      scoredMessages.sort((a, b) => b.score - a.score);
      
      // Return messages with a score > 0
      return scoredMessages
        .filter(item => item.score > 0)
        .map(item => item.message);
    } catch (error) {
      console.error('Error enhancing search:', error);
      return messages; // Return the original messages on error
    }
  }
}

// Create a singleton instance
const aiService = new AIService();

export default aiService; 