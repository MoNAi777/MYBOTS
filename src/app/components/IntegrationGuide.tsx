'use client';

import { useState, useEffect } from 'react';
import messageReceiverService from '../services/messageReceiver';
import telegramConfig from '../services/telegramConfig';

interface IntegrationGuideProps {
  whatsappLink: string;
  telegramLink: string;
}

export default function IntegrationGuide({ whatsappLink, telegramLink }: IntegrationGuideProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [showLLMInfo, setShowLLMInfo] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('');
  const [telegramBotUsername, setTelegramBotUsername] = useState('');
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookSetupResult, setWebhookSetupResult] = useState<{success: boolean; message: string} | null>(null);
  
  useEffect(() => {
    // Get WhatsApp number and join code
    setWhatsappNumber(messageReceiverService.getWhatsAppNumber());
    setWhatsappCode(messageReceiverService.getWhatsAppSandboxCode());
    
    // Get Telegram bot username
    setTelegramBotUsername(messageReceiverService.getTelegramBotUsername());
  }, []);
  
  // Setup Telegram webhook
  const setupTelegramWebhook = async () => {
    setIsSettingWebhook(true);
    setWebhookSetupResult(null);
    
    try {
      const baseUrl = window.location.origin;
      const success = await messageReceiverService.setupTelegramWebhook(baseUrl);
      
      if (success) {
        setWebhookSetupResult({
          success: true,
          message: 'Webhook set up successfully! Your Telegram bot is now connected.'
        });
      } else {
        setWebhookSetupResult({
          success: false,
          message: 'Failed to set up webhook. Please check your Telegram bot token.'
        });
      }
    } catch (error) {
      setWebhookSetupResult({
        success: false,
        message: `Error: ${(error as Error).message}`
      });
    } finally {
      setIsSettingWebhook(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 gradient-text">Integration Guide</h2>
      
      <div className="card overflow-hidden shadow-md mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-200">
          <div className="flex">
            <button
              className={`py-3 px-5 font-medium text-sm transition-all flex items-center ${
                activeTab === 'whatsapp'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px bg-white rounded-t-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              WhatsApp
            </button>
            <button
              className={`py-3 px-5 font-medium text-sm transition-all flex items-center ${
                activeTab === 'telegram'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px bg-white rounded-t-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
              onClick={() => setActiveTab('telegram')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l3.9 1.205 2.25 6.54c.122.356.4.61.75.61s.62-.254.75-.609l2.25-6.541 3.9-1.205a2.25 2.25 0 0 0 .126-4.073l-16.5-7.5c-.306-.14-.663-.196-1.022-.215z"></path>
              </svg>
              Telegram
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'whatsapp' ? (
            <div>
              <h3 className="text-lg font-medium mb-5 gradient-text">WhatsApp Integration</h3>
              
              <div className="mb-6 bg-gradient-to-r from-indigo-50 to-violet-50 p-4 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your WhatsApp endpoint URL</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={whatsappLink}
                    readOnly
                    className="input flex-grow"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(whatsappLink);
                      alert('URL copied to clipboard!');
                    }}
                    className="ml-2 btn btn-secondary"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-indigo-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Recommended: Using WhatsApp Bot with Twilio
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Create a WhatsApp bot using Twilio's WhatsApp API - the easiest and most reliable method:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                    <li>Sign up for a <a href="https://www.twilio.com/whatsapp" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Twilio account</a></li>
                    <li>Set up the WhatsApp Sandbox in your Twilio console</li>
                    <li>Configure a webhook to forward messages to your endpoint URL</li>
                    <li>Users can message your WhatsApp number to send data to your platform</li>
                  </ol>
                  <p className="text-sm text-indigo-700 mt-3 font-medium">
                    Perfect for future LLM integration - allows selective message forwarding and preserves context!
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Alternative: Using Automation Tools
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Connect WhatsApp to this platform using no-code automation tools:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                    <li>Use <a href="https://zapier.com" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">Zapier</a> or <a href="https://make.com" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">Make</a> (formerly Integromat)</li>
                    <li>Connect to WhatsApp Business through their integrations</li>
                    <li>Set up a webhook to forward messages to your endpoint URL</li>
                    <li>Format the data according to the API format shown below</li>
                  </ol>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-4 py-2 bg-violet-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-violet-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Quick Start: Manual Forwarding
                  </h4>
                  <p className="text-gray-700 text-sm">
                    While setting up your bot, you can manually copy and paste messages from WhatsApp into this app using the "Add New Message" form.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  API Format
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Send a POST request to the URL with the following JSON body:
                </p>
                <div className="bg-gray-900 text-gray-200 p-5 rounded-xl overflow-x-auto text-sm font-mono shadow-inner">
                  {`{
  "content": "Your message content here",
  "metadata": {
    "originalSender": "John Doe",
    "originalTimestamp": "2023-05-01T12:00:00Z",
    "additionalInfo": "Any additional information",
    "tags": ["important", "work", "meeting"]
  }
}`}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Adding tags in the metadata will help with future LLM training and categorization.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-5 gradient-text">Telegram Integration</h3>
              
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Telegram endpoint URL</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={telegramLink}
                    readOnly
                    className="input flex-grow"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(telegramLink);
                      alert('URL copied to clipboard!');
                    }}
                    className="ml-2 btn btn-secondary"
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {telegramConfig.botToken ? (
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Set up Telegram Webhook</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Connect your Telegram bot to this application by setting up a webhook. This will allow your bot to forward messages to this app.
                  </p>
                  
                  {telegramBotUsername && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-1">Your Telegram bot:</p>
                      <a 
                        href={`https://t.me/${telegramBotUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        @{telegramBotUsername}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                  )}
                  
                  <button
                    onClick={setupTelegramWebhook}
                    disabled={isSettingWebhook}
                    className="btn btn-primary w-full"
                  >
                    {isSettingWebhook ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Setting up webhook...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Set up Webhook
                      </>
                    )}
                  </button>
                  
                  {webhookSetupResult && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                      webhookSetupResult.success 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {webhookSetupResult.success ? (
                            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{webhookSetupResult.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Telegram Bot Token Missing
                  </h4>
                  <p className="text-sm text-gray-700">
                    Please add your Telegram bot token to the <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file to enable webhook setup.
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Create a Telegram Bot (5 minutes)
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Creating a Telegram bot is quick and easy:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                    <li>Open Telegram and search for <span className="font-mono bg-blue-100 px-1 rounded">@BotFather</span></li>
                    <li>Send the command <span className="font-mono bg-blue-100 px-1 rounded">520490
                    /newbot</span> and follow the instructions</li>
                    <li>Copy your bot's API token when provided</li>
                    <li>Add the token and username to your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file:
                      <div className="bg-gray-800 text-gray-200 p-2 rounded mt-1 overflow-x-auto text-xs font-mono">
                        TELEGRAM_BOT_TOKEN=your_bot_token_here<br/>
                        TELEGRAM_BOT_USERNAME=your_bot_username_here
                      </div>
                    </li>
                    <li>Click the "Set up Webhook" button above to connect your bot</li>
                    <li>Users can now message your bot to send data to your platform</li>
                  </ol>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-indigo-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Alternative: Using Automation Tools
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Connect Telegram to this platform using no-code automation tools:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2">
                    <li>Use <a href="https://zapier.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Zapier</a> or <a href="https://make.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Make</a> (formerly Integromat)</li>
                    <li>Connect to Telegram through their integrations</li>
                    <li>Set up a webhook to forward messages to your endpoint URL</li>
                    <li>Format the data according to the API format shown below</li>
                  </ol>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-4 py-2 bg-violet-50/50 rounded-r-lg">
                  <h4 className="font-medium mb-2 flex items-center text-violet-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Quick Start: Manual Forwarding
                  </h4>
                  <p className="text-gray-700 text-sm">
                    While setting up your bot, you can manually copy and paste messages from Telegram into this app using the "Add New Message" form.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  API Format
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you're using a custom integration, send a POST request to the URL with the following JSON body:
                </p>
                <div className="bg-gray-900 text-gray-200 p-5 rounded-xl overflow-x-auto text-sm font-mono shadow-inner">
                  {`{
  "content": "Your message content here",
  "metadata": {
    "originalSender": "John Doe",
    "originalTimestamp": "2023-05-01T12:00:00Z",
    "chatId": "123456789",
    "tags": ["important", "work", "meeting"],
    "additionalInfo": "Any additional information"
  }
}`}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Adding tags in the metadata will help with future LLM training and categorization.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="card p-6 shadow-md bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium gradient-text">Future LLM Integration</h3>
          <button 
            onClick={() => setShowLLMInfo(!showLLMInfo)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showLLMInfo ? 'Hide details' : 'Show details'}
          </button>
        </div>
        
        {showLLMInfo && (
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              This app is designed to work with Large Language Models (LLMs) like GPT-4 to help organize and extract insights from your messages.
            </p>
            <p>
              Future updates will include:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Automatic categorization of messages</li>
              <li>Entity extraction (people, places, dates, etc.)</li>
              <li>Sentiment analysis</li>
              <li>Topic modeling and clustering</li>
              <li>Summarization of conversations</li>
              <li>Question answering based on your message history</li>
            </ul>
            <p>
              By collecting and organizing your messages now, you'll have a valuable dataset ready for these AI-powered features when they're released.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 