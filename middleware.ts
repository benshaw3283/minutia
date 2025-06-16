import { NextResponse } from 'next/server';

// Only run middleware on matched routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
}

export function middleware() {
  return NextResponse.next();
}
