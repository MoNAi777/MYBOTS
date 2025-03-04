'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Statistics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [messagesBySource, setMessagesBySource] = useState<{source: string, count: number}[]>([]);
  const [messagesByType, setMessagesByType] = useState<{type: string, count: number}[]>([]);
  const [messagesByCategory, setMessagesByCategory] = useState<{category: string, count: number}[]>([]);
  const [starredMessages, setStarredMessages] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all messages
      const { data: messages, error, count } = await supabase
        .from('Message')
        .select('*', { count: 'exact' });

      if (error) throw error;
      
      const totalCount = count || 0;
      setTotalMessages(totalCount);

      if (!messages || messages.length === 0) {
        setIsLoading(false);
        return;
      }

      // Calculate messages by source
      const sourceMap = new Map<string, number>();
      messages.forEach(msg => {
        const source = msg.source || 'unknown';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      
      const sourceStats = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count
      }));
      setMessagesBySource(sourceStats);

      // Calculate messages by type
      const typeMap = new Map<string, number>();
      messages.forEach(msg => {
        const type = msg.type || 'unknown';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
      
      const typeStats = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count
      }));
      setMessagesByType(typeStats);

      // Calculate messages by category
      const categoryMap = new Map<string, number>();
      messages.forEach(msg => {
        const category = msg.category || 'uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      
      const categoryStats = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count
      }));
      setMessagesByCategory(categoryStats);

      // Count starred messages
      const starredCount = messages.filter(msg => msg.starred).length;
      setStarredMessages(starredCount);

    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get color based on source
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'telegram':
        return 'bg-blue-500';
      case 'whatsapp':
        return 'bg-green-500';
      case 'manual':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Helper function to get color based on type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-indigo-500';
      case 'image':
        return 'bg-pink-500';
      case 'video':
        return 'bg-red-500';
      case 'audio':
        return 'bg-yellow-500';
      case 'document':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-500 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Data Organizer</h1>
          <p className="text-lg">Message Statistics</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex mb-4 border-b pb-4">
            <Link href="/" className="flex items-center mr-6 text-gray-600 hover:text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Messages
            </Link>
            <Link href="/statistics" className="flex items-center mr-6 text-purple-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Statistics
            </Link>
            <Link href="/setup" className="flex items-center text-gray-600 hover:text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Setup
            </Link>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Message Statistics</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              Error: {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-medium mb-2">Total Messages</h3>
                  <p className="text-3xl font-bold">{totalMessages}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-medium mb-2">Telegram Messages</h3>
                  <p className="text-3xl font-bold">
                    {messagesBySource.find(item => item.source === 'telegram')?.count || 0}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-medium mb-2">WhatsApp Messages</h3>
                  <p className="text-3xl font-bold">
                    {messagesBySource.find(item => item.source === 'whatsapp')?.count || 0}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-medium mb-2">Starred Messages</h3>
                  <p className="text-3xl font-bold">{starredMessages}</p>
                </div>
              </div>
              
              {/* Messages by Source */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Messages by Source</h3>
                
                {messagesBySource.length === 0 ? (
                  <p className="text-gray-500">No data available</p>
                ) : (
                  <div className="space-y-4">
                    {messagesBySource.map((item) => (
                      <div key={item.source} className="bg-white p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getSourceColor(item.source)}`}></span>
                            <span className="font-medium capitalize">{item.source}</span>
                          </div>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${getSourceColor(item.source)}`} 
                            style={{ width: `${(item.count / totalMessages) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Messages by Type */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Messages by Type</h3>
                
                {messagesByType.length === 0 ? (
                  <p className="text-gray-500">No data available</p>
                ) : (
                  <div className="space-y-4">
                    {messagesByType.map((item) => (
                      <div key={item.type} className="bg-white p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getTypeColor(item.type)}`}></span>
                            <span className="font-medium capitalize">{item.type}</span>
                          </div>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${getTypeColor(item.type)}`} 
                            style={{ width: `${(item.count / totalMessages) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Messages by Category */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Messages by Category</h3>
                
                {messagesByCategory.length === 0 ? (
                  <p className="text-gray-500">No data available</p>
                ) : (
                  <div className="space-y-4">
                    {messagesByCategory.map((item) => (
                      <div key={item.category || 'uncategorized'} className="bg-white p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{item.category || 'Uncategorized'}</span>
                          <span className="font-bold">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full bg-purple-500" 
                            style={{ width: `${(item.count / totalMessages) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="bg-purple-800 text-white py-4 text-center">
        <p>Data Organizer - A PWA for organizing your messages</p>
      </footer>
    </main>
  );
} 