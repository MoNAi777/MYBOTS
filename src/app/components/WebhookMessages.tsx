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

  const fetchWebhookMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/receive?showMessages=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch webhook messages: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(data.webhookMessages || []);
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
    
    // Set up polling to check for new messages every 10 seconds
    const intervalId = setInterval(fetchWebhookMessages, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Webhook Messages</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Webhook Messages</h2>
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
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Webhook Messages</h2>
        <button 
          onClick={fetchWebhookMessages}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
      
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No webhook messages received yet. Messages sent to your WhatsApp bot will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    message.source === 'whatsapp' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {message.source === 'whatsapp' ? 'WhatsApp' : 'Telegram'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 text-gray-800 whitespace-pre-wrap">
                {message.content}
              </div>
              
              {message.metadata && Object.keys(message.metadata).length > 0 && (
                <div className="mt-2">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Show metadata
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
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