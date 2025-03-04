// Simple script to test sending a webhook to your endpoint
const https = require('https');
const querystring = require('querystring');

function testGet() {
  console.log('Testing GET request...');
  
  const options = {
    hostname: 'mybots-seven.vercel.app',
    path: '/api/receive?source=sms',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    console.log(`GET Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('GET Response:', data);
      testPost();
    });
  });
  
  req.on('error', (error) => {
    console.error('Error with GET request:', error);
  });
  
  req.end();
}

function testPost() {
  console.log('\nTesting POST request with Twilio-like payload...');
  
  const postData = querystring.stringify({
    'Body': 'This is a test SMS message',
    'From': '+1234567890',
    'To': '+0987654321',
    'MessageSid': 'SM12345'
  });
  
  const options = {
    hostname: 'mybots-seven.vercel.app',
    path: '/api/receive?source=sms',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`POST Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('POST Response:', data);
    });
  });
  
  req.on('error', (error) => {
    console.error('Error with POST request:', error);
  });
  
  req.write(postData);
  req.end();
}

// Start the tests
testGet(); 