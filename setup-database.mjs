// Script to set up the Supabase database
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...');
    
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'create_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('Database setup completed successfully!');
    
    // Verify the table was created
    const { data, error: tableError } = await supabase
      .from('Message')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error verifying table creation:', tableError);
      return;
    }
    
    console.log('Message table verified successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 