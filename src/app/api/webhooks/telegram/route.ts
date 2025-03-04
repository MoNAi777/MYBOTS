import { NextRequest, NextResponse } from 'next/server';
import { MessageReceiverService } from '@/app/services/messageReceiver';
import { telegramConfig } from '@/app/services/telegramConfig';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/app/services/supabaseConfig';

// Initialize services
const messageReceiver = new MessageReceiverService();
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export async function POST(request: NextRequest) {
  console.log('Telegram webhook received');
  
  try {
    // Parse the incoming request body
    const data = await request.json();
    
    // Log the received data for debugging
    console.log('Telegram webhook data:', JSON.stringify(data));
    
    // Check if this is a message update
    if (!data.message || !data.message.text) {
      console.log('Not a text message or missing message content');
      return NextResponse.json({ ok: true });
    }
    
    // Extract the message content
    const messageText = data.message.text;
    const chatId = data.message.chat.id;
    const userId = data.message.from.id;
    
    // Process the incoming message
    const messageId = await messageReceiver.processIncomingMessage(
      messageText,
      'telegram',
      {
        chatId,
        userId,
        telegramMessageId: data.message.message_id,
        username: data.message.from.username,
        firstName: data.message.from.first_name,
        lastName: data.message.from.last_name,
      }
    );
    
    // Log the successful processing
    console.log(`Telegram message processed with ID: ${messageId}`);
    
    // Store webhook event in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'telegram',
      event_type: 'message',
      payload: data,
      processed: true,
      message_id: messageId
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    
    // Store error in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'telegram',
      event_type: 'error',
      payload: { error: error instanceof Error ? error.message : String(error) },
      processed: false
    });
    
    return NextResponse.json(
      { ok: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Telegram webhook endpoint is active' });
} 