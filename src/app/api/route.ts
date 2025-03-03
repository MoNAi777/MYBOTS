import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Root API route is working',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/receive',
      '/api/check-env',
      '/api/test',
      '/api/status'
    ],
    apiStructure: {
      'src/app/api/receive/route.ts': 'Webhook receiver for messages',
      'src/app/api/check-env/route.ts': 'Environment variables checker',
      'src/app/api/test/route.ts': 'Test API route',
      'src/app/api/status/route.ts': 'Status API route'
    }
  });
} 