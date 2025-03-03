// Script to check the Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    console.log('Checking Supabase connection...');
    
    // Try to get the server health
    const { data, error } = await supabase.from('Message').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      
      // Check if the table exists
      console.log('Checking if Message table exists...');
      
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .eq('tablename', 'Message');
        
        if (tablesError) {
          console.error('Error checking tables:', tablesError);
          console.log('You may need to create the Message table. Run setup:database script.');
        } else if (tablesData && tablesData.length > 0) {
          console.log('Message table exists but could not query it.');
          console.log('This might be a permissions issue. Check your RLS policies.');
        } else {
          console.log('Message table does not exist. Please run setup:database script.');
        }
      } catch (e) {
        console.error('Error checking tables:', e);
      }
      
      return;
    }
    
    console.log('Connected to Supabase successfully!');
    console.log('Message count:', data);
    
    // Try to insert a test message
    console.log('\nTrying to insert a test message...');
    
    const testMessage = {
      content: 'Test message from check-supabase script',
      source: 'test',
      type: 'text',
      createdAt: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('Message')
      .insert(testMessage)
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error inserting test message:', insertError);
      console.log('This might be a permissions issue. Check your RLS policies.');
      return;
    }
    
    console.log('Test message inserted successfully!');
    console.log('Message ID:', insertData.id);
    
    // Delete the test message
    console.log('\nDeleting test message...');
    
    const { error: deleteError } = await supabase
      .from('Message')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('Error deleting test message:', deleteError);
      return;
    }
    
    console.log('Test message deleted successfully!');
    console.log('\nAll Supabase operations completed successfully!');
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
  }
}

checkConnection(); 