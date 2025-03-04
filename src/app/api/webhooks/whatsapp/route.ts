import { NextRequest, NextResponse } from 'next/server';
import { MessageReceiverService } from '@/app/services/messageReceiver';
import { twilioConfig } from '@/app/services/twilioConfig';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/app/services/supabaseConfig';

// Initialize services
const messageReceiver = new MessageReceiverService();
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export async function POST(request: NextRequest) {
  console.log('WhatsApp webhook received - START');
  
  try {
    // Log the raw request
    const clone1 = request.clone();
    const rawBody = await clone1.text();
    console.log('WhatsApp webhook raw request:', rawBody);
    
    // Parse the incoming request body
    const clone2 = request.clone();
    const formData = await clone2.formData();
    
    // Log the received data for debugging
    console.log('WhatsApp webhook data:', Object.fromEntries(formData.entries()));
    
    // Extract the message content from Twilio's format
    const messageBody = formData.get('Body')?.toString() || '';
    const from = formData.get('From')?.toString() || '';
    
    console.log('WhatsApp message content:', { messageBody, from });
    
    if (!messageBody) {
      console.error('No message body found in WhatsApp webhook');
      return NextResponse.json({ error: 'No message body found' }, { status: 400 });
    }
    
    // Process the incoming message
    const messageId = await messageReceiver.processIncomingMessage(
      messageBody,
      'whatsapp',
      {
        from,
        twilioMessageSid: formData.get('MessageSid')?.toString(),
        twilioAccountSid: formData.get('AccountSid')?.toString(),
      }
    );
    
    // Log the successful processing
    console.log(`WhatsApp message processed with ID: ${messageId}`);
    
    // Store webhook event in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'whatsapp',
      event_type: 'message',
      payload: Object.fromEntries(formData.entries()),
      processed: true,
      message_id: messageId
    });
    
    // Return a TwiML response (Twilio expects this)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Message received and processed.</Message>
      </Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    
    // Store error in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'whatsapp',
      event_type: 'error',
      payload: { error: error instanceof Error ? error.message : String(error) },
      processed: false
    });
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'WhatsApp webhook endpoint is active' });
} 