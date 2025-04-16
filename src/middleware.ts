// middleware.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/app',
];

const publicRoutes = [
    '/',
    '/about',
    '/contact',
];

const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
];

export async function middleware(req: NextRequest) {
    const res = NextResponse.next(); // Get the response object FIRST

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const pathname = req.nextUrl.pathname;
    console.log(`[Middleware] Path: ${pathname}`);

    // LOG COOKIES IMMEDIATELY - CRITICAL!
    console.log('[Middleware] All Cookies:', req.cookies);
    Object.entries(req.cookies).forEach(([key, value]) => {
        console.log(`[Middleware] Cookie - ${key}: ${value}`);
    });

    // Auth callback handling (PRIORITIZE THIS)
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        console.log('[Middleware] Auth code detected, exchanging for session');
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                console.error('[Middleware] Error exchanging code for session:', error);
                return NextResponse.redirect(new URL('/error?message=AuthError', req.url));
            }

            // IMPORTANT: Get the redirectTo URL *before* redirecting
            const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
            const redirectUrl = new URL(redirectTo, req.url);

            return NextResponse.redirect(redirectUrl);  // Redirect immediately after exchange
        } catch (error) {
            console.error('[Middleware] Error during code exchange:', error);
            return NextResponse.redirect(new URL('/error?message=AuthError', req.url));
        }
    }

    // *AFTER* the code exchange, check the session
    try {
        const { data: { session }} = await supabase.auth.getSession();
        const isAuthenticated = !!session;
        console.log(`[Middleware] Is authenticated: ${isAuthenticated}`);

        // Route protection logic
        const isProtectedRoute = protectedRoutes.includes(pathname);
        const isPublicRoute = publicRoutes.includes(pathname);
        const isAuthRoute = authRoutes.includes(pathname);

        if (isProtectedRoute && !isAuthenticated) {
            console.log('[Middleware] Redirecting to login');
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('to', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (isAuthRoute && isAuthenticated) {
            console.log('[Middleware] Redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Add user info to headers if authenticated
        if (isAuthenticated) {
            res.headers.set('x-user-id', session?.user.id || '');
            res.headers.set('x-user-email', session?.user.email || '');
            console.log(`[Middleware] User ID: ${session?.user.id}, Email: ${session?.user.email}`);  // Added logs
        } else {
            console.log('[Middleware] User not authenticated, no headers set.'); //Added Log
        }

        console.log('[Middleware] Allowing request to proceed');
        return res;

    } catch (error) {
        console.error('[Middleware] Error getting session:', error);
        return NextResponse.redirect(new URL('/error?message=SessionError', req.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes)
         * - public (public assets)
         */
        '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
    ],
};