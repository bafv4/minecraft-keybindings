import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sessionserver.mojang.com',
      },
      {
        protocol: 'https',
        hostname: 'textures.minecraft.net',
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
  // コンパイラ最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
