// src/lib/auth/auth-provider.tsx
'use client';

// For AuthKit NextJS, we don't need to import anything from the package on the client side
// All authentication is handled by middleware and server components
// This is just a simple wrapper that doesn't import any WorkOS code

export function WorkOSAuthProvider({ children }: { children: React.ReactNode }) {
  // No WorkOS imports here - they should only be used in server components
  return <>{children}</>;
}

// Client-side auth utilities (if needed)
export function useAuthRedirect() {
  const redirectToLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const redirectToSignup = () => {
    window.location.href = '/api/auth/login?screen_hint=sign-up';
  };

  return { redirectToLogin, redirectToSignup };
}