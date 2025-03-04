import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return a sanitized version of environment variables for debugging
  return NextResponse.json({
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` : 'Not set',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : 'Not set',
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN ? 
        `${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...` : 'Not set',
      botUsername: process.env.TELEGRAM_BOT_USERNAME || 'Not set',
      publicBotToken: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ? 
        `${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN.substring(0, 10)}...` : 'Not set',
      publicBotUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'Not set',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 
        `${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...` : 'Not set',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 
        `${process.env.TWILIO_AUTH_TOKEN.substring(0, 10)}...` : 'Not set',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not set',
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'Not set',
      whatsappSandboxCode: process.env.TWILIO_WHATSAPP_SANDBOX_CODE || 'Not set',
    },
    nodeEnv: process.env.NODE_ENV || 'Not set',
  });
} 