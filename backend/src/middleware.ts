import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, extractTokenFromHeader } from './lib/auth-edge';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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
    return NextResponse.next();
  }

  // Routes API nécessitent une authentification
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing token' },
        { status: 401 }
      );
    }

    try {
      const payload = await verifyTokenEdge(token);
      
      // Vérifier que c'est un access token
      if (payload.type !== 'access') {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid token type' },
          { status: 401 }
        );
      }

      // Ajouter le userId dans les headers pour les routes suivantes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/about.json'],
};

