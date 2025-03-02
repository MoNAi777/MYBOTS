'use client';

import { useState, useEffect } from 'react';
import dbService from '../services/db';
import { Message } from '../services/db';

export default function MessageStats() {
  const [stats, setStats] = useState({
    total: 0,
    whatsapp: 0,
    telegram: 0,
    starred: 0,
    byType: {
      text: 0,
      link: 0,
      video: 0,
      image: 0,
      file: 0,
      app: 0,
      other: 0
    },
    byCategory: {} as Record<string, number>,
    byMonth: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    setIsLoading(true);
    
    try {
      const messages = await dbService.getMessages();
      
      // Calculate stats
      const newStats = {
        total: messages.length,
        whatsapp: messages.filter(m => m.source === 'whatsapp').length,
        telegram: messages.filter(m => m.source === 'telegram').length,
        starred: messages.filter(m => m.starred).length,
        byType: {
          text: messages.filter(m => m.type === 'text').length,
          link: messages.filter(m => m.type === 'link').length,
          video: messages.filter(m => m.type === 'video').length,
          image: messages.filter(m => m.type === 'image').length,
          file: messages.filter(m => m.type === 'file').length,
          app: messages.filter(m => m.type === 'app').length,
          other: messages.filter(m => m.type === 'other').length
        },
        byCategory: {} as Record<string, number>,
        byMonth: {} as Record<string, number>
      };
      
      // Count by category
      messages.forEach(message => {
        const category = message.category || 'Uncategorized';
        newStats.byCategory[category] = (newStats.byCategory[category] || 0) + 1;
      });
      
      // Count by month
      messages.forEach(message => {
        const date = new Date(message.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        newStats.byMonth[monthYear] = (newStats.byMonth[monthYear] || 0) + 1;
      });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate percentages
  const getPercentage = (value: number) => {
    if (stats.total === 0) return '0%';
    return `${Math.round((value / stats.total) * 100)}%`;
  };
  
  // Format month name
  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };
  
  // Sort months chronologically
  const sortedMonths = Object.keys(stats.byMonth).sort();
  
  // Sort categories by count (descending)
  const sortedCategories = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Show top 10 categories
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading statistics...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 gradient-text">Message Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Messages</h3>
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-gray-500 mb-1">WhatsApp</h3>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-green-700">{stats.whatsapp}</p>
            <span className="ml-2 text-sm font-normal text-green-600 mb-1">{getPercentage(stats.whatsapp)}</span>
          </div>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-sky-50 hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Telegram</h3>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-blue-700">{stats.telegram}</p>
            <span className="ml-2 text-sm font-normal text-blue-600 mb-1">{getPercentage(stats.telegram)}</span>
          </div>
        </div>
        
        <div className="card p-5 bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-md transition-all">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Starred</h3>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-yellow-700">{stats.starred}</p>
            <span className="ml-2 text-sm font-normal text-yellow-600 mb-1">{getPercentage(stats.starred)}</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-4 gradient-text">By Type</h3>
      <div className="card p-6 mb-8 shadow-md">
        <div className="space-y-5">
          {Object.entries(stats.byType).map(([type, count]) => (
            count > 0 && (
              <div key={type}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium capitalize flex items-center">
                    {type === 'text' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                    {type === 'link' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    )}
                    {type === 'image' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    )}
                    {type === 'video' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    )}
                    {type === 'file' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    )}
                    {type === 'app' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      </svg>
                    )}
                    {type === 'other' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    )}
                    {type}
                  </span>
                  <span className="text-sm text-gray-500">{count} ({getPercentage(count)})</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: getPercentage(count) }}
                  ></div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      
      {sortedCategories.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-4 gradient-text">Top Categories</h3>
          <div className="card p-6 mb-8 shadow-md">
            <div className="space-y-5">
              {sortedCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-500">{count} ({getPercentage(count)})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: getPercentage(count) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {sortedMonths.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-4 gradient-text">Messages by Month</h3>
          <div className="card p-6 shadow-md">
            <div className="space-y-5">
              {sortedMonths.map(month => (
                <div key={month}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{formatMonth(month)}</span>
                    <span className="text-sm text-gray-500">{stats.byMonth[month]} ({getPercentage(stats.byMonth[month])})</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: getPercentage(stats.byMonth[month]) }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 