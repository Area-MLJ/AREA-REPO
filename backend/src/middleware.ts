import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, extractTokenFromHeader } from './lib/auth-edge';

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    Vary: 'Origin',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Global CORS handling for API routes
  if (pathname.startsWith('/api/')) {
    // Preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: getCorsHeaders(request),
      });
    }
  }

  // Routes publiques qui ne nécessitent pas d'authentification
      const publicRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/webhooks',
        '/api/health',
      ];

      // Routes admin (nécessitent authentification mais pas de vérification admin pour l'instant)
      const adminRoutes = [
        '/api/admin/sync-services',
      ];

  // /about.json est toujours public
  if (pathname === '/about.json') {
    return NextResponse.next();
  }

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    const response = NextResponse.next();
    if (pathname.startsWith('/api/')) {
      for (const [key, value] of Object.entries(getCorsHeaders(request))) {
        response.headers.set(key, value);
      }
    }
    return response;
  }

  // Routes API nécessitent une authentification
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing token' },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }

    try {
      const payload = await verifyTokenEdge(token);
      
      // Vérifier que c'est un access token
      if (payload.type !== 'access') {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid token type' },
          { status: 401, headers: getCorsHeaders(request) }
        );
      }

      // Ajouter le userId dans les headers pour les routes suivantes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      for (const [key, value] of Object.entries(getCorsHeaders(request))) {
        response.headers.set(key, value);
      }
      return response;
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401, headers: getCorsHeaders(request) }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/about.json'],
};

