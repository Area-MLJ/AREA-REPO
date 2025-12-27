import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:8081',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  if (request.nextUrl.pathname.startsWith('/api')) {
    const method = request.method;
    const path = request.nextUrl.pathname;
    const blueMethod = '\x1b[34m';
    const reset = '\x1b[0m';
    
    console.log(`${blueMethod}[${method}]${reset} ${path}`);

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
