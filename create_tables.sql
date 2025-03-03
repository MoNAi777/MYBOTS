-- Create the Message table for Supabase
CREATE TABLE IF NOT EXISTS "Message" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "source" TEXT NOT NULL, -- 'whatsapp' or 'telegram'
  "type" TEXT NOT NULL, -- 'text', 'link', 'video', 'image', 'file', 'app', 'other'
  "category" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "starred" BOOLEAN DEFAULT FALSE,
  "metadata" JSONB
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Message_source_idx" ON "Message" ("source");
CREATE INDEX IF NOT EXISTS "Message_type_idx" ON "Message" ("type");
CREATE INDEX IF NOT EXISTS "Message_category_idx" ON "Message" ("category");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message" ("createdAt");
CREATE INDEX IF NOT EXISTS "Message_starred_idx" ON "Message" ("starred");

-- Enable Row Level Security
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" 
ON "Message" 
FOR ALL 
TO authenticated 
USING (true); 