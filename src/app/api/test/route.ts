import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test API route is working',
    timestamp: new Date().toISOString(),
    query: Object.fromEntries(request.nextUrl.searchParams.entries())
  });
} 