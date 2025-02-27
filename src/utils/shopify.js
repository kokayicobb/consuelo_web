// In utils/shopify.js
import crypto from 'crypto';

export function verifyShopifyWebhook(rawBody, hmacHeader) {
  // If no HMAC header, this isn't from Shopify
  if (!hmacHeader) return false;
  
  const shopifySecret = process.env.SHOPIFY_API_SECRET;
  
  // Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', shopifySecret)
    .update(rawBody, 'utf8')
    .digest('base64');
  
  // Compare calculated HMAC with header
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(hmacHeader)
  );
}