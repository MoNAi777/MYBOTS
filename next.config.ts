import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add experimental configuration to ensure API routes work correctly
  experimental: {
    serverComponentsExternalPackages: [],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'mybots-cdue-seven.vercel.app']
    },
  },
  // Add rewrites to ensure API routes are properly handled
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
