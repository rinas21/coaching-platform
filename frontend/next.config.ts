import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

const projectRoot = path.join(__dirname, "..");
loadEnvConfig(projectRoot);

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337" },
      { protocol: "http", hostname: "127.0.0.1", port: "1337" },
      { protocol: "https", hostname: "**.thesafespaceglobal.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
    localPatterns: [
      {
        pathname: '/api/image-proxy/**',
      },
      {
        pathname: '/api/image-proxy',
      },
      {
        pathname: '/assets/images/**',
      },
      {
        pathname: '/_next/static/media/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
};

export default nextConfig;
