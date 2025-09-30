/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@radix-ui/react-dropdown-menu'],
  serverExternalPackages: ['@workos-inc/authkit-nextjs', 'https-proxy-agent', 'gaxios', 'google-auth-library', 'twilio', 'jsonwebtoken'],
  experimental: {},
  webpack: (config, { isServer }) => {
    // Add ESM resolution fix for server-side
    if (isServer) {
      config.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx'],
      };
      
      // Add alias for next/cache module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/cache$': 'next/dist/server/lib/incremental-cache/index.js',
      };
    }
    
    // Keep your existing client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        dns: false,
        ioredis: false,
        'https-proxy-agent': false,
        'http-proxy-agent': false,
        'gaxios': false,
        'google-auth-library': false,
        'twilio': false,
        'jsonwebtoken': false,
      };
    }
    
    // Add rule to handle .mjs files properly
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.fashn.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.loom.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Disable trailing slash redirects
  trailingSlash: false,

  // Proxy calls to microservice
  async rewrites() {
    return [
      {
        source: '/calls/:path*',
        destination: 'https://calls.consuelohq.com/:path*',
      },
    ];
  },
  
  // Security and CORS headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.googletagmanager.com *.google-analytics.com *.clerk.accounts.dev clerk.consuelohq.com *.posthog.com us-assets.i.posthog.com va.vercel-scripts.com *.vercel-scripts.com consuelohq.com *.loom.com *.vimeo.com challenges.cloudflare.com *.hcaptcha.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com challenges.cloudflare.com *.hcaptcha.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' *.stripe.com *.supabase.co *.sanity.io *.fashn.ai *.groq.com *.clerk.accounts.dev *.posthog.com us-assets.i.posthog.com va.vercel-scripts.com wss: https: challenges.cloudflare.com *.hcaptcha.com; frame-src 'self' *.stripe.com *.loom.com *.vimeo.com challenges.cloudflare.com *.hcaptcha.com; media-src 'self' *.sanity.io *.loom.com *.vimeo.com blob:; object-src 'none'; base-uri 'self'; form-action 'self'; webgl 'self'; worker-src 'self' blob:;"
          },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS Protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer Policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS (only for HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
          // No Permissions Policy - allow all browser features including Topics API for marketing
        ]
      },
      {
        source: '/api/try-on',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-api-key' },
          { key: 'Access-Control-Max-Age', value: '86400' }
        ]
      },
      {
        // Also apply to paths with trailing slash just in case
        source: '/api/try-on/',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-api-key' },
          { key: 'Access-Control-Max-Age', value: '86400' }
        ]
      }
    ];
  }
}

module.exports = nextConfig