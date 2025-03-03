// Script to check environment variables in Vercel deployment
import fetch from 'node-fetch';

// Get the deployment URL from command line arguments or use default
const deploymentUrl = process.argv[2] || 'https://mybots-cdue-seven.vercel.app';

// Create an endpoint to check environment variables
const checkEnvEndpoint = `${deploymentUrl}/api/check-env`;

async function checkEnvironmentVariables() {
  try {
    console.log(`Checking environment variables at: ${checkEnvEndpoint}`);
    
    const response = await fetch(checkEnvEndpoint);
    
    if (!response.ok) {
      console.error(`Error: HTTP status ${response.status}`);
      console.error('You may need to create the /api/check-env endpoint first.');
      return;
    }
    
    const data = await response.json();
    console.log('Environment variables check result:', data);
    
    // Check for critical environment variables
    const criticalVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'TELEGRAM_BOT_TOKEN',
      'TELEGRAM_BOT_USERNAME',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN'
    ];
    
    console.log('\nCritical environment variables check:');
    criticalVars.forEach(varName => {
      const status = data.variables[varName] 
        ? `✅ Set (${maskValue(data.variables[varName])})` 
        : '❌ Missing';
      console.log(`${varName}: ${status}`);
    });
    
    // Provide recommendations
    console.log('\nRecommendations:');
    if (data.variables.NEXT_PUBLIC_SUPABASE_URL && data.variables.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('✅ Supabase configuration is present');
    } else {
      console.log('❌ Supabase configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables.');
    }
    
    if (data.variables.TELEGRAM_BOT_TOKEN && data.variables.TELEGRAM_BOT_USERNAME) {
      console.log('✅ Telegram configuration is present');
    } else {
      console.log('❌ Telegram configuration is missing. Add TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_USERNAME to your Vercel environment variables.');
    }
    
    if (data.variables.TWILIO_ACCOUNT_SID && data.variables.TWILIO_AUTH_TOKEN) {
      console.log('✅ Twilio configuration is present');
    } else {
      console.log('❌ Twilio configuration is missing. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your Vercel environment variables.');
    }
    
  } catch (error) {
    console.error('Error checking environment variables:', error);
  }
}

// Mask sensitive values for display
function maskValue(value) {
  if (!value) return '';
  if (value.length <= 10) return '********';
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

// Run the check
checkEnvironmentVariables(); 