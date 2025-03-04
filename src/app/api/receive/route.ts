import { NextRequest, NextResponse } from 'next/server';
import messageReceiverService from '../../services/messageReceiver';
import supabaseDbService from '../../services/supabaseDb';

// In-memory storage for messages received via webhook
// This is a temporary solution until we implement a proper server-side database
const webhookMessages: Array<{
  content: string;
  source: 'whatsapp' | 'telegram';
  metadata: Record<string, any>;
  timestamp: string;
}> = [];

export async function GET(request: NextRequest) {
  // This endpoint is used for testing the API
  const searchParams = request.nextUrl.searchParams;
  const showMessages = searchParams.get('showMessages') === 'true';
  
  if (showMessages) {
    // Return the stored webhook messages
    return NextResponse.json({ 
      message: 'Message receiver API is working',
      webhookMessages 
    });
  }
  
  return NextResponse.json({ message: 'Message receiver API is working' });
}

export async function POST(request: NextRequest) {
  try {
    // Get the source from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') as 'whatsapp' | 'telegram';
    
    // Validate the source
    if (!source || (source !== 'whatsapp' && source !== 'telegram')) {
      return NextResponse.json(
        { error: 'Invalid source. Must be "whatsapp" or "telegram"' },
        { status: 400 }
      );
    }
    
    console.log(`Received webhook from ${source}`);
    
    // Parse the request body - handle both form data (Twilio) and JSON
    let content = '';
    let metadata: Record<string, any> = {};
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON data (our custom format or Telegram)
      try {
        const body = await request.json();
        console.log('Received JSON body:', JSON.stringify(body).substring(0, 200) + '...');
        
        if (source === 'telegram') {
          // Handle Telegram webhook format
          // Telegram sends updates in a specific format
          if (!body.message) {
            console.log('Invalid Telegram webhook data. No message found.');
            return NextResponse.json(
              { error: 'Invalid Telegram webhook data. No message found.' },
              { status: 400 }
            );
          }
          
          // Extract the message text
          content = body.message.text || '';
          
          if (!content) {
            // Check if this is a non-text message (photo, sticker, etc.)
            if (body.message.photo) {
              content = '[Photo]';
            } else if (body.message.sticker) {
              content = '[Sticker]';
            } else if (body.message.voice) {
              content = '[Voice Message]';
            } else if (body.message.document) {
              content = '[Document]';
            } else if (body.message.video) {
              content = '[Video]';
            } else if (body.message.audio) {
              content = '[Audio]';
            } else if (body.message.location) {
              content = '[Location]';
            } else {
              content = '[Unsupported Message Type]';
            }
          }
          
          // Extract useful metadata
          metadata = {
            from: {
              id: body.message.from.id,
              username: body.message.from.username,
              firstName: body.message.from.first_name,
              lastName: body.message.from.last_name,
            },
            chat: {
              id: body.message.chat.id,
              type: body.message.chat.type,
            },
            messageId: body.message.message_id,
            date: body.message.date,
            timestamp: new Date().toISOString(),
            rawUpdate: body,
          };
        } else {
          // Handle our custom JSON format
          if (!body.content || typeof body.content !== 'string') {
            return NextResponse.json(
              { error: 'Invalid content. Must provide a content field with a string value' },
              { status: 400 }
            );
          }
          
          content = body.content;
          metadata = body.metadata || {};
        }
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        return NextResponse.json(
          { error: 'Invalid JSON body', details: (error as Error).message },
          { status: 400 }
        );
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data (Twilio format)
      try {
        const formData = await request.formData();
        console.log('Received form data:', Object.fromEntries(formData.entries()));
        
        // For WhatsApp, Twilio sends the message in the 'Body' field
        content = formData.get('Body')?.toString() || '';
        
        if (!content) {
          return NextResponse.json(
            { error: 'No message content found in the request' },
            { status: 400 }
          );
        }
        
        // Extract useful metadata from Twilio's request
        metadata = {
          from: formData.get('From')?.toString() || '',
          to: formData.get('To')?.toString() || '',
          messageSid: formData.get('MessageSid')?.toString() || '',
          accountSid: formData.get('AccountSid')?.toString() || '',
          profileName: formData.get('ProfileName')?.toString() || '',
          timestamp: new Date().toISOString(),
        };
        
        // If there are media attachments, add them to metadata
        const numMedia = parseInt(formData.get('NumMedia')?.toString() || '0', 10);
        if (numMedia > 0) {
          const mediaItems = [];
          for (let i = 0; i < numMedia; i++) {
            mediaItems.push({
              contentType: formData.get(`MediaContentType${i}`)?.toString() || '',
              url: formData.get(`MediaUrl${i}`)?.toString() || '',
            });
          }
          metadata.media = mediaItems;
        }
      } catch (error) {
        console.error('Error parsing form data:', error);
        return NextResponse.json(
          { error: 'Failed to parse form data', details: (error as Error).message },
          { status: 400 }
        );
      }
    } else {
      console.log('Unsupported content type:', contentType);
      return NextResponse.json(
        { error: 'Unsupported content type. Use application/json or application/x-www-form-urlencoded' },
        { status: 415 }
      );
    }
    
    console.log(`Processing message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    
    // Store the message in our in-memory array
    webhookMessages.push({
      content,
      source,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    // Limit the size of the in-memory storage to prevent memory leaks
    if (webhookMessages.length > 100) {
      webhookMessages.shift(); // Remove the oldest message
    }
    
    // Try to process the message with the service
    let id: number | undefined;
    try {
      // First try with supabaseDbService directly
      id = await supabaseDbService.addMessage({
        content,
        source,
        type: 'text', // Default to text, AI service will refine this later
        createdAt: new Date(),
        metadata
      });
      
      console.log('Message saved to Supabase with ID:', id);
    } catch (supabaseError) {
      console.error('Error saving to Supabase directly:', supabaseError);
      
      // Fallback to messageReceiverService
      try {
        console.log('Trying with messageReceiverService as fallback...');
        id = await messageReceiverService.processIncomingMessage(
          content,
          source,
          metadata
        );
        console.log('Message processed with messageReceiverService, ID:', id);
      } catch (error) {
        console.error('Error processing message with messageReceiverService:', error);
        // We'll continue even if there's an error
        // The message is still stored in our in-memory array
      }
    }
    
    // For Telegram, we need to return a 200 OK response
    if (source === 'telegram') {
      return NextResponse.json({ ok: true });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Message received and processed successfully',
      storedInMemory: true
    });
  } catch (error) {
    console.error('Error processing message:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to process message', details: (error as Error).message },
      { status: 500 }
    );
  }
} 