import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  /* config options here */
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
