'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import ServiceWorkerProvider from './components/ServiceWorkerProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Data Organizer</title>
        <meta name="description" content="Organize and search through your WhatsApp and Telegram messages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
