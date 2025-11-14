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
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
  // 本番ビルド最適化
  compress: true,
  poweredByHeader: false,
  // React最適化
  reactStrictMode: true,
};

export default nextConfig;
