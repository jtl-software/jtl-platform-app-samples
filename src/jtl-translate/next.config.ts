import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // configure our custom ngrok public domain for CORS in the next dev server
  allowedDevOrigins: process.env.NGROK_DOMAIN ? [process.env.NGROK_DOMAIN] : [],
  serverExternalPackages: ['@ngrok/ngrok'],
};

export default nextConfig;
