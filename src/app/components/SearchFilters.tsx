'use client';

import { useState } from 'react';
import dbService from '../services/db';
import aiService from '../services/ai';
import { Message } from '../services/db';

interface SearchFiltersProps {
  onSearch: (results: Message[]) => void;
  onReset: () => void;
}

export default function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | 'whatsapp' | 'telegram'>('all');
  const [type, setType] = useState<'all' | 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other'>('all');
  const [category, setCategory] = useState<string>('all');
  const [starred, setStarred] = useState<'all' | 'starred' | 'not-starred'>('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Available categories
  const categories = [
    'All Categories',
    'Technology',
    'Food',
    'Health & Fitness',
    'Finance',
    'Travel',
    'Education',
    'Entertainment',
    'News',
    'Shopping',
    'Tools',
    'Uncategorized'
  ];
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      // Get all messages first
      let allMessages = await dbService.getMessages();
      
      // Apply filters
      let filteredMessages = allMessages;
      
      // Filter by source
      if (source !== 'all') {
        filteredMessages = filteredMessages.filter(message => message.source === source);
      }
      
      // Filter by type
      if (type !== 'all') {
        filteredMessages = filteredMessages.filter(message => message.type === type);
      }
      
      // Filter by category
      if (category !== 'all' && category !== 'All Categories') {
        filteredMessages = filteredMessages.filter(message => message.category === category);
      }
      
      // Filter by starred status
      if (starred === 'starred') {
        filteredMessages = filteredMessages.filter(message => message.starred === true);
      } else if (starred === 'not-starred') {
        filteredMessages = filteredMessages.filter(message => message.starred !== true);
      }
      
      // Apply search query if provided
      if (query.trim()) {
        filteredMessages = aiService.enhanceSearch(query, filteredMessages);
      }
      
      // Return results
      onSearch(filteredMessages);
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleReset = () => {
    setQuery('');
    setSource('all');
    setType('all');
    setCategory('all');
    setStarred('all');
    onReset();
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Search & Filter</h3>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="input"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value as 'all' | 'whatsapp' | 'telegram')}
              className="select w-full"
            >
              <option value="all">All Sources</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'all' | 'text' | 'link' | 'video' | 'image' | 'file' | 'app' | 'other')}
              className="select w-full"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="link">Link</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
              <option value="file">File</option>
              <option value="app">App</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="starred" className="block text-sm font-medium text-gray-700 mb-1">
              Starred
            </label>
            <select
              id="starred"
              value={starred}
              onChange={(e) => setStarred(e.target.value as 'all' | 'starred' | 'not-starred')}
              className="select w-full"
            >
              <option value="all">All Items</option>
              <option value="starred">Starred Only</option>
              <option value="not-starred">Not Starred</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 