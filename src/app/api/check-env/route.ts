import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // List of environment variables to check
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_BOT_USERNAME',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'TWILIO_WHATSAPP_NUMBER',
      'TWILIO_WHATSAPP_SANDBOX_CODE',
      'NODE_ENV',
      'VERCEL_URL',
      'VERCEL_ENV'
    ];
    
    // Check which environment variables are set
    const variables: Record<string, string> = {};
    envVars.forEach(varName => {
      const value = process.env[varName];
      // Only include the variable if it's set
      if (value) {
        // For sensitive variables, only include a masked version
        if (
          varName.includes('KEY') || 
          varName.includes('TOKEN') || 
          varName.includes('SECRET') || 
          varName.includes('SID') || 
          varName.includes('PASSWORD')
        ) {
          // Mask the value for security
          variables[varName] = maskValue(value);
        } else {
          variables[varName] = value;
        }
      } else {
        variables[varName] = '';
      }
    });
    
    // Return the environment variables check result
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercelEnv: process.env.VERCEL_ENV || 'unknown',
      variables
    });
  } catch (error) {
    console.error('Error checking environment variables:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to check environment variables', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Mask sensitive values for security
function maskValue(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return value.substring(0, 4) + '********' + value.substring(value.length - 4);
} 