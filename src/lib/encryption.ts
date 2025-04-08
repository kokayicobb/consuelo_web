// src/lib/encryption.ts
import crypto from 'crypto';

// Get encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn(
    'Warning: ENCRYPTION_KEY environment variable is missing or too short. ' +
    'It should be at least 32 characters long for secure encryption.'
  );
}

// Standardize the key to 32 bytes (256 bits)
const getStandardizedKey = (): Buffer => {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set');
  }
  
  // If key is shorter than 32 bytes, use a hash function to derive a 32-byte key
  if (Buffer.from(ENCRYPTION_KEY).length < 32) {
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  }
  
  // If key is longer than 32 bytes, truncate it
  return Buffer.from(ENCRYPTION_KEY).slice(0, 32);
};

// Encrypt a string
export async function encrypt(text: string): Promise<string> {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-CBC
  const key = getStandardizedKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Combine IV and encrypted data
  // Format: IV:EncryptedData
  return `${iv.toString('base64')}:${encrypted}`;
}

// Decrypt a string
export async function decrypt(encryptedText: string): Promise<string> {
  // Split the IV and encrypted data
  const [ivBase64, encryptedData] = encryptedText.split(':');
  
  if (!ivBase64 || !encryptedData) {
    throw new Error('Invalid encrypted text format');
  }
  
  // Convert IV back to Buffer
  const iv = Buffer.from(ivBase64, 'base64');
  
  // Create decipher
  const key = getStandardizedKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Generate a secure random string
export function generateSecureString(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}