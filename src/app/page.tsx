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
    try {
      setIsLoading(true);
      const allMessages = await hybridDbService.getAllMessages();
      setMessages(allMessages);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle message added
  const handleMessageAdded = () => {
    setIsAddMessageOpen(false);
    loadMessages();
  };
  
  // Handle sync with Supabase
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await hybridDbService.syncWithSupabase();
      loadMessages();
    } catch (err) {
      console.error('Error syncing with Supabase:', err);
      setError('Failed to sync with Supabase. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Handle search results
  const handleSearchResults = (results: Message[]) => {
    setMessages(results);
  };
  
  // Handle search reset
  const handleSearchReset = () => {
    loadMessages();
  };
  
  // Fetch messages
  const fetchMessages = async () => {
    await loadMessages();
  };
  
  // Add new message
  const addNewMessage = () => {
    setIsAddMessageOpen(true);
  };
  
  // Toggle star
  const toggleStar = async (id: number, currentStarred: boolean) => {
    try {
      await hybridDbService.updateMessage(id, { starred: !currentStarred });
      loadMessages();
    } catch (err) {
      console.error('Error toggling star:', err);
      setError('Failed to update message. Please try again.');
    }
  };
  
  // Delete message
  const deleteMessage = async (id: number) => {
    try {
      await hybridDbService.deleteMessage(id);
      loadMessages();
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message. Please try again.');
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSource('All Sources');
    setSelectedType('All Types');
    setSelectedCategory('All Categories');
    setStarredFilter('All Items');
    loadMessages();
  };
  
  // Apply search
  const applySearch = () => {
    fetchMessages();
  };

  return (
    <main className="min-h-screen">
      {/* Topbar */}
      <div className="topbar">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <span className="ml-3 px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">v0.1</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSync} 
              className="btn btn-secondary text-sm flex items-center"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <polyline points="23 20 23 14 17 14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                  </svg>
                  Sync
                </>
              )}
            </button>
            <button
              onClick={addNewMessage}
              className="btn btn-primary text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Message
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Messages</p>
                <h3 className="text-2xl font-bold text-white mt-1">{messages.length}</h3>
              </div>
              <div className="p-3 rounded-lg bg-indigo-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                12% increase
              </span>
              <span className="text-slate-400 ml-2">from last week</span>
            </div>
          </div>
          
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">WhatsApp</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {messages.filter(m => m.source === 'whatsapp').length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-green-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                8% increase
              </span>
              <span className="text-slate-400 ml-2">from last week</span>
            </div>
          </div>
          
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Telegram</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {messages.filter(m => m.source === 'telegram').length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                15% increase
              </span>
              <span className="text-slate-400 ml-2">from last week</span>
            </div>
          </div>
          
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Starred</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {messages.filter(m => m.starred).length}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-yellow-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span className="text-green-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                5% increase
              </span>
              <span className="text-slate-400 ml-2">from last week</span>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-bold text-white mb-4 md:mb-0">Messages</h2>
            <div className="flex space-x-2">
              <button
                className={`nav-tab ${activeTab === 'messages' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
              <button
                className={`nav-tab ${activeTab === 'stats' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                onClick={() => setActiveTab('stats')}
              >
                Statistics
              </button>
              <button
                className={`nav-tab ${activeTab === 'setup' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                onClick={() => setActiveTab('setup')}
              >
                Setup
              </button>
            </div>
          </div>
          
          {activeTab === 'messages' ? (
            <>
              {isAddMessageOpen ? (
                <div className="glass-card p-6 mb-6 fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold gradient-text">Add New Message</h3>
                    <button 
                      onClick={() => setIsAddMessageOpen(false)}
                      className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-700"
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
              ) : null}
              
              <div className="mb-6 bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-700 slide-up">
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
                <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No messages found</h3>
                  <p className="text-slate-400 mb-6">Try adjusting your search filters or add a new message.</p>
                  <button
                    onClick={() => setIsAddMessageOpen(true)}
                    className="btn btn-primary"
                  >
                    Add Your First Message
                  </button>
                </div>
              ) : (
                <div className="dashboard-grid">
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
            </>
          ) : activeTab === 'stats' ? (
            <div className="fade-in">
              <MessageStats />
            </div>
          ) : (
            <div className="fade-in">
              <IntegrationGuide
                whatsappLink={whatsappLink}
                telegramLink={telegramLink}
                onSync={handleSync}
              />
            </div>
          )}
        </div>
        
        {/* Recent Webhook Messages */}
        <WebhookMessages />
      </div>
      
      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Data Organizer. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
