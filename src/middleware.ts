import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass public assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Update Supabase session cookies
  const response = await updateSession(request);

  // Create request-cookies-aware client for safe middleware operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedRoutes = [
    '/dashboard',
    '/departments',
    '/members',
    '/organization',
    '/profile',
    '/settings',
    '/assessments',
    '/reports',
    '/onboarding',
    '/invitations',
  ];
  const authPages = ['/login', '/register'];

  // 1. Gate unauthenticated users
  if (protectedRoutes.some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Route authenticated users based on onboarding status
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single();

    const onboardingComplete = !!profile?.onboarding_complete;

    if (!onboardingComplete) {
      // If user has not onboarded, redirect to /onboarding from protected pages, auth pages, or root
      if (
        (protectedRoutes.some((p) => pathname.startsWith(p)) && !pathname.startsWith('/onboarding')) ||
        authPages.some((p) => pathname.startsWith(p)) ||
        pathname === '/'
      ) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    } else {
      // Onboarding complete: block /onboarding, auth pages, and redirect root to dashboard
      if (
        pathname.startsWith('/onboarding') ||
        authPages.some((p) => pathname.startsWith(p)) ||
        pathname === '/'
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
