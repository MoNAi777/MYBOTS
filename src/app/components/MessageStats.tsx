'use client';

import { useState, useEffect } from 'react';
import hybridDbService from '../services/hybridDb';
import { Message } from '../services/db';

export default function MessageStats() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'types' | 'timeline'>('overview');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Load all messages from the database
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const allMessages = await hybridDbService.getMessages();
      setMessages(allMessages);
      setError(null);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on time range
  const getFilteredMessages = (): Message[] => {
    if (timeRange === 'all') return messages;

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return messages.filter(message => {
      const messageDate = new Date(message.createdAt);
      return messageDate >= cutoffDate;
    });
  };

  // Calculate statistics
  const filteredMessages = getFilteredMessages();
  const totalMessages = filteredMessages.length;
  const whatsappMessages = filteredMessages.filter(m => m.source === 'whatsapp').length;
  const telegramMessages = filteredMessages.filter(m => m.source === 'telegram').length;
  const starredMessages = filteredMessages.filter(m => m.starred).length;

  // Message types
  const messageTypes = filteredMessages.reduce((acc, message) => {
    acc[message.type] = (acc[message.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Categories
  const categories = filteredMessages.reduce((acc, message) => {
    if (message.category) {
      acc[message.category] = (acc[message.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Messages by day
  const messagesByDay = filteredMessages.reduce((acc, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort days chronologically
  const sortedDays = Object.keys(messagesByDay).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Get most active day
  let mostActiveDay = { date: '', count: 0 };
  for (const [date, count] of Object.entries(messagesByDay)) {
    if (count > mostActiveDay.count) {
      mostActiveDay = { date, count };
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
        <button 
          onClick={loadMessages}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Message Analytics</h2>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={loadMessages}
            className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {totalMessages === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
          </div>
          <p className="text-gray-700 text-xl mb-2 font-medium">No messages to analyze</p>
          <p className="text-gray-500 max-w-md mx-auto">
            Add some messages first to see analytics and insights about your data
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
              <button
                className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                Overview
              </button>
              <button
                className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                  activeTab === 'sources'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('sources')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Sources
              </button>
              <button
                className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                  activeTab === 'types'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('types')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                Types
              </button>
              <button
                className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                  activeTab === 'timeline'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('timeline')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                Timeline
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Messages</h3>
                <p className="text-3xl font-bold text-indigo-600">{totalMessages}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {starredMessages > 0 && (
                    <div className="flex items-center mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                      </svg>
                      <span>{starredMessages} starred messages</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">WhatsApp</h3>
                <p className="text-3xl font-bold text-green-600">{whatsappMessages}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {totalMessages > 0 && (
                    <div className="flex items-center mt-2">
                      <span>{Math.round((whatsappMessages / totalMessages) * 100)}% of total</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Telegram</h3>
                <p className="text-3xl font-bold text-blue-600">{telegramMessages}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {totalMessages > 0 && (
                    <div className="flex items-center mt-2">
                      <span>{Math.round((telegramMessages / totalMessages) * 100)}% of total</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Most Active Day</h3>
                {mostActiveDay.date ? (
                  <>
                    <p className="text-3xl font-bold text-purple-600">{mostActiveDay.count}</p>
                    <div className="mt-4 text-sm text-gray-500">
                      <div className="flex items-center mt-2">
                        <span>Messages on {new Date(mostActiveDay.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Messages by Source</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        WhatsApp
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {whatsappMessages} ({totalMessages > 0 ? Math.round((whatsappMessages / totalMessages) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div style={{ width: `${totalMessages > 0 ? (whatsappMessages / totalMessages) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                  </div>
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Telegram
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {telegramMessages} ({totalMessages > 0 ? Math.round((telegramMessages / totalMessages) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div style={{ width: `${totalMessages > 0 ? (telegramMessages / totalMessages) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Categories</h3>
                {Object.keys(categories).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(categories)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm font-semibold text-indigo-600">{count} messages</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No categories found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Message Types</h3>
                {Object.keys(messageTypes).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(messageTypes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium capitalize">{type}</span>
                            <span className="text-xs font-semibold text-gray-600">{count} ({Math.round((count / totalMessages) * 100)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${(count / totalMessages) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No message types found</p>
                )}
              </div>
              
              <div className="card p-6 shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Message Type Icons</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Text</p>
                      <p className="text-xs text-gray-500">{messageTypes['text'] || 0} messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Link</p>
                      <p className="text-xs text-gray-500">{messageTypes['link'] || 0} messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-red-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Video</p>
                      <p className="text-xs text-gray-500">{messageTypes['video'] || 0} messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Image</p>
                      <p className="text-xs text-gray-500">{messageTypes['image'] || 0} messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-yellow-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">File</p>
                      <p className="text-xs text-gray-500">{messageTypes['file'] || 0} messages</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Other</p>
                      <p className="text-xs text-gray-500">{messageTypes['other'] || 0} messages</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="card p-6 shadow-md">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Message Timeline</h3>
              {sortedDays.length > 0 ? (
                <div className="space-y-2">
                  {sortedDays.map(day => (
                    <div key={day} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      <div className="flex-grow">
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-4 text-xs flex rounded bg-indigo-200">
                            <div
                              style={{ width: `${(messagesByDay[day] / mostActiveDay.count) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                            >
                              <span className="px-2">{messagesByDay[day]}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No timeline data available</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
} 