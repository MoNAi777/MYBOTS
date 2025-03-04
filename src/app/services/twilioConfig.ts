// Secure access to Twilio configuration
// This file provides a centralized way to access Twilio credentials
// without hardcoding them in the application code

// Environment variables are loaded automatically by Next.js from .env.local

export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
  whatsappSandboxCode: process.env.TWILIO_WHATSAPP_SANDBOX_CODE || '',
  
  // Debug info
  debug: {
    accountSidLength: process.env.TWILIO_ACCOUNT_SID?.length || 0,
    authTokenLength: process.env.TWILIO_AUTH_TOKEN?.length || 0,
    phoneNumberSet: !!process.env.TWILIO_PHONE_NUMBER,
    whatsappNumberSet: !!process.env.TWILIO_WHATSAPP_NUMBER,
    whatsappSandboxCodeSet: !!process.env.TWILIO_WHATSAPP_SANDBOX_CODE,
  }
};

// Helper function to validate that all required credentials are available
export function validateTwilioConfig(): boolean {
  const { accountSid, authToken, phoneNumber, whatsappNumber } = twilioConfig;
  
  if (!accountSid || !authToken || !phoneNumber || !whatsappNumber) {
    console.error('Missing Twilio credentials. Please check your .env.local file.');
    return false;
  }
  
  return true;
}

export default twilioConfig; 