// src/app/api/auth/session/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    console.log('[Session API] All Cookies:', cookieStore);
    cookieStore.getAll().forEach(cookie => {
        console.log(`[Session API] Cookie - ${cookie.name}: ${cookie.value}`);
    });

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Session API error:', error.message);
            return new NextResponse(JSON.stringify({ error: 'Failed to get session' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!session) {
            console.log('[Session API] No session found');
            const res = new NextResponse(JSON.stringify({ user: null, expires: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

            // EXPLICIT COOKIE SETTING (FOR DIAGNOSTICS ONLY)
            res.cookies.set('test-cookie', 'test-value', {
                domain: 'localhost', // Or your domain in production
                path: '/',
                httpOnly: false, // For testing - make it accessible to JavaScript
                secure: false, // Set to true in production (HTTPS)
                sameSite: 'lax' // Adjust as needed
            });

            console.log('[Session API] Setting test cookie'); //ADD THIS LINE

            return res;
        }

        const responseBody = {
            user: {
                id: session.user.id,
                name: session.user.user_metadata?.full_name || null,
                email: session.user.email,
                image: session.user.user_metadata?.avatar_url || null
            },
            expires: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        };

        console.log('[Session API] Session found:', responseBody);
        return new NextResponse(JSON.stringify(responseBody), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Unexpected error in session API:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}