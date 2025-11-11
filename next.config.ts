import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crafatar.com',
      },
      {
        protocol: 'https',
        hostname: 'sessionserver.mojang.com',
      },
    ],
  },
};

export default nextConfig;
