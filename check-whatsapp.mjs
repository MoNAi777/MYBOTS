// Script to check WhatsApp configuration
import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
try {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Get Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const whatsappSandboxCode = process.env.TWILIO_WHATSAPP_SANDBOX_CODE;

if (!accountSid || !authToken) {
  console.error('Twilio credentials are missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('Twilio Account SID:', accountSid.substring(0, 10) + '...');
console.log('Twilio Phone Number:', phoneNumber);
console.log('Twilio WhatsApp Number:', whatsappNumber);
console.log('WhatsApp Sandbox Code:', whatsappSandboxCode);

// Check WhatsApp sandbox configuration
async function checkWhatsAppSandbox() {
  try {
    console.log(`Checking WhatsApp sandbox configuration for account: ${accountSid}`);
    
    // Create authorization header
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    // Get WhatsApp sandbox configuration
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/WhatsApp/Sandbox.json`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    const data = await response.json();
    console.log('WhatsApp sandbox configuration:', data);
    
    // Check if webhook URL is set correctly
    if (data.webhook_url) {
      console.log(`Webhook URL is currently set to: ${data.webhook_url}`);
      
      // Check if webhook URL is correct
      if (data.webhook_url.includes('mybots-cdue-seven.vercel.app/api/receive?source=whatsapp')) {
        console.log('Webhook URL is correctly set up!');
      } else {
        console.log('Webhook URL does not point to the correct endpoint.');
        console.log('Please update it to: https://mybots-cdue-seven.vercel.app/api/receive?source=whatsapp');
      }
    } else {
      console.log('No webhook URL is set.');
      console.log('Please set it to: https://mybots-cdue-seven.vercel.app/api/receive?source=whatsapp');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking WhatsApp sandbox configuration:', error);
    return null;
  }
}

// Run the checks
async function main() {
  await checkWhatsAppSandbox();
}

main(); 