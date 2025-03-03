'use client';

import { useState } from 'react';
import { Message } from '../services/db';
import hybridDbService from '../services/hybridDb';

interface MessageCardProps {
  message: Message;
  onUpdate: () => void;
}

export default function MessageCard({ message, onUpdate }: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [editedCategory, setEditedCategory] = useState(message.category || '');
  const [editedTags, setEditedTags] = useState(message.tags?.join(', ') || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle star toggle
  const handleStarToggle = async () => {
    setIsUpdating(true);
    try {
      await hybridDbService.updateMessage(message.id!, {
        ...message,
        starred: !message.starred,
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      const tagsArray = editedTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await hybridDbService.updateMessage(message.id!, {
        ...message,
        content: editedContent,
        category: editedCategory || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
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
    if (confirm('Are you sure you want to delete this message?')) {
      setIsDeleting(true);
      try {
        await hybridDbService.deleteMessage(message.id!);
        onUpdate();
      } catch (error) {
        console.error('Error deleting message:', error);
        setIsDeleting(false);
      }
    }
  };

  // Get source icon
  const getSourceIcon = () => {
    switch (message.source) {
      case 'whatsapp':
        return (
          <div className="message-source-icon whatsapp">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        );
      case 'telegram':
        return (
          <div className="message-source-icon telegram">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="message-source-icon manual">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`message-card ${message.source}`}>
      <div className="message-card-header">
        <div className="flex items-center">
          {getSourceIcon()}
          <span className="message-date">{formatDate(message.createdAt)}</span>
          {message.type && (
            <span className="message-type">{message.type}</span>
          )}
        </div>
        <div className="message-actions">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="action-button"
            title="Show metadata"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <button
            onClick={handleStarToggle}
            disabled={isUpdating}
            className={`action-button ${message.starred ? 'starred' : ''}`}
            title={message.starred ? 'Unstar message' : 'Star message'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={message.starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="action-button"
            title="Edit message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="action-button delete"
            title="Delete message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="message-edit-form">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            placeholder="Message content"
          />
          <div className="edit-fields">
            <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="edit-input"
              placeholder="Category"
            />
            <input
              type="text"
              value={editedTags}
              onChange={(e) => setEditedTags(e.target.value)}
              className="edit-input"
              placeholder="Tags (comma separated)"
            />
          </div>
          <div className="edit-actions">
            <button
              onClick={() => setIsEditing(false)}
              className="cancel-button"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="save-button"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="message-content">
            {message.content}
          </div>
          
          {(message.category || (message.tags && message.tags.length > 0)) && (
            <div className="message-metadata">
              {message.category && (
                <span className="message-category">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  {message.category}
                </span>
              )}
              {message.tags && message.tags.length > 0 && (
                <div className="message-tags">
                  {message.tags.map((tag, index) => (
                    <span key={index} className="message-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {showMetadata && message.metadata && (
            <div className="message-raw-metadata">
              <h4>Metadata</h4>
              <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
} 