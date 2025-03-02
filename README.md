# Data Organizer

A Progressive Web App (PWA) for organizing and searching through your WhatsApp and Telegram messages.

## Features

- **Save Messages**: Forward messages from WhatsApp and Telegram or add them manually
- **Automatic Categorization**: AI-powered categorization of messages based on content
- **Smart Search**: Search through your messages with AI-enhanced search capabilities
- **Offline Support**: Works offline with local storage using IndexedDB
- **Message Types**: Automatically detects message types (text, link, video, image, file, app)
- **Statistics**: View statistics about your saved messages
- **Customization**: Edit categories and tags for better organization
- **Star Important Messages**: Mark important messages with stars for quick access

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

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

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```
npm run build
# or
yarn build
```

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
- Implements PWA features for offline use and installation
- Responsive design with Tailwind CSS

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by various emoji sets
- Built with Next.js and Tailwind CSS
