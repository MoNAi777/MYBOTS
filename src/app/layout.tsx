import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerProvider from './components/ServiceWorkerProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Data Organizer',
  description: 'Organize and search through your WhatsApp and Telegram messages',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ServiceWorkerProvider>
          {children}
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
