'use client';

import { useState, useEffect } from 'react';

interface WebhookMessage {
  content: string;
  source: 'whatsapp' | 'telegram';
  metadata: Record<string, any>;
  timestamp: string;
}

export default function WebhookMessages() {
  const [messages, setMessages] = useState<WebhookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'all' | 'whatsapp' | 'telegram'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWebhookMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receive?showMessages=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch webhook messages: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.webhookMessages || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching webhook messages:', err);
      setError('Failed to load webhook messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookMessages();
    
    // Set up polling to check for new messages if autoRefresh is enabled
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(fetchWebhookMessages, 10000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  // Filter messages based on active source
  const filteredMessages = activeSource === 'all' 
    ? messages 
    : messages.filter(message => message.source === activeSource);

  // Count messages by source
  const whatsappCount = messages.filter(m => m.source === 'whatsapp').length;
  const telegramCount = messages.filter(m => m.source === 'telegram').length;

  if (loading && messages.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 gradient-text">Recent Webhook Messages</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 gradient-text">Recent Webhook Messages</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
        <button 
          onClick={fetchWebhookMessages}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold gradient-text mb-3 sm:mb-0">Recent Webhook Messages</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveSource('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                activeSource === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({messages.length})
            </button>
            <button 
              onClick={() => setActiveSource('whatsapp')}
              className={`px-3 py-1 text-sm rounded-full ${
                activeSource === 'whatsapp' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              WhatsApp ({whatsappCount})
            </button>
            <button 
              onClick={() => setActiveSource('telegram')}
              className={`px-3 py-1 text-sm rounded-full ${
                activeSource === 'telegram' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Telegram ({telegramCount})
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchWebhookMessages}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              Refresh
            </button>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 text-sm rounded flex items-center ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${autoRefresh ? 'text-green-500' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
            </button>
          </div>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {filteredMessages.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-700 font-medium mb-2">No webhook messages received yet</p>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeSource === 'all' 
              ? 'Messages sent to your WhatsApp or Telegram bot will appear here.' 
              : `Messages sent to your ${activeSource === 'whatsapp' ? 'WhatsApp' : 'Telegram'} bot will appear here.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message, index) => (
            <div key={index} className={`border rounded-lg p-4 transition-all hover:shadow-md ${
              message.source === 'whatsapp' 
                ? 'hover:border-green-200 hover:bg-green-50' 
                : 'hover:border-blue-200 hover:bg-blue-50'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {message.source === 'whatsapp' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.347.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      Telegram
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 text-gray-800 whitespace-pre-wrap">
                {message.content}
              </div>
              
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <div className="mt-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700 inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Show metadata
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
                      {JSON.stringify(message.metadata, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 