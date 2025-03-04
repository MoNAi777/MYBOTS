# Data Organizer

A Progressive Web App (PWA) for organizing and searching through your WhatsApp and Telegram messages.

## Features

- **Save Messages**: Forward messages from WhatsApp and Telegram or add them manually
- **Automatic Categorization**: AI-powered categorization of messages based on content
- **Smart Search**: Search through your messages with AI-enhanced search capabilities
- **Offline Support**: Works offline with local storage using IndexedDB
- **Server-Side Storage**: Persistent storage with Supabase PostgreSQL
- **Message Types**: Automatically detects message types (text, link, video, image, file, app)
- **Statistics**: View statistics about your saved messages
- **Customization**: Edit categories and tags for better organization
- **Star Important Messages**: Mark important messages with stars for quick access

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Supabase account (free tier works fine)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/data-organizer.git
   cd data-organizer
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   # Database Configuration (Supabase)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Telegram Bot
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_BOT_USERNAME=your_bot_username
   NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
   
   # Twilio Credentials (for WhatsApp)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   TWILIO_WHATSAPP_SANDBOX_CODE=your_sandbox_join_code
   ```

4. Set up the database:
   - Create a Supabase account at https://supabase.com
   - Create a new project
   - Go to the SQL Editor and run the SQL in `create_tables.sql`

5. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```
npm run build
# or
yarn build
```

## Database Setup with Supabase

1. Create a free Supabase account at https://supabase.com
2. Create a new project
3. Go to the SQL Editor and run the following SQL to create the Message table:

```sql
-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "source" TEXT NOT NULL, -- 'whatsapp' or 'telegram'
  "type" TEXT NOT NULL, -- 'text', 'link', 'video', 'image', 'file', 'app', 'other'
  "category" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "starred" BOOLEAN DEFAULT FALSE NOT NULL,
  "metadata" JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Message_source_idx" ON "Message" ("source");
CREATE INDEX IF NOT EXISTS "Message_type_idx" ON "Message" ("type");
CREATE INDEX IF NOT EXISTS "Message_category_idx" ON "Message" ("category");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message" ("createdAt");
CREATE INDEX IF NOT EXISTS "Message_starred_idx" ON "Message" ("starred");

-- Enable Row Level Security (RLS)
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
CREATE POLICY "Allow all operations on Message" ON "Message"
  USING (true)
  WITH CHECK (true);
```

4. Get your Supabase URL and anon key from the API settings
5. Update your `.env.local` file with these values

## How to Use

### Adding Messages Manually

1. Go to the "Messages" tab
2. Click "Add New Message"
3. Enter the message content and select the source (WhatsApp or Telegram)
4. Click "Add Message"

### Forwarding Messages from WhatsApp/Telegram

1. Go to the "Setup" tab
2. Follow the integration instructions for WhatsApp or Telegram
3. Use the provided API endpoint to forward messages

### Searching Messages

1. Use the search bar at the top of the "Messages" tab
2. Filter by source, type, category, or starred status
3. Click "Search" to find matching messages

### Editing Messages

1. Click the edit icon (✏️) on any message card
2. Update the category, tags, or starred status
3. Click "Save" to apply changes

## Technical Details

- Built with Next.js and TypeScript
- Uses IndexedDB for offline storage
- Uses Supabase for server-side PostgreSQL database
- Hybrid database approach: client-side IndexedDB + server-side Supabase
- Implements PWA features for offline use and installation
- Responsive design with Tailwind CSS

## Database Architecture

The application uses a hybrid database approach:

1. **Client-side**: IndexedDB for offline storage and quick access
2. **Server-side**: Supabase PostgreSQL for persistent storage

The database schema includes:

- **Messages**: Stores all messages with their content, source, type, and metadata
- **Categories**: Auto-generated or user-defined categories
- **Tags**: User-defined tags for better organization

Data synchronization happens automatically when the application is online.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by various emoji sets
- Built with Next.js and Tailwind CSS

## Directory Structure

- **src/** - Main application source code
  - **app/** - Next.js application
    - **api/** - API endpoints
    - **components/** - React components
    - **services/** - Service layer for business logic
- **docs/** - Documentation for the application
- **setup-scripts/** - Scripts for setting up integrations
- **test-scripts/** - Scripts for testing integrations
- **public/** - Static assets

## Available Scripts

### Setup Scripts

- **setup-scripts/setup-telegram.js** - Sets up the Telegram webhook for your bot
- **setup-scripts/setup-whatsapp.js** - Provides instructions for setting up the WhatsApp Sandbox webhook

### Test Scripts

- **test-scripts/check-whatsapp-sandbox.js** - Checks the status of your WhatsApp Sandbox
- **test-scripts/send-whatsapp-test.js** - Sends a test message to a WhatsApp number
- **test-scripts/test-twilio-sandbox.js** - Tests the Twilio WhatsApp Sandbox configuration
- **test-scripts/test-webhook-endpoint.js** - Tests all webhook endpoints
- **test-scripts/test-with-your-number.js** - Interactive tool for testing WhatsApp integration

## Documentation

- **docs/SETUP-SUMMARY.md** - A summary of the setup process for all integrations
- **docs/WHATSAPP-SETUP-GUIDE.md** - A comprehensive guide for setting up and testing the WhatsApp Sandbox integration
