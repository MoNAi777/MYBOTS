import { NextRequest, NextResponse } from 'next/server';
import messageReceiverService from '@/app/services/messageReceiver';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') as 'whatsapp' | 'telegram' | 'sms';
    const content = searchParams.get('content') || 'Test message';
    
    if (!source || !['whatsapp', 'telegram', 'sms'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be whatsapp, telegram, or sms' },
        { status: 400 }
      );
    }
    
    // Process the test message
    const messageId = await messageReceiverService.processIncomingMessage(
      content,
      source,
      { test: true, timestamp: new Date().toISOString() }
    );
    
    return NextResponse.json({
      success: true,
      messageId,
      message: `Test message processed successfully as ${source} message`,
      content,
      source
    });
  } catch (error) {
    console.error('Error in test-receive endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 