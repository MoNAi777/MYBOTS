'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddMessageForm from './components/AddMessageForm';
import SearchFilters from './components/SearchFilters';
import MessageCard from './components/MessageCard';
import IntegrationGuide from './components/IntegrationGuide';
import MessageStats from './components/MessageStats';
import WebhookMessages from './components/WebhookMessages';
import hybridDbService from './services/hybridDb';
import messageReceiverService from './services/messageReceiver';
import { Message } from './services/db';
import supabaseDbService from './services/supabaseDb';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'setup' | 'stats'>('messages');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [isAddMessageOpen, setIsAddMessageOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [starredFilter, setStarredFilter] = useState('All Items');
  const router = useRouter();
  
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

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching messages with filters:', {
        source: selectedSource !== 'All Sources' ? selectedSource : undefined,
        type: selectedType !== 'All Types' ? selectedType : undefined,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        starred: starredFilter === 'Starred' ? true : undefined,
        searchTerm
      });
      
      // Prepare options for the service
      const options: any = {};
      
      if (selectedSource !== 'All Sources') {
        options.source = selectedSource.toLowerCase();
      }
      
      if (selectedType !== 'All Types') {
        options.type = selectedType.toLowerCase();
      }
      
      if (selectedCategory !== 'All Categories') {
        options.category = selectedCategory;
      }
      
      if (starredFilter === 'Starred') {
        options.starred = true;
      }
      
      // Get messages from the service
      let result = await supabaseDbService.getMessages(options);
      
      // Apply search filter if needed (client-side filtering)
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        result = result.filter(msg => 
          msg.content.toLowerCase().includes(lowerSearchTerm) ||
          (msg.category && msg.category.toLowerCase().includes(lowerSearchTerm)) ||
          (msg.tags && msg.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
        );
      }
      
      console.log(`Found ${result.length} messages`);
      setMessages(result);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Failed to fetch messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new message
  const addNewMessage = () => {
    router.push('/add-message');
  };

  // Handle message starring
  const toggleStar = async (id: number, currentStarred: boolean) => {
    try {
      await supabaseDbService.updateMessage(id, { starred: !currentStarred });
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, starred: !currentStarred } : msg
      ));
    } catch (err: any) {
      console.error('Error updating star status:', err);
      setError(err.message || 'Failed to update star status. Please try again.');
    }
  };

  // Delete a message
  const deleteMessage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await supabaseDbService.deleteMessage(id);
      
      // Update local state
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message. Please try again.');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSource('All Sources');
    setSelectedType('All Types');
    setSelectedCategory('All Categories');
    setStarredFilter('All Items');
  };

  // Apply search and filters
  const applySearch = () => {
    fetchMessages();
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
            <span className="ml-3 text-sm bg-white/20 px-2 py-1 rounded-full text-white font-normal">v0.1</span>
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">Organize and search through your WhatsApp and Telegram messages</p>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              className={`nav-tab flex items-center ${
                activeTab === 'messages'
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Messages
            </button>
            <button
              className={`nav-tab flex items-center ${
                activeTab === 'stats'
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
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
              className={`nav-tab flex items-center ${
                activeTab === 'setup'
                  ? 'nav-tab-active'
                  : 'nav-tab-inactive'
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
              <div className="glass-card p-6 mb-6 shadow-md fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold gradient-text">Add New Message</h2>
                  <button 
                    onClick={() => setIsAddMessageOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close form"
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
                className="btn btn-primary w-full mb-6 py-3 group slide-up"
                onClick={() => setIsAddMessageOpen(true)}
              >
                <svg className="mr-2 group-hover:animate-pulse" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Message
              </button>
            )}
            
            <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100 slide-up">
              <SearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                starredFilter={starredFilter}
                setStarredFilter={setStarredFilter}
                onSearch={applySearch}
                onReset={resetFilters}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
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
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search filters or add a new message.</p>
                <button
                  onClick={() => setIsAddMessageOpen(true)}
                  className="btn btn-primary"
                >
                  Add Your First Message
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {messages.map((message) => (
                  <div key={message.id} className="card-hover fade-in">
                    <MessageCard
                      message={message}
                      onUpdate={fetchMessages}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {isSyncing && (
              <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing with Supabase...
              </div>
            )}
          </>
        ) : activeTab === 'stats' ? (
          <div className="glass-card p-6 fade-in">
            <MessageStats />
          </div>
        ) : (
          <div className="glass-card p-6 fade-in">
            <IntegrationGuide
              whatsappLink={whatsappLink}
              telegramLink={telegramLink}
              onSync={handleSync}
            />
          </div>
        )}
      </div>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Data Organizer. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
