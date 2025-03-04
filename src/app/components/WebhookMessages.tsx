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
      <div className="glass-card p-6 mb-6 fade-in">
        <h2 className="text-xl font-semibold gradient-text mb-4">Recent Webhook Messages</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 mb-6 fade-in">
        <h2 className="text-xl font-semibold gradient-text mb-4">Recent Webhook Messages</h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchWebhookMessages}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold gradient-text">Recent Webhook Messages</h2>
        <button
          onClick={fetchWebhookMessages}
          className="btn btn-secondary text-sm px-3 py-1.5 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
      {messages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-gray-600">No webhook messages received yet</p>
          <p className="text-sm text-gray-500 mt-1">Messages will appear here when received from WhatsApp or Telegram</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {messages.map((msg, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm slide-up">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  msg.source === 'whatsapp' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {msg.source}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800 text-sm break-words">{msg.content}</p>
              {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <details className="text-xs">
                    <summary className="text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors">
                      View metadata
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-gray-700 overflow-x-auto">
                      {JSON.stringify(msg.metadata, null, 2)}
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