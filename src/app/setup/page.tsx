'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Setup() {
  const [telegramBotUsername, setTelegramBotUsername] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load environment variables
    setTelegramBotUsername(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'tmoTiBOT');
    setWhatsappNumber(process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER || '+14155238886');
    setWhatsappCode(process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_SANDBOX_CODE || 'join lips-fur');
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-500 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Data Organizer</h1>
          <p className="text-lg">Setup your integrations</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex mb-4 border-b pb-4">
            <Link href="/" className="flex items-center mr-6 text-gray-600 hover:text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Messages
            </Link>
            <Link href="/statistics" className="flex items-center mr-6 text-gray-600 hover:text-purple-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Statistics
            </Link>
            <Link href="/setup" className="flex items-center text-purple-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Setup
            </Link>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Integration Setup</h2>
          
          <div className="space-y-8">
            {/* Telegram Setup */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-blue-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.269c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.654-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.952z" />
                </svg>
                <h3 className="text-xl font-semibold text-blue-800">Telegram Setup</h3>
              </div>
              
              <p className="mb-4">Follow these steps to forward your Telegram messages to Data Organizer:</p>
              
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Open Telegram and search for <span className="font-mono bg-blue-100 px-1 rounded">{telegramBotUsername}</span></li>
                <li>Start a conversation with the bot by clicking "Start" or sending any message</li>
                <li>Any messages you send to this bot will be automatically saved in Data Organizer</li>
              </ol>
              
              <div className="flex items-center">
                <button 
                  onClick={() => copyToClipboard(telegramBotUsername)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                  Copy Bot Username
                </button>
                {copied && (
                  <span className="ml-3 text-green-600">Copied to clipboard!</span>
                )}
              </div>
            </div>
            
            {/* WhatsApp Setup */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <svg className="w-8 h-8 text-green-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.72.043.433-.101.593zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                <h3 className="text-xl font-semibold text-green-800">WhatsApp Setup</h3>
              </div>
              
              <p className="mb-4">Follow these steps to forward your WhatsApp messages to Data Organizer:</p>
              
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Open WhatsApp on your phone</li>
                <li>Add the following number to your contacts: <span className="font-mono bg-green-100 px-1 rounded">{whatsappNumber}</span></li>
                <li>Send the following message to this number: <span className="font-mono bg-green-100 px-1 rounded">{whatsappCode}</span></li>
                <li>After receiving a confirmation, you can start sending messages to this number</li>
                <li>Any messages you send will be automatically saved in Data Organizer</li>
              </ol>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => copyToClipboard(whatsappNumber)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                  Copy WhatsApp Number
                </button>
                
                <button 
                  onClick={() => copyToClipboard(whatsappCode)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                  Copy Join Code
                </button>
                
                {copied && (
                  <span className="ml-3 text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied to clipboard!
                  </span>
                )}
              </div>
            </div>
            
            {/* Troubleshooting */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Troubleshooting</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">Messages not appearing?</h4>
                  <p>If your messages are not appearing in Data Organizer, try the following:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>Make sure you're sending messages to the correct bot/number</li>
                    <li>Check that your Telegram bot is properly set up</li>
                    <li>For WhatsApp, ensure you've completed the sandbox registration</li>
                    <li>Refresh the page to see new messages</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg">Need more help?</h4>
                  <p>
                    If you're still experiencing issues, please check the application logs or contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-purple-800 text-white py-4 text-center">
        <p>Data Organizer - A PWA for organizing your messages</p>
      </footer>
    </main>
  );
} 