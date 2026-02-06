import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack can incorrectly infer a nested workspace root (e.g. ./app).
  // Pin the root to the actual Next project directory.
  turbopack: {
    root: __dirname,
  },

  // Enable React's strict mode in development to surface potential SSR/hydration issues early
  reactStrictMode: true,

  // 기존 .next/trace 파일 권한 문제를 피하기 위해 출력 디렉터리를 변경합니다.
  // distDir: "build",
  // MUI SSR 문제 해결을 위한 웹팩 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
