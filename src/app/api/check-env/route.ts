import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../services/supabase';

export async function GET(request: NextRequest) {
  // Check if environment variables are set
  const envStatus = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      connection: false
    },
    telegram: {
      botToken: !!process.env.TELEGRAM_BOT_TOKEN || !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
      botUsername: !!process.env.TELEGRAM_BOT_USERNAME || !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
    },
    twilio: {
      accountSid: !!process.env.TWILIO_ACCOUNT_SID,
      authToken: !!process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
      whatsappNumber: !!process.env.TWILIO_WHATSAPP_NUMBER
    }
  };
  
  // Check Supabase connection
  try {
    const { data, error } = await supabase.from('Message').select('count(*)', { count: 'exact' }).limit(1);
    envStatus.supabase.connection = !error;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
  }
  
  // Return the environment status
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    envStatus
  });
} 