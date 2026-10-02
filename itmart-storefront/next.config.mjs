/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // don't advertise "Next.js" in every response

  // Security headers on every page (see SECURITY.md). HTTPS-only (HSTS) is
  // added by the Nginx server in front, once the site has its certificate.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Other sites can't show your shop inside a frame (anti-clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Browsers must not guess file types (blocks disguised scripts)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Other sites only learn "itmart…" sent the visitor, not the full page
          // address — still enough for Facebook/Google ad attribution
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The shop never needs the camera, microphone or location
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

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
