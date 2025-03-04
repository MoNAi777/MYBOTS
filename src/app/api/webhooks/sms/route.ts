import { NextRequest, NextResponse } from 'next/server';
import { MessageReceiverService } from '@/app/services/messageReceiver';
import { twilioConfig } from '@/app/services/twilioConfig';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/app/services/supabaseConfig';

// Initialize services
const messageReceiver = new MessageReceiverService();
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export async function POST(request: NextRequest) {
  console.log('SMS webhook received - START');
  
  try {
    // Log the raw request
    const clone1 = request.clone();
    const rawBody = await clone1.text();
    console.log('SMS webhook raw request:', rawBody);
    
    // Parse the incoming request body
    const clone2 = request.clone();
    const formData = await clone2.formData();
    
    // Log the received data for debugging
    console.log('SMS webhook data:', Object.fromEntries(formData.entries()));
    
    // Extract the message content from Twilio's format
    const messageBody = formData.get('Body')?.toString() || '';
    const from = formData.get('From')?.toString() || '';
    
    console.log('SMS message content:', { messageBody, from });
    
    if (!messageBody) {
      console.error('No message body found in SMS webhook');
      return NextResponse.json({ error: 'No message body found' }, { status: 400 });
    }
    
    // Process the incoming message
    const messageId = await messageReceiver.processIncomingMessage(
      messageBody,
      'sms',
      {
        from,
        twilioMessageSid: formData.get('MessageSid')?.toString(),
        twilioAccountSid: formData.get('AccountSid')?.toString(),
        to: formData.get('To')?.toString(),
      }
    );
    
    // Log the successful processing
    console.log(`SMS message processed with ID: ${messageId}`);
    
    // Store webhook event in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'sms',
      event_type: 'message',
      payload: Object.fromEntries(formData.entries()),
      processed: true,
      message_id: messageId
    });
    
    // Return a TwiML response (Twilio expects this)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Your message has been received and processed.</Message>
      </Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    
    // Store error in database for debugging
    await supabase.from('webhook_events').insert({
      source: 'sms',
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
  return NextResponse.json({ status: 'SMS webhook endpoint is active' });
} 