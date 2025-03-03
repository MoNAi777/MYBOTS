import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get information about the environment
  const environment = {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
    VERCEL_URL: process.env.VERCEL_URL || 'unknown',
    VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
  };
  
  // Check for critical environment variables (masked)
  const criticalVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_BOT_USERNAME',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN'
  ];
  
  const variables: Record<string, string> = {};
  criticalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      // Mask sensitive values
      if (varName.includes('KEY') || varName.includes('TOKEN') || varName.includes('SID')) {
        variables[varName] = maskValue(value);
      } else {
        variables[varName] = value;
      }
    } else {
      variables[varName] = 'NOT SET';
    }
  });
  
  return NextResponse.json({
    message: 'Diagnostics API route is working',
    timestamp: new Date().toISOString(),
    environment,
    variables,
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    }
  });
}

// Mask sensitive values for security
function maskValue(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return value.substring(0, 4) + '********' + value.substring(value.length - 4);
} 