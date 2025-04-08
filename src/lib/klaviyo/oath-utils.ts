// src/lib/klaviyo/oauth-utils.ts
import crypto from 'crypto';

// PKCE (Proof Key for Code Exchange) utilities
export const generateCodeVerifier = (): string => {
  // Generate a random string between 43-128 characters
  const verifierBytes = crypto.randomBytes(32);
  return verifierBytes.toString('base64url');
};

export const generateCodeChallenge = (codeVerifier: string): string => {
  // S256 method: SHA-256 hash of the code verifier
  const challengeBytes = crypto.createHash('sha256').update(codeVerifier).digest();
  return challengeBytes.toString('base64url');
};

// Base64 encode the client ID and secret for Basic Auth
export const generateBasicAuthHeader = (clientId: string, clientSecret: string): string => {
  const credentials = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, [...buffer]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
// Constants for Klaviyo OAuth endpoints
export const KLAVIYO_ENDPOINTS = {
  AUTHORIZE: 'https://www.klaviyo.com/oauth/authorize',
  TOKEN: 'https://a.klaviyo.com/oauth/token',
  REVOKE: 'https://a.klaviyo.com/oauth/revoke'
};

// Types for OAuth tokens and responses
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface KlaviyoAccount {
  id: string;
  storeId?: string;
  userId: string;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scopes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Calculate token expiration date
export const calculateExpirationDate = (expiresIn: number): Date => {
  return new Date(Date.now() + expiresIn * 1000);
};

// Format scope string for OAuth request
export const formatScopes = (scopes: string[]): string => {
  return scopes.join(' ');
};

// Check if token is expired or will expire soon (within 5 minutes)
export const isTokenExpiredOrExpiringSoon = (expiresAt: Date): boolean => {
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return new Date(expiresAt.getTime() - bufferTime) <= new Date();
};

// Parse the expiration time from the token response
export const parseTokenExpiration = (tokenResponse: TokenResponse): Date => {
  return new Date(Date.now() + tokenResponse.expires_in * 1000);
};