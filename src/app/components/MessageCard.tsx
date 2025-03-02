'use client';

import { useState } from 'react';
import dbService from '../services/db';
import { Message } from '../services/db';

interface MessageCardProps {
  message: Message;
  onUpdate: () => void;
}

export default function MessageCard({ message, onUpdate }: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(message.category || '');
  const [editedTags, setEditedTags] = useState(message.tags?.join(', ') || '');
  const [editedStarred, setEditedStarred] = useState(message.starred || false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Available categories
  const categories = [
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
  
  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };
  
  // Get icon for message type
  const getTypeIcon = () => {
    switch (message.type) {
      case 'text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'link':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        );
      case 'image':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        );
      case 'file':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'app':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };
  
  // Get source icon
  const getSourceIcon = () => {
    if (message.source === 'whatsapp') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          WhatsApp
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Telegram
        </span>
      );
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!message.id) return;
    
    setIsUpdating(true);
    
    try {
      const tags = editedTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      await dbService.updateMessage(message.id, {
        category: editedCategory,
        tags,
        starred: editedStarred
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!message.id) return;
    
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await dbService.deleteMessage(message.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle toggle star
  const handleToggleStar = async () => {
    if (!message.id) return;
    
    try {
      await dbService.updateMessage(message.id, {
        starred: !message.starred
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating starred status:', error);
    }
  };
  
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-indigo-50 to-violet-50">
              {getTypeIcon()}
            </div>
            {getSourceIcon()}
            {message.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-800">
                {message.category}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleStar}
              className={`p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
                message.starred ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
              }`}
              title={message.starred ? 'Unstar' : 'Star'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={message.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
              title="Delete"
              disabled={isDeleting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        </div>
        
        {message.tags && message.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {message.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 hover:from-indigo-200 hover:to-violet-200 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {formatDate(message.createdAt)}
        </div>
      </div>
      
      {isEditing && (
        <div className="border-t border-gray-200 p-5 bg-gradient-to-br from-gray-50 to-indigo-50/30">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Edit Message</h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor={`category-${message.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id={`category-${message.id}`}
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                className="select w-full"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor={`tags-${message.id}`} className="block text-xs font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id={`tags-${message.id}`}
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="input"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`starred-${message.id}`}
                checked={editedStarred}
                onChange={(e) => setEditedStarred(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`starred-${message.id}`} className="ml-2 block text-sm text-gray-700">
                Starred
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 