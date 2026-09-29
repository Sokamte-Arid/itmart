/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
    // Next.js 16 blocks its image optimizer from fetching images off any
    // "private" IP address (SSRF protection) — this includes localhost,
    // which is exactly where our backend runs in development. Safe to
    // allow here since it's our own machine; in production the backend
    // will be on a real public domain, so this won't matter there.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
