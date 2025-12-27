import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/src/lib/cors';
import logger from '@/src/lib/logger';

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  const start = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;

  try {
    const response = NextResponse.json({ message: 'API Root' }, { headers: corsHeaders() });
    const duration = Date.now() - start;
    logger.http(`\x1b[34m[${method}]\x1b[0m ${path} ${response.status} in ${duration}ms`);
    return response;
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error(`\x1b[34m[${method}]\x1b[0m ${path} Error: ${error.message}`);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders() });
  }
}
