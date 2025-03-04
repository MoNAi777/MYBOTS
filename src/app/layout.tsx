'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import ServiceWorkerProvider from './components/ServiceWorkerProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <title>Data Organizer</title>
        <meta name="description" content="Organize and search through your WhatsApp and Telegram messages" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${inter.className} h-full bg-slate-900 antialiased`}>
        <ServiceWorkerProvider>
          <div className="min-h-full flex">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-xl font-bold text-white">Data Organizer</span>
                  )}
                </div>
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  {sidebarCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="13 17 18 12 13 7"></polyline>
                      <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="11 17 6 12 11 7"></polyline>
                      <polyline points="18 17 13 12 18 7"></polyline>
                    </svg>
                  )}
                </button>
              </div>
              
              <nav className="space-y-1">
                <a href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </a>
                <a href="/messages" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {!sidebarCollapsed && <span>Messages</span>}
                </a>
                <a href="/stats" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10"></path>
                    <path d="M12 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                  {!sidebarCollapsed && <span>Statistics</span>}
                </a>
                <a href="/setup" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  {!sidebarCollapsed && <span>Setup</span>}
                </a>
              </nav>
              
              {!sidebarCollapsed && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="p-3 bg-indigo-900/30 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
                          <span className="text-sm font-medium leading-none text-white">v0.1</span>
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">Beta Version</p>
                        <p className="text-xs text-indigo-300">Data Organizer</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* Main content */}
            <div className={`flex-1 ${sidebarCollapsed ? 'main-content-sidebar-collapsed' : 'main-content'}`}>
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </div>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
