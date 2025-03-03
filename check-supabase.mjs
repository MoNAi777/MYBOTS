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
    
    // Try to get the server version
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      
      // Try a simpler query
      console.log('Trying a simpler query...');
      const { data: tableData, error: tableError } = await supabase
        .from('Message')
        .select('count(*)', { count: 'exact' });
      
      if (tableError) {
        console.error('Error querying Message table:', tableError);
        console.log('Checking if table exists...');
        
        // Check if the table exists
        const { data: schemaData, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'Message');
        
        if (schemaError) {
          console.error('Error checking if table exists:', schemaError);
          return;
        }
        
        if (schemaData && schemaData.length > 0) {
          console.log('Message table exists but could not query it.');
        } else {
          console.log('Message table does not exist. Please run setup:database script.');
        }
        
        return;
      }
      
      console.log('Connected to Supabase successfully!');
      console.log('Message count:', tableData[0].count);
      return;
    }
    
    console.log('Connected to Supabase successfully!');
    console.log('Server version:', data);
    
    // Check if the Message table exists
    const { data: tableData, error: tableError } = await supabase
      .from('Message')
      .select('count(*)', { count: 'exact' });
    
    if (tableError) {
      console.error('Error querying Message table:', tableError);
      console.log('Message table may not exist. Please run setup:database script.');
      return;
    }
    
    console.log('Message table exists!');
    console.log('Message count:', tableData[0].count);
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
  }
}

checkConnection(); 