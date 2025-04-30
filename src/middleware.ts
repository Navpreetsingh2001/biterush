
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require authentication (client-side context handles this for now)
const protectedRoutes = ['/cart']; // Add other routes like '/profile', '/orders' etc. if needed
// Admin routes are now protected by the /admin/layout.tsx

export function middleware(request: NextRequest) {
  // In a real app, you would verify a session token (e.g., from a cookie or header)
  // against your backend or auth provider.
  // For this demo using localStorage, middleware can't directly access it.
  // Middleware runs on the edge/server, localStorage is browser-only.

  // **Simulated Check (Not Recommended for Production):**
  // This is a placeholder. Real auth checks need server-side state/tokens.
  // We'll assume if the user is trying to access a protected route,
  // the client-side AuthContext should handle redirection if not logged in.
  // Middleware primarily handles redirects based on *server-verifiable* state.

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith('/admin');

  // Example: If you had a session cookie named 'auth_token'
  // const sessionToken = request.cookies.get('auth_token')?.value;
  // const isAdmin = checkAdminRoleFromToken(sessionToken); // Function to verify token and check role

  // if (isAdminRoute && !isAdmin) {
  //    // Redirect non-admins trying to access /admin
  //    return NextResponse.redirect(new URL('/', request.url));
  // }
  //
  // if (isProtectedRoute && !sessionToken) {
  //   // Redirect to login page if trying to access protected route without token
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: pass redirect info
  //   return NextResponse.redirect(loginUrl);
  // }

  // If accessing login/register page while already "logged in" (based on token)
  // you might redirect them away.
  // if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && sessionToken) {
  //    return NextResponse.redirect(new URL('/', request.url));
  // }

  // For this simple localStorage example, we rely on client-side routing guards
  // within the components or using the AuthContext and the admin layout.
  // The middleware structure is here for future enhancement with proper session management.

  console.log(`Middleware check on path: ${pathname}. Is protected? ${isProtectedRoute}. Is admin? ${isAdminRoute}`);

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /admin (admin routes are handled by layout, exclude from general matcher if specific rules aren't needed here)
     * - / (the root path itself, handled by page.tsx) - adjust if needed
     */
     // Updated matcher to exclude /admin paths from this general middleware if protection is handled by layout
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
     // Include root explicitly if needed, or adjust the negative lookahead
     // '/',
     // Or, if you want middleware to run on /admin for other reasons (like logging), keep it in the matcher
     // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

