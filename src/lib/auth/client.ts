// src/lib/workos/client.ts
import { WorkOS } from '@workos-inc/node';

if (!process.env.WORKOS_API_KEY) {
  throw new Error('WORKOS_API_KEY environment variable is required');
}

if (!process.env.WORKOS_CLIENT_ID) {
  throw new Error('WORKOS_CLIENT_ID environment variable is required');
}

// Initialize WorkOS client
export const workos = new WorkOS(process.env.WORKOS_API_KEY, {
  clientId: process.env.WORKOS_CLIENT_ID,
});

// WorkOS configuration
export const WORKOS_CONFIG = {
  clientId: process.env.WORKOS_CLIENT_ID,
  clientSecret: process.env.WORKOS_CLIENT_SECRET,
  redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
  cookieName: 'workos-session',
  cookiePassword: process.env.WORKOS_COOKIE_PASSWORD || 'your-32-character-secret-key-here',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

// Helper function to create user
export async function createWorkOSUser(email: string, password: string) {
  try {
    const user = await workos.userManagement.createUser({
      email,
      password,
      emailVerified: false,
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Helper to authenticate user with password
export async function authenticateWithPassword(email: string, password: string, ipAddress?: string, userAgent?: string) {
  try {
    const authResponse = await workos.userManagement.authenticateWithPassword({
      clientId: WORKOS_CONFIG.clientId,
      email,
      password,
      ipAddress,
      userAgent,
    });

    return authResponse;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

// Helper to refresh session using refresh token
export async function refreshSession(refreshToken: string) {
  try {
    const authResponse = await workos.userManagement.authenticateWithRefreshToken({
      clientId: WORKOS_CONFIG.clientId,
      refreshToken,
    });

    return authResponse;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
}

// Helper to send password reset email
export async function sendPasswordResetEmail(email: string) {
  try {
    const passwordReset = await workos.userManagement.sendPasswordResetEmail({
      email,
      passwordResetUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });
    return passwordReset;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Helper to reset password
export async function resetPassword(token: string, newPassword: string) {
  try {
    const result = await workos.userManagement.resetPassword({
      token,
      newPassword,
    });

    return result;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

// Helper to update user password
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const user = await workos.userManagement.updateUser({
      userId,
      password: newPassword,
    });

    return user;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

// Helper to get logout URL
export function getLogoutUrl(sessionId: string, returnTo?: string) {
  try {
    const logoutUrl = workos.userManagement.getLogoutUrl({
      sessionId,
      returnTo,
    });

    return logoutUrl;
  } catch (error) {
    console.error('Error getting logout URL:', error);
    throw error;
  }
}

// Session management using WorkOS sealed sessions
export async function loadSealedSession(sessionData: string) {
  try {
    const session = await workos.userManagement.loadSealedSession({
      sessionData,
      cookiePassword: WORKOS_CONFIG.cookiePassword,
    });

    return session;
  } catch (error) {
    console.error('Error loading sealed session:', error);
    return null;
  }
}

// Authenticate with session cookie
export async function authenticateWithSessionCookie(sessionData: string) {
  try {
    const authResult = await workos.userManagement.authenticateWithSessionCookie({
      sessionData,
      cookiePassword: WORKOS_CONFIG.cookiePassword,
    });

    return authResult;
  } catch (error) {
    console.error('Error authenticating with session cookie:', error);
    return { authenticated: false, reason: 'invalid_session_cookie' };
  }
}

// Refresh and seal session data
export async function refreshAndSealSessionData(sessionData: string) {
  try {
    const refreshResult = await workos.userManagement.refreshAndSealSessionData({
      sessionData,
      cookiePassword: WORKOS_CONFIG.cookiePassword,
    });

    return refreshResult;
  } catch (error) {
    console.error('Error refreshing and sealing session data:', error);
    return { authenticated: false, reason: 'invalid_session_cookie' };
  }
}