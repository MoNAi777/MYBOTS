// Script to check the Vercel deployment
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for the deployment URL
function askDeploymentUrl() {
  return new Promise((resolve) => {
    rl.question('Enter your Vercel deployment URL (e.g., https://your-app.vercel.app): ', (url) => {
      resolve(url);
    });
  });
}

// Check if the deployment is working
async function checkDeployment(deploymentUrl) {
  console.log(`\nChecking deployment at ${deploymentUrl}...`);
  
  try {
    // Check if the main page is accessible
    console.log('Checking main page...');
    const mainResponse = await fetch(deploymentUrl);
    
    if (!mainResponse.ok) {
      console.error(`Error: Main page returned status ${mainResponse.status}`);
      return false;
    }
    
    console.log(`Main page is accessible! Status: ${mainResponse.status}`);
    
    // Check if the API is accessible
    console.log('\nChecking API endpoint...');
    const apiResponse = await fetch(`${deploymentUrl}/api/receive?source=test`);
    
    if (!apiResponse.ok) {
      console.error(`Error: API endpoint returned status ${apiResponse.status}`);
      return false;
    }
    
    const apiData = await apiResponse.json();
    console.log('API response:', apiData);
    
    // Check environment variables
    console.log('\nChecking environment variables...');
    const envResponse = await fetch(`${deploymentUrl}/api/check-env`);
    
    if (!envResponse.ok) {
      console.error(`Error: Environment check endpoint returned status ${envResponse.status}`);
      console.log('Note: This might be expected if the /api/check-env endpoint is not implemented.');
    } else {
      const envData = await envResponse.json();
      console.log('Environment check response:', envData);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking deployment:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Vercel Deployment Checker');
  console.log('========================');
  
  const deploymentUrl = await askDeploymentUrl();
  
  if (!deploymentUrl) {
    console.error('Error: No deployment URL provided');
    rl.close();
    return;
  }
  
  const deploymentOk = await checkDeployment(deploymentUrl);
  
  console.log('\n--- Deployment Check Summary ---');
  console.log('Deployment Status:', deploymentOk ? '✅ OK' : '❌ Issues detected');
  
  if (deploymentOk) {
    console.log('\nYour deployment looks good!');
    console.log('\nNext steps:');
    console.log('1. Set up the Telegram webhook using:');
    console.log(`   npm run setup:telegram -- ${process.env.TELEGRAM_BOT_TOKEN} set ${deploymentUrl}/api/receive?source=telegram`);
    console.log('2. Check that the database is set up:');
    console.log('   npm run check:supabase');
    console.log('3. If needed, set up the database:');
    console.log('   npm run setup:database');
  } else {
    console.log('\nYour deployment has issues. Please check the logs above.');
  }
  
  rl.close();
}

main(); 