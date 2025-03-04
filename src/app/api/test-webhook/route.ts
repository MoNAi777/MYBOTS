import { NextRequest, NextResponse } from 'next/server';
import telegramConfig from '../../services/telegramConfig';
import twilioConfig from '../../services/twilioConfig';

export async function GET(request: NextRequest) {
  // Get the source from the query parameters
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get('source') as 'telegram' | 'whatsapp';
  
  try {
    if (source === 'telegram') {
      // Test Telegram webhook setup
      const baseUrl = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const fullBaseUrl = `${protocol}://${baseUrl}`;
      
      const webhookUrl = `${fullBaseUrl}/api/receive?source=telegram`;
      const telegramApiUrl = `https://api.telegram.org/bot${telegramConfig.botToken}/getWebhookInfo`;
      
      const response = await fetch(telegramApiUrl);
      const webhookInfo = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Telegram webhook info retrieved',
        webhookInfo,
        configuredWebhookUrl: webhookUrl,
        telegramConfig: {
          botToken: telegramConfig.botToken ? '✓ Configured' : '✗ Missing',
          botUsername: telegramConfig.botUsername ? '✓ Configured' : '✗ Missing',
        }
      });
    } else if (source === 'whatsapp') {
      // Test Twilio configuration
      return NextResponse.json({
        success: true,
        message: 'Twilio configuration retrieved',
        twilioConfig: {
          accountSid: twilioConfig.accountSid ? '✓ Configured' : '✗ Missing',
          authToken: twilioConfig.authToken ? '✓ Configured' : '✗ Missing',
          phoneNumber: twilioConfig.phoneNumber ? '✓ Configured' : '✗ Missing',
          whatsappNumber: twilioConfig.whatsappNumber ? '✓ Configured' : '✗ Missing',
          whatsappSandboxCode: twilioConfig.whatsappSandboxCode ? '✓ Configured' : '✗ Missing',
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Please specify a source (telegram or whatsapp)'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing webhook',
      error: (error as Error).message
    }, { status: 500 });
  }
} 