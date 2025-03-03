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

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...');
    
    // Create the Message table directly using the REST API
    console.log('Creating Message table...');
    
    // Check if the table already exists
    const { data: existingTables, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'Message');
    
    if (tableError) {
      console.error('Error checking if table exists:', tableError);
      
      // Try creating the table anyway
      console.log('Attempting to create table...');
    } else if (existingTables && existingTables.length > 0) {
      console.log('Message table already exists.');
      return;
    }
    
    // Create the table
    const { error: createError } = await supabase.rpc('create_message_table');
    
    if (createError) {
      console.error('Error creating table using RPC:', createError);
      console.log('Trying alternative method...');
      
      // Try direct SQL query
      const { error: sqlError } = await supabase
        .from('_sql')
        .select('*')
        .eq('query', `
          CREATE TABLE IF NOT EXISTS "Message" (
            "id" SERIAL PRIMARY KEY,
            "content" TEXT NOT NULL,
            "source" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "category" TEXT,
            "tags" TEXT[] DEFAULT '{}',
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "starred" BOOLEAN DEFAULT FALSE,
            "metadata" JSONB
          );
          
          CREATE INDEX IF NOT EXISTS "Message_source_idx" ON "Message" ("source");
          CREATE INDEX IF NOT EXISTS "Message_type_idx" ON "Message" ("type");
          CREATE INDEX IF NOT EXISTS "Message_category_idx" ON "Message" ("category");
          CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message" ("createdAt");
          CREATE INDEX IF NOT EXISTS "Message_starred_idx" ON "Message" ("starred");
          
          ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Allow all operations" ON "Message"
            FOR ALL
            USING (true)
            WITH CHECK (true);
        `);
      
      if (sqlError) {
        console.error('Error creating table using SQL:', sqlError);
        console.log('Please create the table manually using the Supabase SQL editor.');
        console.log('Use the SQL in create_tables.sql');
        return;
      }
    }
    
    console.log('Table created successfully!');
    
    // Verify the table was created
    const { data, error: verifyError } = await supabase
      .from('Message')
      .select('id')
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying table creation:', verifyError);
      return;
    }
    
    console.log('Message table verified successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase(); 