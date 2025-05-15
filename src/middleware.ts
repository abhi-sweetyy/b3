import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function to create Supabase client inside middleware
// Handles cookie management for server-side rendering
function createClient(request: NextRequest) {
  let response = NextResponse.next({ // Default response (pass-through)
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Ensure these env vars are set
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Ensure these env vars are set
    {
      cookies: {
        // Function to get a cookie value
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // Function to set a cookie value
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookies and response cookies
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        // Function to remove a cookie
        remove(name: string, options: CookieOptions) {
          // Update request cookies and response cookies
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Return the Supabase client and the response object
  return { supabase, response }
}

// The main middleware function
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // IMPORTANT: Refresh session before checking user status
  // This ensures the session is fresh and valid
  await supabase.auth.getSession();

  // Get user information
  const { data: { user } } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // --- Define Protected Routes ---
  // List all routes that require authentication
  const protectedPaths = [
    '/dashboard',         // The main dashboard page
    // Add all routes within the (dashboard) group
    '/account', 
    '/billing', 
    '/brochures', 
    '/project'            // Prefix for /project/[id] pages
  ];

  // Check if the current path starts with any protected path
  const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));

  // --- Authentication Logic ---

  // 1. If user is NOT logged in and trying to access a protected route
  if (!user && isProtectedRoute) {
    console.log(`[Middleware] Unauthenticated access to ${currentPath}. Redirecting to /sign-in.`);
    // Construct the sign-in URL
    const signInUrl = new URL('/sign-in', request.url);
    // Optional: You could add a redirect query param if needed on the sign-in page
    // signInUrl.searchParams.set('redirectedFrom', currentPath);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If user IS logged in and trying to access the /sign-in page
  if (user && currentPath === '/sign-in') {
    console.log(`[Middleware] Authenticated user accessing /sign-in. Redirecting to /dashboard.`);
    // Redirect to the main dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- Allow Request ---
  // If none of the above conditions are met, allow the request to proceed
  // The response object might have been modified by cookie operations
  console.log(`[Middleware] Allowing access to ${currentPath}. User: ${user?.id || 'None'}`);
  return response;
}

// --- Matcher Configuration ---
// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Other static assets (images, fonts, etc.)
     * This prevents the middleware from running on unnecessary requests.
     */
    '/((?!api|_next/static|_next/image|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
} 