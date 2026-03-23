import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8082/api/:path*", // ✅ adm 백엔드 주소로 변경
      },
    ];
  },
};

export default nextConfig;
