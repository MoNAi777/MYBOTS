'use client';

import { useState } from 'react';
import dbService from '../services/db';
import aiService from '../services/ai';

interface AddMessageFormProps {
  onMessageAdded: () => void;
}

export default function AddMessageForm({ onMessageAdded }: AddMessageFormProps) {
  const [content, setContent] = useState('');
  const [source, setSource] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a new message object
      const message = {
        content,
        source,
        type: aiService.detectMessageType(content),
        createdAt: new Date(),
      };
      
      // Process the message with AI to add categories and tags
      const processedMessage = aiService.processMessage(message);
      
      // Save the message to the database
      await dbService.addMessage(processedMessage);
      
      // Clear the form
      setContent('');
      
      // Notify parent component
      onMessageAdded();
    } catch (error) {
      console.error('Error adding message:', error);
      setError('Failed to add message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Message Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your message here..."
          className="input min-h-[120px] w-full"
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
          Source
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="source"
              value="whatsapp"
              checked={source === 'whatsapp'}
              onChange={() => setSource('whatsapp')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-gray-700">WhatsApp</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="source"
              value="telegram"
              checked={source === 'telegram'}
              onChange={() => setSource('telegram')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-gray-700">Telegram</span>
          </label>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            'Add Message'
          )}
        </button>
      </div>
    </form>
  );
} 