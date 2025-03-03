import { Message } from './db';

// This is a simple AI service that uses basic pattern matching
// In a real application, you would integrate with an AI API like OpenAI
export class AIService {
  // Detect the type of message based on content
  detectMessageType(content: string): 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other' {
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
      
      // Default to link if none of the above
      return 'link';
    }
    
    // Default to text
    return 'text';
  }
  
  // Suggest categories based on content
  suggestCategories(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const categories: string[] = [];
    
    // Define category patterns
    const categoryPatterns = [
      { pattern: /\b(tech|technology|programming|code|developer|software)\b/i, category: 'Technology' },
      { pattern: /\b(recipe|food|cooking|baking|meal|dish)\b/i, category: 'Food' },
      { pattern: /\b(health|fitness|workout|exercise|diet|nutrition)\b/i, category: 'Health & Fitness' },
      { pattern: /\b(finance|money|investing|stock|budget|saving)\b/i, category: 'Finance' },
      { pattern: /\b(travel|vacation|trip|tour|destination|hotel)\b/i, category: 'Travel' },
      { pattern: /\b(education|learning|course|study|tutorial|lesson)\b/i, category: 'Education' },
      { pattern: /\b(entertainment|movie|film|show|series|music|song)\b/i, category: 'Entertainment' },
      { pattern: /\b(news|article|report|update|headline)\b/i, category: 'News' },
      { pattern: /\b(shopping|product|buy|purchase|store|shop)\b/i, category: 'Shopping' },
      { pattern: /\b(tool|utility|app|application|software)\b/i, category: 'Tools' },
    ];
    
    // Check each pattern
    for (const { pattern, category } of categoryPatterns) {
      if (pattern.test(lowerContent)) {
        categories.push(category);
      }
    }
    
    // If no categories matched, add 'Uncategorized'
    if (categories.length === 0) {
      categories.push('Uncategorized');
    }
    
    return categories;
  }
  
  // Extract tags from content
  extractTags(content: string): string[] {
    const tags: string[] = [];
    
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    
    // Extract keywords (simple implementation)
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'for', 'with', 'in', 'on', 'at', 'to', 'from',
      'of', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
      'this', 'that', 'these', 'those', 'it', 'they', 'them', 'their', 'i', 'you', 'he', 'she'
    ]);
    
    const keywordCounts = new Map<string, number>();
    
    for (const word of words) {
      // Skip common words and short words
      if (commonWords.has(word) || word.length < 4) {
        continue;
      }
      
      // Count occurrences
      keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
    }
    
    // Get top keywords
    const sortedKeywords = [...keywordCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
    
    return [...new Set([...tags, ...sortedKeywords])];
  }
  
  // Process a new message
  processMessage(message: Message): Message {
    // If type is not specified, detect it
    if (!message.type) {
      message.type = this.detectMessageType(message.content);
    }
    
    // If category is not specified, suggest one
    if (!message.category) {
      const categories = this.suggestCategories(message.content);
      message.category = categories[0]; // Use the first suggested category
    }
    
    // Extract tags if not provided
    if (!message.tags || message.tags.length === 0) {
      message.tags = this.extractTags(message.content);
    }
    
    return message;
  }
  
  // Search for messages using AI-enhanced search
  enhanceSearch(query: string, messages: Message[]): Message[] {
    const lowerQuery = query.toLowerCase();
    
    // Extract keywords from the query
    const queryKeywords = lowerQuery
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Score each message based on relevance to the query
    const scoredMessages = messages.map(message => {
      let score = 0;
      
      // Check for exact matches in content
      if (message.content.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }
      
      // Check for keyword matches in content
      for (const keyword of queryKeywords) {
        if (message.content.toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
      
      // Check for matches in category
      if (message.category && message.category.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
      
      // Check for matches in tags
      if (message.tags) {
        for (const tag of message.tags) {
          if (tag.toLowerCase().includes(lowerQuery)) {
            score += 3;
          }
          
          for (const keyword of queryKeywords) {
            if (tag.toLowerCase().includes(keyword)) {
              score += 1;
            }
          }
        }
      }
      
      // Boost score for starred items
      if (message.starred) {
        score *= 1.2;
      }
      
      return { message, score };
    });
    
    // Sort by score (highest first) and return messages
    return scoredMessages
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .map(item => item.message);
  }
}

// Create a singleton instance
const aiService = new AIService();

export default aiService; 