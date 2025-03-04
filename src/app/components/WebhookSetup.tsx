'use client';

import { useState, useEffect } from 'react';
import messageReceiverService from '../services/messageReceiver';

export default function WebhookSetup() {
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookSetupResult, setWebhookSetupResult] = useState<{success: boolean; message: string} | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappCode, setWhatsappCode] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Get Telegram bot username
    setTelegramBotUsername(messageReceiverService.getTelegramBotUsername());
    
    // Get WhatsApp number and join code
    setWhatsappNumber(messageReceiverService.getWhatsAppNumber());
    setWhatsappCode(messageReceiverService.getWhatsAppSandboxCode());
    
    // Get base URL
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  // Setup Telegram webhook
  const setupTelegramWebhook = async () => {
    setIsSettingWebhook(true);
    setWebhookSetupResult(null);
    
    try {
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
    <div className="glass-card p-6 mb-6">
      <h2 className="text-xl font-semibold gradient-text mb-4">Webhook Setup</h2>
      
      <div className="space-y-6">
        {/* Telegram Webhook Setup */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Telegram Webhook Setup</h3>
          
          {telegramBotUsername ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                Connect your Telegram bot <strong>@{telegramBotUsername}</strong> to this application by setting up a webhook.
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Webhook URL:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm mb-2 overflow-x-auto">
                  {baseUrl}/api/receive?source=telegram
                </code>
              </div>
              
              <button
                onClick={setupTelegramWebhook}
                disabled={isSettingWebhook}
                className="btn btn-primary w-full"
              >
                {isSettingWebhook ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Setting up webhook...
                  </>
                ) : (
                  'Set up Telegram Webhook'
                )}
              </button>
              
              {webhookSetupResult && (
                <div className={`mt-4 p-3 rounded-md ${
                  webhookSetupResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {webhookSetupResult.message}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-600">
              Telegram bot credentials not found. Please add TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME to your environment variables.
            </p>
          )}
        </div>
        
        {/* WhatsApp Webhook Setup */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-2">WhatsApp Webhook Setup</h3>
          
          {whatsappNumber ? (
            <>
              <p className="text-sm text-gray-700 mb-4">
                To connect WhatsApp, you need to configure your Twilio WhatsApp Sandbox to forward messages to this application.
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Your WhatsApp Number:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm mb-4">{whatsappNumber}</code>
                
                <p className="text-sm font-medium text-gray-700 mb-1">Webhook URL for Twilio:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm mb-2 overflow-x-auto">
                  {baseUrl}/api/receive?source=whatsapp
                </code>
                
                <p className="text-sm text-gray-600 mt-3">
                  1. Go to the <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Twilio Console</a><br />
                  2. Navigate to Messaging → Try it Out → Send a WhatsApp Message<br />
                  3. Set up your sandbox and configure the webhook URL above<br />
                  4. Users can join your sandbox with code: <strong>{whatsappCode || 'join <your-sandbox-code>'}</strong>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-600">
              WhatsApp credentials not found. Please add TWILIO_WHATSAPP_NUMBER and other Twilio credentials to your environment variables.
            </p>
          )}
        </div>
        
        {/* Environment Variables Check */}
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <h3 className="text-lg font-medium text-purple-800 mb-2">Environment Variables</h3>
          
          <p className="text-sm text-gray-700 mb-4">
            Make sure you have the following environment variables set in your Vercel project:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="bg-gray-100 p-2 rounded">
              <strong>NEXT_PUBLIC_SUPABASE_URL</strong>: Your Supabase URL
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>: Your Supabase anon key
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TELEGRAM_BOT_TOKEN</strong>: Your Telegram bot token
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TELEGRAM_BOT_USERNAME</strong>: Your Telegram bot username
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TWILIO_ACCOUNT_SID</strong>: Your Twilio account SID
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TWILIO_AUTH_TOKEN</strong>: Your Twilio auth token
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TWILIO_PHONE_NUMBER</strong>: Your Twilio phone number
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TWILIO_WHATSAPP_NUMBER</strong>: Your Twilio WhatsApp number
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <strong>TWILIO_WHATSAPP_SANDBOX_CODE</strong>: Your WhatsApp sandbox join code
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 