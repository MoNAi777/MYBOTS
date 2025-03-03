// Script to run all checks
import { execSync } from 'child_process';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run a command and return the result
function runCommand(command) {
  try {
    console.log(`\nRunning: ${command}`);
    console.log('----------------------------------------');
    
    const output = execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Data Organizer - Comprehensive Check');
  console.log('====================================');
  console.log('This script will run all checks to ensure your application is set up correctly.');
  
  const checks = [
    {
      name: 'Supabase Connection',
      command: 'npm run check:supabase',
      description: 'Checks if the Supabase connection is working'
    },
    {
      name: 'Integrations',
      command: 'npm run check:integrations',
      description: 'Checks if the Telegram and Twilio integrations are set up correctly'
    },
    {
      name: 'Deployment',
      command: 'npm run check:deployment',
      description: 'Checks if the Vercel deployment is working',
      optional: true
    }
  ];
  
  const setupSteps = [
    {
      name: 'Database Setup',
      command: 'npm run setup:database',
      description: 'Sets up the Supabase database tables'
    },
    {
      name: 'Telegram Webhook Setup',
      command: 'npm run setup:telegram',
      description: 'Sets up the Telegram webhook',
      needsArgs: true
    }
  ];
  
  // Run checks
  console.log('\nRunning checks...');
  
  for (const check of checks) {
    if (check.optional) {
      const runOptionalCheck = await askConfirmation(`Do you want to run the ${check.name} check? (${check.description})`);
      
      if (!runOptionalCheck) {
        console.log(`Skipping ${check.name} check.`);
        continue;
      }
    }
    
    console.log(`\n--- Running ${check.name} Check ---`);
    runCommand(check.command);
  }
  
  // Ask if user wants to run setup steps
  const runSetup = await askConfirmation('\nDo you want to run setup steps to fix any issues?');
  
  if (runSetup) {
    console.log('\nRunning setup steps...');
    
    for (const step of setupSteps) {
      const runStep = await askConfirmation(`Do you want to run ${step.name}? (${step.description})`);
      
      if (!runStep) {
        console.log(`Skipping ${step.name}.`);
        continue;
      }
      
      if (step.needsArgs) {
        console.log(`\nNote: ${step.name} may require additional arguments.`);
        console.log('Please run it manually with the appropriate arguments.');
        continue;
      }
      
      console.log(`\n--- Running ${step.name} ---`);
      runCommand(step.command);
    }
  }
  
  console.log('\nAll checks and setup steps completed!');
  console.log('\nNext steps:');
  console.log('1. If there were any issues, fix them based on the error messages');
  console.log('2. Run the application with: npm run dev');
  console.log('3. Deploy to Vercel if you haven\'t already');
  
  rl.close();
}

// Run the main function
main(); 