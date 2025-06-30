// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createWorkOSUser, authenticateWithPassword, WORKOS_CONFIG } from '@/lib/auth/client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for security
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      // Create user in WorkOS
      const newUser = await createWorkOSUser(email, password);

      // Immediately authenticate the new user to get tokens
      const authResponse = await authenticateWithPassword(
        email,
        password,
        ipAddress,
        userAgent
      );

      if (!authResponse.user) {
        return NextResponse.json(
          { message: 'User created but authentication failed' },
          { status: 500 }
        );
      }

      // Store session data securely
      const sessionData = {
        userId: authResponse.user.id,
        email: authResponse.user.email,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        organizationId: authResponse.organizationId,
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour
      };

      // Set secure session cookie with session data
      const cookieStore = cookies();
      cookieStore.set(WORKOS_CONFIG.cookieName, JSON.stringify(sessionData), {
        ...WORKOS_CONFIG.cookieOptions,
        expires: new Date(sessionData.expiresAt),
      });

      // Transform user data to match expected interface
      const user = {
        id: authResponse.user.id,
        email: authResponse.user.email,
        firstName: authResponse.user.firstName,
        lastName: authResponse.user.lastName,
        emailVerified: authResponse.user.emailVerified,
        createdAt: authResponse.user.createdAt,
        updatedAt: authResponse.user.updatedAt,
      };

      // Create session object to match expected interface
      const session = {
        access_token: authResponse.accessToken,
        refresh_token: authResponse.refreshToken,
        expires_at: Math.floor(sessionData.expiresAt / 1000),
        user,
      };

      return NextResponse.json({
        user,
        session,
        message: 'Account created successfully',
      });

    } catch (authError: any) {
      console.error('Authentication after signup error:', authError);
      
      // If authentication fails but user was created, still return success
      // User can sign in normally afterwards
      return NextResponse.json({
        user: null,
        session: null,
        message: 'Account created successfully. Please sign in.',
      });
    }

  } catch (error: any) {
    console.error('Sign-up error:', error);

    // Handle specific WorkOS errors
    if (error.code === 'email_already_exists' || error.message?.includes('already exists')) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error.code === 'invalid_email') {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (error.code === 'password_too_weak') {
      return NextResponse.json(
        { message: 'Password is too weak. Please choose a stronger password.' },
        { status: 400 }
      );
    }

    if (error.code === 'email_verification_required') {
      return NextResponse.json(
        { 
          message: 'Please verify your email address to complete registration',
          code: 'email_verification_required',
          email: error.email,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}