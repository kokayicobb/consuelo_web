/** @type {import('next').NextConfig} */
const nextConfig = {
   transpilePackages: ['@radix-ui/react-dropdown-menu'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.fashn.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable trailing slash redirects
  trailingSlash: false,
  // Add CORS headers
  async headers() {
    return [
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