// Test script to check Supabase connection and message storage
import { createClient } from '@supabase/supabase-js';
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

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or key is missing. Please check your .env.local file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection and fetch messages
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if we can connect to Supabase
    const { data: tableData, error: tableError } = await supabase
      .from('Message')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error connecting to Supabase Message table:', tableError);
      return false;
    }
    
    console.log('Successfully connected to Supabase Message table!');
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}

// Fetch recent messages
async function fetchMessages() {
  try {
    console.log('Fetching recent messages from Supabase...');
    
    const { data, error } = await supabase
      .from('Message')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    
    console.log(`Found ${data.length} messages:`);
    data.forEach((message, index) => {
      console.log(`\nMessage ${index + 1}:`);
      console.log(`ID: ${message.id}`);
      console.log(`Content: ${message.content}`);
      console.log(`Source: ${message.source}`);
      console.log(`Type: ${message.type}`);
      console.log(`Created At: ${new Date(message.createdAt).toLocaleString()}`);
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

// Insert a test message
async function insertTestMessage() {
  try {
    console.log('Inserting test message into Supabase...');
    
    const testMessage = {
      content: 'Test message from Supabase test script',
      source: 'telegram',
      type: 'text',
      category: 'Test',
      tags: ['test', 'script'],
      createdAt: new Date().toISOString(),
      starred: false,
      metadata: {
        testId: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString()
      }
    };
    
    const { data, error } = await supabase
      .from('Message')
      .insert(testMessage)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error inserting test message:', error);
      return;
    }
    
    console.log('Test message inserted successfully with ID:', data.id);
  } catch (error) {
    console.error('Error inserting test message:', error);
  }
}

// Run tests
async function runTests() {
  const isConnected = await testConnection();
  
  if (isConnected) {
    await fetchMessages();
    
    // Ask if user wants to insert a test message
    if (process.argv.includes('--insert')) {
      await insertTestMessage();
      // Fetch messages again to see the new message
      await fetchMessages();
    }
  }
}

runTests(); 