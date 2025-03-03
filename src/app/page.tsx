'use client';

import { useState, useEffect } from 'react';
import AddMessageForm from './components/AddMessageForm';
import SearchFilters from './components/SearchFilters';
import MessageCard from './components/MessageCard';
import IntegrationGuide from './components/IntegrationGuide';
import MessageStats from './components/MessageStats';
import WebhookMessages from './components/WebhookMessages';
import hybridDbService from './services/hybridDb';
import messageReceiverService from './services/messageReceiver';
import { Message } from './services/db';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'setup' | 'stats'>('messages');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [isAddMessageOpen, setIsAddMessageOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Load messages on component mount
  useEffect(() => {
    loadMessages();
    
    // Get deep links
    if (typeof window !== 'undefined') {
      setWhatsappLink(messageReceiverService.getWhatsAppDeepLink());
      setTelegramLink(messageReceiverService.getTelegramDeepLink());
    }
  }, []);
  
  // Load all messages from the database
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const allMessages = await hybridDbService.getMessages();
      setMessages(allMessages.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle message added
  const handleMessageAdded = () => {
    loadMessages();
    setIsAddMessageOpen(false);
  };
  
  // Sync databases when online
  const handleSync = async () => {
    if (typeof window === 'undefined') return;
    
    setIsSyncing(true);
    try {
      await hybridDbService.syncDatabases();
      await loadMessages();
    } catch (error) {
      console.error('Error syncing databases:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Handle search results
  const handleSearchResults = (results: Message[]) => {
    setMessages(results.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }));
  };
  
  // Handle search reset
  const handleSearchReset = () => {
    loadMessages();
  };
  
  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTI4MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTEyODAgMy40QzEwNTAuNTkgMTggMTAxOS40IDg0Ljg5IDczNC40MiA4NC44OWMtMzIwIDAtMzIwLTg0LjMtNjQwLTg0LjNDNTkuNC41OSAyOC4yIDEuNiAwIDMuNFYxNDBoMTI4MHoiIGZpbGwtb3BhY2l0eT0iLjMiLz48cGF0aCBkPSJNMCAyNC4zMWM0My40Ni01LjY5IDk0LjU2LTkuMjUgMTU4LjQyLTkuMjUgMzIwIDAgMzIwIDg5LjI0IDY0MCA4OS4yNCAyNTYuMTMgMCAzMDcuMjgtNTcuMTYgNDgxLjU4LTgwVjE0MEgweiIgZmlsbC1vcGFjaXR5PSIuNSIvPjxwYXRoIGQ9Ik0xMjgwIDUxLjc2Yy0yMDEgMTIuNDktMjQyLjQzIDUzLjQtNTEzLjU4IDUzLjQtMzIwIDAtMzIwLTU3LTY0MC01Ny00OC44NS4wMS05MC4yMSAxLjM1LTEyNi40MiAzLjZWMTQwaDEyODB6Ii8+PC9nPjwvc3ZnPg==')]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Data Organizer
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">Organize and search through your WhatsApp and Telegram messages</p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'messages'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Messages
            </button>
            <button
              className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'stats'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              Statistics
            </button>
            <button
              className={`py-3 px-5 font-medium text-sm transition-colors flex items-center ${
                activeTab === 'setup'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('setup')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Setup
            </button>
          </div>
        </div>
        
        {activeTab === 'messages' ? (
          <>
            {isAddMessageOpen ? (
              <div className="card p-6 mb-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold gradient-text">Add New Message</h2>
                  <button 
                    onClick={() => setIsAddMessageOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <AddMessageForm onMessageAdded={handleMessageAdded} />
              </div>
            ) : (
              <button
                className="btn btn-primary w-full mb-6 py-3 group"
                onClick={() => setIsAddMessageOpen(true)}
              >
                <svg className="mr-2 group-hover:animate-pulse" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Message
              </button>
            )}
            
            <div className="card p-6 mb-6 shadow-md">
              <SearchFilters onSearch={handleSearchResults} onReset={handleSearchReset} />
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 gradient-text">Your Messages</h2>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                  <p className="mt-4 text-gray-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700 text-xl mb-2 font-medium">No messages found</p>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Add a new message or check the Setup tab to learn how to forward messages from WhatsApp and Telegram
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      onUpdate={loadMessages}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'stats' ? (
          <MessageStats />
        ) : (
          <>
            <IntegrationGuide whatsappLink={whatsappLink} telegramLink={telegramLink} />
            <div className="mt-8">
              <WebhookMessages />
            </div>
          </>
        )}
      </div>
      
      <footer className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white mt-auto py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTI4MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTAgNDcuNDRMMTcwIDBsNjI2LjQ4IDk0LjA5TDExMTAgODcuMTFsMTcwLTM5LjY3VjE0MEgweiIgZmlsbC1vcGFjaXR5PSIuNSIvPjxwYXRoIGQ9Ik0wIDkwLjcybDE0MC0yOC4yOCAzMTUuNTIgMjQuMTRMNzk2LjQ4IDY1LjggMTE0MCAxMDQuODlsMTQwLTE0LjE3VjE0MEgweiIvPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-lg font-medium">Data Organizer - A PWA for organizing your messages</p>
          <p className="mt-1 text-indigo-100">All data is stored locally on your device</p>
        </div>
      </footer>
    </main>
  );
}
