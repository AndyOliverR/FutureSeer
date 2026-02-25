import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight route protection proxy (Next.js 16 — renamed from middleware).
 *
 * Checks for a `fs_auth` cookie (set client-side after Firebase auth) to
 * decide whether the user is likely authenticated.  This prevents the
 * flash of protected content for unauthenticated users — the definitive
 * auth check still happens client-side via Firebase.
 */

const PROTECTED_PREFIXES = [
  '/profile',
  '/profile-setup',
  '/ask-the-seer',
  '/community',
  '/notes',
  '/support',
];

const PUBLIC_PATHS = new Set([
  '/',
  '/signin',
  '/signup',
  '/about',
  '/tools',
  '/privacy',
  '/terms',
]);

function isProtectedRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return false;

  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return true;
    }
  }
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.has('fs_auth');

  if (!hasAuthCookie) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|assets|api).*)',
  ],
};
