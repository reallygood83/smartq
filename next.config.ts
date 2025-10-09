import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 시 ESLint 오류를 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류를 무시
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-slot', '@radix-ui/react-accordion']
  },
  // Vercel 배포 최적화
  compress: true,
  poweredByHeader: false,
  // Static 파일 최적화
  images: {
    unoptimized: false,
    remotePatterns: []
  }
};

export default nextConfig;
