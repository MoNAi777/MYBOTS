// Script to check Vercel deployment status
import fetch from 'node-fetch';

// Get the deployment URL from command line arguments or use default
const deploymentUrl = process.argv[2] || 'https://mybots-cdue-seven.vercel.app';

async function checkDeployment() {
  try {
    console.log(`Checking deployment at: ${deploymentUrl}`);
    
    // Try to access the root URL
    const rootResponse = await fetch(deploymentUrl);
    console.log(`Root URL status: ${rootResponse.status} ${rootResponse.statusText}`);
    
    // Try to access the API endpoint
    const apiResponse = await fetch(`${deploymentUrl}/api/receive?source=test`);
    console.log(`API endpoint status: ${apiResponse.status} ${apiResponse.statusText}`);
    
    // Try to access the check-env endpoint
    const checkEnvResponse = await fetch(`${deploymentUrl}/api/check-env`);
    console.log(`Check-env endpoint status: ${checkEnvResponse.status} ${checkEnvResponse.statusText}`);
    
    if (checkEnvResponse.ok) {
      const data = await checkEnvResponse.json();
      console.log('Environment variables check result:', data);
    }
    
    console.log('\nDeployment check complete.');
  } catch (error) {
    console.error('Error checking deployment:', error);
  }
}

// Run the check
checkDeployment(); 