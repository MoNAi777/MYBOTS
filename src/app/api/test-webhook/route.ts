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
      
      // First, check if the token is valid by making a getMe request
      let botInfo = null;
      let tokenValid = false;
      
      try {
        const getMeResponse = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/getMe`);
        botInfo = await getMeResponse.json();
        tokenValid = botInfo.ok === true;
      } catch (error) {
        console.error('Error checking Telegram token:', error);
      }
      
      // Then check the webhook info
      let webhookInfo = null;
      
      try {
        const webhookResponse = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/getWebhookInfo`);
        webhookInfo = await webhookResponse.json();
      } catch (error) {
        console.error('Error getting webhook info:', error);
      }
      
      return NextResponse.json({
        success: tokenValid,
        message: tokenValid ? 'Telegram token is valid' : 'Telegram token is invalid',
        botInfo,
        webhookInfo,
        configuredWebhookUrl: webhookUrl,
        telegramConfig: {
          botToken: telegramConfig.botToken ? `${telegramConfig.botToken.substring(0, 10)}...` : '✗ Missing',
          botUsername: telegramConfig.botUsername || '✗ Missing',
          debug: telegramConfig.debug
        }
      });
    } else if (source === 'whatsapp') {
      // Test Twilio configuration
      const baseUrl = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const fullBaseUrl = `${protocol}://${baseUrl}`;
      
      const webhookUrl = `${fullBaseUrl}/api/receive?source=whatsapp`;
      
      // We can't easily test Twilio credentials without making a real API call
      // that might cost money, so we'll just check if they're set
      const twilioCredentialsSet = !!twilioConfig.accountSid && 
                                  !!twilioConfig.authToken && 
                                  !!twilioConfig.whatsappNumber;
      
      return NextResponse.json({
        success: twilioCredentialsSet,
        message: twilioCredentialsSet ? 
          'Twilio credentials are set, but we cannot verify them without making a billable API call' : 
          'Twilio credentials are missing',
        webhookUrl,
        twilioConfig: {
          accountSid: twilioConfig.accountSid ? `${twilioConfig.accountSid.substring(0, 10)}...` : '✗ Missing',
          authToken: twilioConfig.authToken ? `${twilioConfig.authToken.substring(0, 10)}...` : '✗ Missing',
          phoneNumber: twilioConfig.phoneNumber || '✗ Missing',
          whatsappNumber: twilioConfig.whatsappNumber || '✗ Missing',
          whatsappSandboxCode: twilioConfig.whatsappSandboxCode || '✗ Missing',
          debug: twilioConfig.debug
        },
        twilioInstructions: `
          1. Go to https://console.twilio.com/
          2. Navigate to Messaging → Try it Out → Send a WhatsApp Message
          3. Set the webhook URL to: ${webhookUrl}
          4. Set the HTTP method to POST
          5. Save the configuration
          6. Test by sending a message to your WhatsApp number: ${twilioConfig.whatsappNumber}
        `
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