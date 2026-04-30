import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose the backend API URL to client-side code
  // Set NEXT_PUBLIC_API_URL in Vercel Environment Variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  // Use Turbopack (default in Next.js 16)
  turbopack: {},
  // Exclude backend folder from output file tracing
  outputFileTracingExcludes: {
    '*': ['app/backend/**'],
  },
};

export default nextConfig;
